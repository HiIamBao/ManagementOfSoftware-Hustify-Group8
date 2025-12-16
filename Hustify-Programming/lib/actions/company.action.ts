"use server";

import { db, auth } from "@/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { RegisterCompanyAndAdminParams, User, Company } from "@/types";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "./auth.action";

/**
 * Register a new company and its first admin user
 */
export async function registerCompanyAndAdmin(params: RegisterCompanyAndAdminParams) {
  const { userName, userEmail, password, companyName, companyIndustry, companyDescription } = params;

  try {
    // Check if a user with this email already exists
    try {
      await auth.getUserByEmail(userEmail);
      return { success: false, message: "A user with this email already exists." };
    } catch (error: any) {
      if (error.code !== 'auth/user-not-found') {
        throw error; // Re-throw unexpected auth errors
      }
      // If user is not found, we can proceed
    }

    const companyRef = db.collection("companies").doc();
    const userRef = db.collection("users").doc(); // We'll set the ID later from auth

    // Create the user in Firebase Auth first to get the UID
    const userRecord = await auth.createUser({
      email: userEmail,
      password: password,
      displayName: userName,
    });

    const newCompanyData = {
      id: companyRef.id,
      name: companyName,
      industry: companyIndustry || "",
      description: companyDescription || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      followerCount: 0,
      followers: [],
    };

    const newUserData = {
      uid: userRecord.uid,
      id: userRecord.uid, // Using uid as the document ID for consistency
      name: userName,
      email: userEmail,
      userRole: "company-admin",
      companyId: companyRef.id,
      createdAt: new Date().toISOString(),
    };

    // Use a batch write to ensure both documents are created successfully
    const batch = db.batch();
    batch.set(companyRef, newCompanyData);
    batch.set(db.collection("users").doc(userRecord.uid), newUserData);
    await batch.commit();

    revalidatePath("/sign-up"); // To update company list for HR sign-up

    return {
      success: true,
      message: "Company and admin account created successfully",
    };
  } catch (error) {
    console.error("Error registering company and admin:", error);
    return {
      success: false,
      message: "An error occurred during registration.",
    };
  }
}



/**
 * Get a list of all company names and IDs
 */
export async function getAllCompanyNames() {
  try {
    const companiesSnapshot = await db.collection("companies").select("name").get();
    const companies = companiesSnapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name,
    }));
    return { success: true, companies };
  } catch (error) {
    console.error("Error fetching company names:", error);
    return { success: false, companies: [] };
  }
}

/**
 * Follow or unfollow a company
 */
export async function toggleFollowCompany(companyId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, message: "You must be logged in to follow a company" };
    }

    const userRef = db.collection("users").doc(user.id);
    const companyRef = db.collection("companies").doc(companyId);

    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      return { success: false, message: "User not found" };
    }

    const userData = userDoc.data() as User;
    const isFollowing = (userData.followingCompanies || []).includes(companyId);

    const batch = db.batch();

    if (isFollowing) {
      // Unfollow logic
      batch.update(userRef, { followingCompanies: FieldValue.arrayRemove(companyId) });
      batch.update(companyRef, {
        followers: FieldValue.arrayRemove(user.id),
        followerCount: FieldValue.increment(-1),
      });
    } else {
      // Follow logic
      batch.update(userRef, { followingCompanies: FieldValue.arrayUnion(companyId) });
      batch.update(companyRef, {
        followers: FieldValue.arrayUnion(user.id),
        followerCount: FieldValue.increment(1),
      });
    }

    await batch.commit();

    revalidatePath(`/company/${companyId}`);
    revalidatePath(`/user/${user.id}/following`); // Assuming a page to view followed companies

    return { success: true, message: "Follow status updated" };
  } catch (error) {
    console.error("Error toggling follow company:", error);
    return { success: false, message: "Failed to update follow status" };
  }
}
