"use server";

import { db, auth } from "@/firebase/admin";
import { requireAdmin, getCurrentUser } from "./auth.action";
import { User } from "@/types";

export async function getAllUsers(params?: {
  page?: number;
  limit?: number;
  role?: "normal" | "hr" | "admin";
  status?: "active" | "deactivated";
}) {
  try {
    await requireAdmin();
    
    const page = params?.page || 1;
    const limit = params?.limit || 50;
    
    let query: FirebaseFirestore.Query = db.collection("users");
    
    // Apply filters
    if (params?.role) {
      query = query.where("userRole", "==", params.role);
    }
    if (params?.status) {
      query = query.where("status", "==", params.status);
    }
    
    const usersSnapshot = await query
      .limit(limit)
      .get();
    
    const users = usersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as User[];
    
    let countQuery: FirebaseFirestore.Query = db.collection("users");
    if (params?.role) {
      countQuery = countQuery.where("userRole", "==", params.role);
    }
    if (params?.status) {
      countQuery = countQuery.where("status", "==", params.status);
    }
    const totalSnapshot = await countQuery.count().get();
    const total = totalSnapshot.data().count;
    
    return {
      success: true,
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to fetch users",
    };
  }
}

export async function updateUserRole(
  userId: string,
  newRole: "normal" | "hr" | "admin"
) {
  try {
    await requireAdmin();
    
    const userDoc = await db.collection("users").doc(userId).get();
    if (!userDoc.exists) {
      return {
        success: false,
        message: "User not found",
      };
    }
    
    await db.collection("users").doc(userId).update({
      userRole: newRole,
      updatedAt: new Date().toISOString(),
    });
    
    return {
      success: true,
      message: "User role updated successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to update user role",
    };
  }
}

export async function updateUserStatus(
  userId: string,
  status: "active" | "deactivated"
) {
  try {
    await requireAdmin();
    
    const userDoc = await db.collection("users").doc(userId).get();
    if (!userDoc.exists) {
      return {
        success: false,
        message: "User not found",
      };
    }
    
    await db.collection("users").doc(userId).update({
      status,
      updatedAt: new Date().toISOString(),
    });
    
    return {
      success: true,
      message: `User ${status === "active" ? "activated" : "deactivated"} successfully`,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to update user status",
    };
  }
}

export async function deactivateUser(userId: string) {
  return updateUserStatus(userId, "deactivated");
}

export async function reactivateUser(userId: string) {
  return updateUserStatus(userId, "active");
}