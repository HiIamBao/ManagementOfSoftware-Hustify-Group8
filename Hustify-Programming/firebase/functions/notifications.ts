import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

if (admin.apps.length === 0) {
  admin.initializeApp();
}

const db = admin.firestore();

type PostDoc = {
  authorId?: string;
  createdAt?: FirebaseFirestore.Timestamp;
  timestamp?: FirebaseFirestore.Timestamp;
  author?: {
    id?: string;
    name?: string;
  };
};

type ReactionDoc = {
  postId: string;
  userId: string;
  type: string; // like | comment | ...
  createdAt?: FirebaseFirestore.Timestamp;
};

async function getUserName(userId: string) {
  const u = await db.collection('users').doc(userId).get();
  const data: any = u.data();
  return data?.fullName || data?.name || 'Someone';
}

async function getAcceptedFriendIds(userId: string): Promise<string[]> {
  const snap = await db
    .collection('friendships')
    .where('participants', 'array-contains', userId)
    .where('status', '==', 'accepted')
    .get();

  return snap.docs
    .map((d) => d.data() as any)
    .map((f) => (f.userA === userId ? f.userB : f.userA));
}

function resolveAuthorId(post: PostDoc): string | undefined {
  return post.authorId || post.author?.id;
}

export const onPostCreatedNotifyFriends = functions.firestore
  .document('posts/{postId}')
  .onCreate(async (snap, ctx) => {
    const postId = ctx.params.postId as string;
    const post = snap.data() as PostDoc;

    const authorId = resolveAuthorId(post);
    if (!authorId) return;

    const authorName = await getUserName(authorId);
    const friendIds = await getAcceptedFriendIds(authorId);
    if (friendIds.length === 0) return;

    const batch = db.batch();
    for (const fid of friendIds) {
      const ref = db.collection('notifications').doc();
      batch.set(ref, {
        userId: fid,
        message: `${authorName} created a new post.`,
        link: `/posts/${postId}`,
        isRead: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        type: 'friend_post',
        actorId: authorId,
        postId,
      });
    }
    await batch.commit();
  });

export const onReactionCreatedNotifyAuthor = functions.firestore
  .document('reactions/{reactionId}')
  .onCreate(async (snap) => {
    const reaction = snap.data() as ReactionDoc;
    if (!reaction?.postId || !reaction?.userId) return;

    // NOTE: This trigger requires that reactions are written into a top-level
    // `reactions` collection with { postId, userId, type }.
    const postSnap = await db.collection('posts').doc(reaction.postId).get();
    if (!postSnap.exists) return;

    const post = postSnap.data() as PostDoc;
    const authorId = resolveAuthorId(post);
    if (!authorId) return;

    // Only notify if reactor is a friend of the author
    const friendsOfAuthor = await getAcceptedFriendIds(authorId);
    if (!friendsOfAuthor.includes(reaction.userId)) return;

    const reactorName = await getUserName(reaction.userId);
    const verb = reaction.type === 'comment' ? 'commented on' : 'liked';

    await db.collection('notifications').add({
      userId: authorId,
      message: `${reactorName} ${verb} your post.`,
      link: `/posts/${reaction.postId}`,
      isRead: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      type: 'friend_reaction',
      actorId: reaction.userId,
      postId: reaction.postId,
    });
  });

