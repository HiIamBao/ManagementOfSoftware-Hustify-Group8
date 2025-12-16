"use server";

import { db, auth } from "@/firebase/admin";
import { requireAdmin, getCurrentUser } from "./auth.action";
import { User } from "@/types";

export async function getAllUsers(params?: {
  page?: number;
  limit?: number;
  role?: "normal" | "hr" | "admin";
  status?: "active" | "deactivated";
  search?: string;
}) {
  try {
    await requireAdmin();
    
    const page = params?.page || 1;
    const limit = params?.limit || 50;
    
    let query: FirebaseFirestore.Query = db.collection("users");
    let needsMemoryFilter = false;
    
    if (params?.status === "active") {
      needsMemoryFilter = true;
    } else if (params?.status === "deactivated") {
      query = query.where("status", "==", "deactivated");
    }
    
    if (params?.role && !needsMemoryFilter) {
      query = query.where("userRole", "==", params.role);
    }
    
    const usersSnapshot = await query.get();
    
    let users = usersSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        userRole: data.userRole || "normal",
        status: data.status || "active",
      };
    }) as User[];
    
    if (needsMemoryFilter) {
      users = users.filter((user) => {
        if (params?.status === "active") {
          const userStatus = user.status || "active";
          if (userStatus !== "active") {
            return false;
          }
        }
        if (params?.role) {
          if (user.userRole !== params.role) {
            return false;
          }
        }
        return true;
      });
    } else if (params?.role) {
      users = users.filter((user) => {
        return user.userRole === params.role;
      });
    }
    
    // Apply search filter if provided
    if (params?.search && params.search.trim()) {
      const searchTerm = params.search.toLowerCase().trim();
      users = users.filter((user) => {
        const name = (user.name || "").toLowerCase();
        const email = (user.email || "").toLowerCase();
        return name.includes(searchTerm) || email.includes(searchTerm);
      });
    }
    
    const total = users.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    users = users.slice(startIndex, endIndex);
    
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

export async function getUsersByTypeAdmin() {
  try {
    await requireAdmin();
    const snapshot = await db.collection("users").get();
    const map: Record<string, number> = {};
    snapshot.forEach((doc) => {
      const data: any = doc.data();
      const role = (data?.userRole || "normal").toString().toLowerCase();
      map[role] = (map[role] || 0) + 1;
    });
    const items = Object.keys(map).map((k) => ({ type: k, count: map[k] }));
    // Sort by count desc
    items.sort((a, b) => b.count - a.count);
    return { success: true, items };
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to get users by type" };
  }
}