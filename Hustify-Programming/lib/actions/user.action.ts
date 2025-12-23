"use server";

import { db } from "@/firebase/admin";
import { getCurrentUser } from "./auth.action";
import { User } from "@/types";
import { revalidatePath } from "next/cache";

/**
 * Get the full profile of the current user, including preferences.
 * This is a wrapper around getCurrentUser but makes it explicit we are fetching the profile for feature usage.
 */
export async function getUserProfile(): Promise<User | null> {
    const user = await getCurrentUser();
    if (!user) return null;

    // In the future, we might want to fetch additional sub-collections or related data here
    // For now, getCurrentUser already fetches the user document which contains the new 'preferences' field
    return user;
}

/**
 * Update user preferences (Location, Job Type, Salary, etc.)
 */
export async function updateUserPreferences(userId: string, preferences: any) {
    try {
        await db.collection("users").doc(userId).update({
            preferences: preferences
        });

        revalidatePath("/profile");
        return { success: true, message: "Preferences updated successfully" };
    } catch (error) {
        console.error("Error updating preferences:", error);
        return { success: false, message: "Failed to update preferences" };
    }
}
