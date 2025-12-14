"use server";

import { db } from "@/firebase/admin";
import { requireAdmin } from "./auth.action";

export async function getAllInterviewsAdmin(params?: { page?: number; limit?: number; type?: string }) {
  try {
    await requireAdmin();
    const page = params?.page || 1;
    const limit = params?.limit || 50;

    let query: FirebaseFirestore.Query = db.collection("interviews");
    if (params?.type) query = query.where("type", "==", params.type);

    const snapshot = await query.get();

    // Collect basic interview rows
    let interviews = snapshot.docs.map((doc) => {
      const data = doc.data() as any;
      return {
        id: doc.id,
        role: data.role || "",
        type: data.type || "general",
        techstack: Array.isArray(data.techstack) ? data.techstack : [],
        createdAt: data.createdAt || new Date().toISOString(),
        createdBy: data.createdBy || data.userId || "",
        finalized: data.finalized ?? true,
      } as any;
    });

    // Enrich with user info (name/image) for createdBy
    const userIds = Array.from(new Set(interviews.map((i: any) => i.createdBy).filter(Boolean)));
    const userMap: Record<string, any> = {};
    await Promise.all(
      userIds.map(async (uid) => {
        try {
          const udoc = await db.collection("users").doc(uid).get();
          if (udoc.exists) userMap[uid] = { id: udoc.id, ...udoc.data() };
        } catch {}
      })
    );

    interviews = interviews.map((i: any) => ({
      ...i,
      user: userMap[i.createdBy]
        ? { id: userMap[i.createdBy].id, name: userMap[i.createdBy].name || "Unknown", image: userMap[i.createdBy].image || "" }
        : { id: i.createdBy, name: i.createdBy || "Unknown", image: "" },
    }));

    interviews = interviews.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const total = interviews.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    return {
      success: true,
      interviews: interviews.slice(startIndex, endIndex),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to fetch interviews" };
  }
}

export async function deleteInterviewAdmin(interviewId: string) {
  try {
    await requireAdmin();
    const ref = db.collection("interviews").doc(interviewId);
    const doc = await ref.get();
    if (!doc.exists) return { success: false, message: "Interview not found" };
    await ref.delete();
    // Optionally remove related feedbacks
    // const fbs = await db.collection("feedback").where("interviewId", "==", interviewId).get();
    // const batch = db.batch();
    // fbs.forEach((d) => batch.delete(d.ref));
    // await batch.commit();
    return { success: true, message: "Interview deleted" };
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to delete interview" };
  }
}

export async function getTopInterviewTopics(limit: number = 5) {
  try {
    await requireAdmin();
    const snapshot = await db.collection("interviews").get();
    const counts: Record<string, number> = {};

    snapshot.docs.forEach((doc) => {
      const data = doc.data() as any;
      const techs: string[] = Array.isArray(data.techstack) ? data.techstack : [];
      if (techs.length > 0) {
        techs.forEach((t) => {
          const key = String(t);
          counts[key] = (counts[key] || 0) + 1;
        });
      } else if (data.role) {
        const key = String(data.role);
        counts[key] = (counts[key] || 0) + 1;
      }
    });

    const items = Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);

    return { success: true, items };
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to compute topics" };
  }
}

