import { NextRequest, NextResponse } from "next/server";
import { db } from "@/firebase/admin";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = searchParams.get("limit") || "50";
    const search = searchParams.get("search") || "";

    const jobsSnapshot = await db
      .collection("outer_jobs")
      .limit(parseInt(limit))
      .get();

    let jobs = jobsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Array<OuterJob & { id: string }>;

    // Filter by search term if provided
    if (search) {
      const searchLower = search.toLowerCase();
      jobs = jobs.filter(
        (job) =>
          job.detail_title?.toLowerCase().includes(searchLower) ||
          job.general_info?.toLowerCase().includes(searchLower) ||
          job.tags?.toLowerCase().includes(searchLower)
      );
    }

    return NextResponse.json({ success: true, jobs });
  } catch (error) {
    console.error("Error fetching outer jobs:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const jobData = await req.json();

    const docRef = await db.collection("outer_jobs").add({
      ...jobData,
      datetime: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, id: docRef.id });
  } catch (error) {
    console.error("Error creating outer job:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
