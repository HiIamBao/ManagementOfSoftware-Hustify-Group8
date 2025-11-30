import { NextResponse } from "next/server";
import { db } from "@/firebase/admin";

export async function GET() {
  try {
    const snapshot = await db.collection("roadmap").get();
    const roadmaps = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return NextResponse.json({ success: true, data: roadmaps });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
