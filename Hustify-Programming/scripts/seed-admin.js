// Using CommonJS module syntax instead of ES modules
const admin = require("firebase-admin");
require("dotenv").config({ path: require("path").resolve(__dirname, "../.env.local") });

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  // Try to use environment variables first (recommended)
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      }),
    });
    console.log("✅ Initialized Firebase Admin using environment variables");
  } else {
    // Fallback to service account file
    try {
      const serviceAccount = require("../service-account.json");
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log("✅ Initialized Firebase Admin using service-account.json");
    } catch (error) {
      console.error("\n❌ Error: Could not initialize Firebase Admin");
      console.error("Please use one of the following methods:");
      console.error("\nMethod 1 (Recommended): Set environment variables in .env.local:");
      console.error("  FIREBASE_PROJECT_ID=your-project-id");
      console.error("  FIREBASE_CLIENT_EMAIL=your-service-account-email");
      console.error("  FIREBASE_PRIVATE_KEY=\"-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n\"");
      console.error("\nMethod 2: Create service-account.json file in project root");
      console.error("  Download it from: Firebase Console > Project Settings > Service Accounts");
      process.exit(1);
    }
  }
}

const db = admin.firestore();
const auth = admin.auth();

async function seedAdminData() {
  try {
    console.log("Starting admin seed data...");

    // 1. Create an admin user (you'll need to create this user in Firebase Auth first)
    // Get the user ID from Firebase Auth Console or create programmatically
    console.log("\n=== Step 1: Setting up admin user ===");
    console.log("NOTE: You need to create a user in Firebase Auth Console first.");
    console.log("Then update the ADMIN_USER_EMAIL below with that user's email.");
    
    const ADMIN_USER_EMAIL = "admin@hustify.com"; // Change this to your admin email
    
    let adminUserId;
    try {
      const adminUser = await auth.getUserByEmail(ADMIN_USER_EMAIL);
      adminUserId = adminUser.uid;
      console.log(`Found admin user: ${ADMIN_USER_EMAIL} (${adminUserId})`);
    } catch (error) {
      console.log(`\n⚠️  Admin user not found. Please create a user in Firebase Auth Console with email: ${ADMIN_USER_EMAIL}`);
      console.log("Then run this script again.\n");
      return;
    }

    // Check if admin user document exists
    const adminUserDoc = await db.collection("users").doc(adminUserId).get();
    
    if (adminUserDoc.exists) {
      // Update existing user to admin
      await db.collection("users").doc(adminUserId).update({
        userRole: "admin",
        status: "active",
        updatedAt: new Date().toISOString(),
      });
      console.log("✅ Updated existing user to admin role");
    } else {
      // Create new admin user document
      await db.collection("users").doc(adminUserId).set({
        name: "Admin User",
        email: ADMIN_USER_EMAIL,
        userRole: "admin",
        status: "active",
        darkmode: false,
        image: "",
        coverimg: "",
        phone: "",
        birthday: "",
        address: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      console.log("✅ Created admin user document");
    }

    // 2. Create some test users with different roles
    console.log("\n=== Step 2: Creating test users ===");
    
    const testUsers = [
      {
        email: "normal1@test.com",
        name: "Normal User 1",
        userRole: "normal",
        status: "active",
      },
      {
        email: "normal2@test.com",
        name: "Normal User 2",
        userRole: "normal",
        status: "active",
      },
      {
        email: "normal3@test.com",
        name: "Normal User 3 (Deactivated)",
        userRole: "normal",
        status: "deactivated",
      },
      {
        email: "hr1@test.com",
        name: "HR Recruiter 1",
        userRole: "hr",
        status: "active",
        companyId: "test-company-1",
      },
      {
        email: "hr2@test.com",
        name: "HR Recruiter 2",
        userRole: "hr",
        status: "active",
        companyId: "test-company-2",
      },
    ];

    console.log("Note: These are user documents only. You'll need to create Firebase Auth users separately.");
    console.log("Or use existing user IDs from your Firebase Auth Console.\n");

    // 3. Create sample blog posts for testing
    console.log("\n=== Step 3: Creating sample blog posts ===");
    
    const samplePosts = [
      {
        author: {
          id: adminUserId,
          name: "Admin User",
          image: "",
          title: "Administrator",
        },
        content: "This is a sample blog post created by the admin for testing purposes. It contains some content to demonstrate the blog post management functionality.",
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        location: "San Francisco, CA",
        likes: [adminUserId],
        comments: [
          {
            id: "comment-1",
            postId: "",
            author: {
              id: adminUserId,
              name: "Admin User",
              image: "",
            },
            content: "This is a test comment",
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ],
        url: "https://example.com",
        photo: "",
      },
      {
        author: {
          id: adminUserId,
          name: "Admin User",
          image: "",
          title: "Administrator",
        },
        content: "Another test post to verify pagination and filtering in the admin blog management interface.",
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
        location: "New York, NY",
        likes: [],
        comments: [],
        url: "",
        photo: "",
      },
      {
        author: {
          id: adminUserId,
          name: "Admin User",
          image: "",
          title: "Administrator",
        },
        content: "Testing the delete functionality. This post can be safely deleted during testing.",
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        location: "Remote",
        likes: [adminUserId, "user-1", "user-2"],
        comments: [
          {
            id: "comment-2",
            postId: "",
            author: {
              id: "user-1",
              name: "Test User",
              image: "",
            },
            content: "Great post!",
            timestamp: new Date().toISOString(),
          },
          {
            id: "comment-3",
            postId: "",
            author: {
              id: "user-2",
              name: "Another User",
              image: "",
            },
            content: "I agree with this.",
            timestamp: new Date().toISOString(),
          },
        ],
        url: "",
        photo: "",
      },
    ];

    const postRefs = [];
    for (const post of samplePosts) {
      const postRef = db.collection("posts").doc();
      const postData = {
        ...post,
        id: postRef.id,
      };
      // Update comment postIds
      postData.comments = postData.comments.map(comment => ({
        ...comment,
        postId: postRef.id,
      }));
      postRefs.push({ ref: postRef, data: postData });
    }

    await Promise.all(postRefs.map((item) => item.ref.set(item.data)));
    console.log(`✅ Created ${samplePosts.length} sample blog posts`);

    console.log("\n=== Seed completed successfully! ===");
    console.log("\n📋 Next Steps:");
    console.log("1. Sign in with the admin user:", ADMIN_USER_EMAIL);
    console.log("2. Navigate to /admin/dashboard");
    console.log("3. Test all admin functionalities:");
    console.log("   - View users at /admin/users");
    console.log("   - View blog posts at /admin/blogs");
    console.log("   - Test role changes");
    console.log("   - Test status changes");
    console.log("   - Test blog post deletion");
    console.log("\n✅ Admin seed data ready for testing!");
  } catch (error) {
    console.error("Error seeding admin data:", error);
  }
}

seedAdminData();

