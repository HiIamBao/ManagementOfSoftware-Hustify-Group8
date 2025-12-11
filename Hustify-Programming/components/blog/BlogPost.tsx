"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Heart,
  MessageCircle,
  MoreHorizontal,
  X,
  Pencil,
  Trash,
  Share2,
  Link,
  Facebook,
  Repeat2,
} from "lucide-react";

import { formatDistanceToNow } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { cn, processUrl } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import {
  toggleLike,
  addComment,
  editComment,
  deleteComment,
  repostPost,
} from "@/lib/actions/blog.action";
import type { BlogPost as BlogPostType, BlogComment } from "@/types/blog";
import { StickyFooter } from "./StickyFooter";

interface BlogPostProps extends BlogPostType {
  currentUser: {
    id: string;
    name: string;
    image: string;
  };
  onEdit: (postId: string, newContent: string, url?: string) => void;
  onDelete: (postId: string) => void;
  onLikeToggle: (postId: string, newLikes: string[]) => void;
  onCommentAdd: (postId: string, newComment: BlogComment) => void;
  onCommentEdit: (
    postId: string,
    commentId: string,
    updatedComment: BlogComment
  ) => void;
  onCommentDelete: (postId: string, commentId: string) => void;
}

export function BlogPost({
  id,
  author,
  content,
  url,
  photo,
  timestamp,
  likes,
  comments,
  reposts = [],
  originalPost,
  currentUser,
  onEdit,
  onDelete,
  onLikeToggle,
  onCommentAdd,
  onCommentEdit,
  onCommentDelete,
}: BlogPostProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const [editedUrl, setEditedUrl] = useState(url || "");
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingComment, setEditingComment] = useState<{
    id: string;
    content: string;
  } | null>(null);
  const [showShareTooltip, setShowShareTooltip] = useState(false);
  const [showRepostDialog, setShowRepostDialog] = useState(false);
  const [repostContent, setRepostContent] = useState("");

  const handleEdit = () => {
    setEditedContent(content);
    setEditedUrl(url || "");
    setShowEditDialog(true);
  };

  const router = useRouter();

  const navigateToUserProfile = (userId: string) => {
    router.push(`/user/${userId}`);
  };

  const handleSaveEdit = () => {
    const processedUrl = processUrl(editedUrl);
    onEdit(id, editedContent, processedUrl);
    setShowEditDialog(false);
  };

  const handleLike = async () => {
    try {
      // Optimistic update
      const newLikes = [...likes];
      const userIndex = newLikes.indexOf(currentUser.id);

      if (userIndex === -1) {
        newLikes.push(currentUser.id);
      } else {
        newLikes.splice(userIndex, 1);
      }

      // Update UI immediately with optimistic data
      onLikeToggle(id, newLikes);

      // Make API call in background
      const serverLikes = await toggleLike(id, currentUser.id);

      // If server response is different from our optimistic update,
      // update UI with server data
      if (JSON.stringify(serverLikes) !== JSON.stringify(newLikes)) {
        onLikeToggle(id, serverLikes);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      // Revert optimistic update on error
      onLikeToggle(id, likes);
    }
  };

  const handleAddComment = async () => {
    if (newComment.trim()) {
      const commentContent = newComment.trim();
      try {
        // Create optimistic comment
        const optimisticComment: BlogComment = {
          id: `temp-${Date.now()}`, // Temporary ID
          postId: id,
          author: {
            id: currentUser.id,
            name: currentUser.name,
            image: currentUser.image,
          },
          content: commentContent,
          timestamp: new Date().toISOString(),
        };

        // Update UI immediately
        onCommentAdd(id, optimisticComment);

        // Clear input
        setNewComment("");

        // Make API call in background
        const result = await addComment({
          postId: id,
          userId: currentUser.id,
          userName: currentUser.name,
          userImage: currentUser.image,
          content: commentContent,
        });

        // Update UI with server response
        onCommentAdd(id, result.comment);
      } catch (error) {
        console.error("Error adding comment:", error);
        // In case of error, you might want to:
        // 1. Show an error message to the user
        // 2. Revert the optimistic update
        // 3. Restore the comment text in the input
        setNewComment(commentContent);
      }
    }
  };

  const handleEditComment = async (commentId: string, content: string) => {
    try {
      const result = await editComment({
        postId: id,
        commentId,
        userId: currentUser.id,
        content,
      });
      onCommentEdit(id, commentId, result.comment);
      setEditingComment(null);
    } catch (error) {
      console.error("Error editing comment:", error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteComment({
        postId: id,
        commentId,
        userId: currentUser.id,
      });
      onCommentDelete(id, commentId);
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const handleCopyLink = () => {
    // For now, just copy a dummy URL. This will be replaced with actual URL later
    const dummyUrl = `https://hustify.com/posts/${id}`;
    navigator.clipboard.writeText(dummyUrl);
    setShowShareTooltip(true);
    setTimeout(() => setShowShareTooltip(false), 1000);
  };

  const handleFacebookShare = () => {
    // For now, just log. This will be replaced with actual Facebook share implementation
    console.log("Share to Facebook clicked");
  };

  const handleZaloShare = () => {
    // For now, just log. This will be replaced with actual Zalo share implementation
    console.log("Share to Zalo clicked");
  };

  const handleRepost = async () => {
    try {
      const newReposts = [...reposts];
      const userIndex = newReposts.indexOf(currentUser.id);

      if (userIndex === -1) {
        setShowRepostDialog(true);
      } else {
        newReposts.splice(userIndex, 1);
        // Update reposts count using server action
        await repostPost({
          postId: id,
          userId: currentUser.id,
          userName: currentUser.name,
          userImage: currentUser.image,
          content: "",
        });
      }
    } catch (error) {
      console.error("Error toggling repost:", error);
    }
  };

  const handleConfirmRepost = async () => {
    try {
      await repostPost({
        postId: id,
        userId: currentUser.id,
        userName: currentUser.name,
        userImage: currentUser.image,
        content: repostContent,
      });

      setShowRepostDialog(false);
      setRepostContent("");

      // Refresh the page to show the new repost
      window.location.reload();
    } catch (error) {
      console.error("Error creating repost:", error);
    }
  };

  const isAuthor = author.id === currentUser.id;
  const timeAgo = formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  const isLiked = likes.includes(currentUser.id);
  const isReposted = reposts.includes(currentUser.id);

  return (
    <>
      <div className="space-y-4 w-full">
        {/* Author Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar
              className="cursor-pointer"
              onClick={() => navigateToUserProfile(author.id)}
            >
              <AvatarImage src={author.image} alt={author.name} />
              <AvatarFallback>{author.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h3
                className="font-semibold cursor-pointer hover:underline"
                onClick={() => navigateToUserProfile(author.id)}
              >
                {author.name}
              </h3>
              <p className="text-sm text-muted-foreground">{author.title}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">{timeAgo}</span>
            {isAuthor && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleEdit}>
                    Edit Post
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDelete(id)}
                    className="text-destructive"
                  >
                    Delete Post
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {originalPost && (
            <div className="bg-muted/50 p-4 rounded-lg border border-border">
              <div className="flex items-center gap-2 mb-2">
                <Avatar
                  className="h-6 w-6 cursor-pointer"
                  onClick={() => navigateToUserProfile(originalPost.author.id)}
                >
                  <AvatarImage
                    src={originalPost.author.image}
                    alt={originalPost.author.name}
                  />
                  <AvatarFallback>{originalPost.author.name[0]}</AvatarFallback>
                </Avatar>
                <span
                  className="text-sm font-medium cursor-pointer hover:underline"
                  onClick={() => navigateToUserProfile(originalPost.author.id)}
                >
                  {originalPost.author.name}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {originalPost.content}
              </p>
            </div>
          )}
          {content && (
            <p className="text-foreground whitespace-pre-wrap">{content}</p>
          )}

          {url && (
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline break-all line-clamp-1"
              >
                {url}
              </a>
            </div>
          )}

          {photo && (
            <div className="relative w-full bg-muted rounded-lg overflow-hidden">
              <img
                src={photo}
                alt="Post attachment"
                className="w-full h-auto max-h-[500px] object-contain"
                loading="lazy"
              />
            </div>
          )}
        </div>

        {/* Separator */}
        <div className="w-full h-[1px] bg-gray-200 my-4" />

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-8 w-full justify-center">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 px-4"
              onClick={handleLike}
            >
              <Heart
                className={cn(
                  "h-5 w-5 transition-colors",
                  isLiked
                    ? "fill-red-500 text-red-500"
                    : "text-muted-foreground"
                )}
              />
              <span
                className={cn(
                  "text-sm",
                  isLiked ? "text-red-500" : "text-muted-foreground"
                )}
              >
                {likes.length} Likes
              </span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 px-4"
              onClick={() => setShowComments(true)}
            >
              <MessageCircle className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {comments.length} Comments
              </span>
            </Button>

            {/* Repost Button */}
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 px-4"
              onClick={handleRepost}
            >
              <Repeat2
                className={cn(
                  "h-5 w-5 transition-colors",
                  isReposted ? "text-green-500" : "text-muted-foreground"
                )}
              />
              <span
                className={cn(
                  "text-sm",
                  isReposted ? "text-green-500" : "text-muted-foreground"
                )}
              >
                {reposts.length} Reposts
              </span>
            </Button>

            {/* Share Button with Dropdown */}
            <div className="relative">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2 px-4"
                  >
                    <Share2 className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Share</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-[200px]">
                  <DropdownMenuItem
                    onClick={handleFacebookShare}
                    className="cursor-pointer hover:bg-muted"
                  >
                    <div className="flex items-center gap-2 py-0.5">
                      <Facebook className="h-4 w-4 text-[#1877F2]" />
                      <span>Share to Facebook</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleZaloShare}
                    className="cursor-pointer hover:bg-muted"
                  >
                    <div className="flex items-center gap-2 py-0.5">
                      <svg
                        className="h-4 w-4"
                        viewBox="0 0 50 50"
                        fill="#0068FF"
                      >
                        <path d="M25,2C12.3,2,2,12.3,2,25s10.3,23,23,23s23-10.3,23-23S37.7,2,25,2z M35.8,31.9c-0.2,0.3-0.4,0.5-0.7,0.7 c-2.5,1.9-5.7,2.9-9.2,2.9c-3.6,0-6.7-0.9-9.2-2.9c-0.3-0.2-0.5-0.4-0.7-0.7c-0.2-0.3-0.4-0.5-0.4-0.8c0-0.3,0.1-0.6,0.4-0.8 c0.2-0.3,0.4-0.5,0.7-0.7c2.5-1.9,5.7-2.9,9.2-2.9c3.6,0,6.7,0.9,9.2,2.9c0.3,0.2,0.5,0.4,0.7,0.7c0.2,0.3,0.4,0.5,0.4,0.8 C36.2,31.4,36,31.7,35.8,31.9z" />
                      </svg>
                      <span>Share to Zalo</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleCopyLink}
                    className="cursor-pointer hover:bg-muted"
                  >
                    <div className="flex items-center gap-2 py-0.5">
                      <Link className="h-4 w-4" />
                      <span>Copy Link</span>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Copy Success Tooltip */}
              {showShareTooltip && (
                <div className="absolute left-1/2 -translate-x-1/2 -bottom-8 whitespace-nowrap px-2 py-1 bg-[#9FC87E] text-white text-xs rounded shadow-lg animate-in fade-in slide-in-from-top-1">
                  Link copied to clipboard!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Post</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <Textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="min-h-[150px]"
              placeholder="What's on your mind?"
            />
            <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 border border-input rounded-md">
              <input
                type="text"
                placeholder="Add or edit URL (optional)"
                value={editedUrl}
                onChange={(e) => setEditedUrl(e.target.value)}
                className="flex-1 bg-transparent border-none focus:outline-none text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              className="px-8 bg-[#B10000] hover:bg-[#B10000]/90"
            >
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Comments Dialog */}
      <Dialog open={showComments} onOpenChange={setShowComments}>
        <DialogContent className="sm:max-w-[700px] h-[75vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-xl">Comments</DialogTitle>
          </DialogHeader>
          <div className="flex-1 py-4 space-y-4 overflow-y-auto">
            {comments.map((comment) => (
              <div key={comment.id} className="flex space-x-3">
                <Avatar
                  className="h-8 w-8 cursor-pointer"
                  onClick={() => navigateToUserProfile(comment.author.id)}
                >
                  <AvatarImage
                    src={comment.author.image}
                    alt={comment.author.name}
                  />
                  <AvatarFallback>{comment.author.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="bg-muted p-3 rounded-lg">
                    <div className="flex justify-between items-start mb-1">
                      <span
                        className="font-semibold text-sm cursor-pointer hover:underline"
                        onClick={() => navigateToUserProfile(comment.author.id)}
                      >
                        {comment.author.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(comment.timestamp), {
                            addSuffix: true,
                          })}
                        </span>
                        {comment.author.id === currentUser.id && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                              >
                                <MoreHorizontal className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="w-[160px]"
                            >
                              <DropdownMenuItem
                                onClick={() =>
                                  setEditingComment({
                                    id: comment.id,
                                    content: comment.content,
                                  })
                                }
                              >
                                <Pencil className="mr-2 h-3.5 w-3.5" />
                                Edit Comment
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDeleteComment(comment.id)}
                                className="text-destructive"
                              >
                                <Trash className="mr-2 h-3.5 w-3.5" />
                                Delete Comment
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                    {editingComment?.id === comment.id ? (
                      <div className="space-y-2">
                        <Textarea
                          value={editingComment.content}
                          onChange={(e) =>
                            setEditingComment({
                              ...editingComment,
                              content: e.target.value,
                            })
                          }
                          className="min-h-[60px] text-sm"
                        />
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingComment(null)}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={() =>
                              handleEditComment(
                                comment.id,
                                editingComment.content
                              )
                            }
                            disabled={
                              !editingComment.content.trim() ||
                              editingComment.content === comment.content
                            }
                          >
                            Save
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm">{comment.content}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {comments.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                No comments yet. Be the first to comment!
              </div>
            )}
          </div>
          <Separator className="my-4" />
          <div className="flex items-start space-x-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={currentUser.image} alt={currentUser.name} />
              <AvatarFallback>{currentUser.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 flex space-x-2">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="min-h-[80px] flex-1"
              />
              <Button
                className="px-8 bg-[#B10000] hover:bg-[#B10000]/90"
                onClick={handleAddComment}
                disabled={!newComment.trim()}
              >
                Post
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Repost Dialog */}
      <Dialog open={showRepostDialog} onOpenChange={setShowRepostDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Repost</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <Textarea
              value={repostContent}
              onChange={(e) => setRepostContent(e.target.value)}
              className="min-h-[150px]"
              placeholder="Add your thoughts (optional)"
            />
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Original post by {author.name}
              </p>
              <p className="text-sm mt-2">{content}</p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRepostDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmRepost}
              className="px-8 bg-[#B10000] hover:bg-[#B10000]/90"
            >
              Repost
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
