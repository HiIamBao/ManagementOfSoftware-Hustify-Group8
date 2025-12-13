"use server";

import { auth, db } from "@/firebase/admin";
import { SignInParams, SignUpParams, User } from "@/types";
import { cookies } from "next/headers";

// Session duration (1 week)
const SESSION_DURATION = 60 * 60 * 24 * 7;

// Set session cookie
export async function setSessionCookie(idToken: string) {
  const cookieStore = await cookies();

  // Create session cookie
  const sessionCookie = await auth.createSessionCookie(idToken, {
    expiresIn: SESSION_DURATION * 1000, // milliseconds
  });

  // Set cookie in the browser
  cookieStore.set("session", sessionCookie, {
    maxAge: SESSION_DURATION,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
  });
}

export async function signUp(params: SignUpParams) {
  const { uid, name, email, userRole = "normal", companyName } = params;

  try {
    // check if user exists in db
    const userRecord = await db.collection("users").doc(uid).get();
    if (userRecord.exists)
      return {
        success: false,
        message: "User already exists. Please sign in.",
      };

    let companyId: string | undefined;

    // If HR user, create company
    if (userRole === "hr" && companyName) {
      const companyRef = db.collection("companies").doc();
      companyId = companyRef.id;

      await companyRef.set({
        name: companyName,
        description: "",
        followers: 0,
        hrAdmins: [uid],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    // save user to db
    await db.collection("users").doc(uid).set({
      name,
      email,
      userRole,
      companyId,
      darkmode: false,
      status: "active",
      // profileURL,
      // resumeURL,
    });

    return {
      success: true,
      message: "Account created successfully. Please sign in.",
    };
  } catch (error: any) {
    console.error("Error creating user:", error);

    // Handle Firebase specific errors
    if (error.code === "auth/email-already-exists") {
      return {
        success: false,
        message: "This email is already in use",
      };
    }

    return {
      success: false,
      message: "Failed to create account. Please try again.",
    };
  }
}

export async function signIn(params: SignInParams) {
  const { email, idToken } = params;

  try {
    const userRecord = await auth.getUserByEmail(email);
    if (!userRecord)
      return {
        success: false,
        message: "User does not exist. Create an account.",
      };

    const userDoc = await db.collection("users").doc(userRecord.uid).get();
    if (!userDoc.exists)
      return {
        success: false,
        message: "User does not exist. Create an account.",
      };

    if (userDoc.data()?.status === "deactivated")
      return {
        success: false,
        message: "Account is deactivated. Please contact support.",
      };

    await setSessionCookie(idToken);
  } catch (error: any) {
    console.log("");

    return {
      success: false,
      message: "Failed to log into account. Please try again.",
    };
  }
}

// Sign out user by clearing the session cookie
export async function signOut() {
  const cookieStore = await cookies();

  cookieStore.delete("session");
}

// Get current user from session cookie
export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();

  const sessionCookie = cookieStore.get("session")?.value;
  if (!sessionCookie) return null;

  try {
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);

    // get user info from db
    const userRecord = await db
      .collection("users")
      .doc(decodedClaims.uid)
      .get();
    if (!userRecord.exists) return null;

    return {
      ...userRecord.data(),
      id: userRecord.id,
    } as User;
  } catch (error) {
    console.log(error);

    // Invalid or expired session
    return null;
  }
}

// Check if user is authenticated
export async function isAuthenticated() {
  const user = await getCurrentUser();
  return !!user;
}

export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.userRole === "admin";
}

export async function requireAdmin(): Promise<User> {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error("Unauthorized: Authentication required");
  }
  
  if (user.userRole !== "admin") {
    throw new Error("Unauthorized: Admin access required");
  }

  if (user.status === "deactivated") {
    throw new Error("Unauthorized: Account is deactivated");
  }
  
  return user;
}

