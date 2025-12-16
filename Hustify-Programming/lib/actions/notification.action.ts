"use server";

import { db } from "@/firebase/admin";
import { getCurrentUser } from "./auth.action";
import { Notification } from "@/types";
import { revalidatePath } from "next/cache";

/**
 * Get all notifications for the current user
 */
export async function getNotificationsForUser(): Promise<Notification[]> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return [];
    }

    const notificationsSnapshot = await db
      .collection("notifications")
      .where("userId", "==", user.id)
      .orderBy("createdAt", "desc")
      .get();

    if (notificationsSnapshot.empty) {
      return [];
    }

    const notifications = notificationsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Notification[];

    return notifications;

  } catch (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }
}

/**
 * Mark a specific notification as read
 */
export async function markNotificationAsRead(notificationId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, message: "User not authenticated" };
    }

    const notificationRef = db.collection("notifications").doc(notificationId);
    const notificationDoc = await notificationRef.get();

    if (!notificationDoc.exists || notificationDoc.data()?.userId !== user.id) {
      return { success: false, message: "Notification not found or permission denied" };
    }

    await notificationRef.update({ isRead: true });

    // Revalidate a path that shows the notification count, e.g., the root layout
    revalidatePath("/");

    return { success: true, message: "Notification marked as read" };

  } catch (error) {
    console.error("Error marking notification as read:", error);
    return { success: false, message: "Failed to mark notification as read" };
  }
}

