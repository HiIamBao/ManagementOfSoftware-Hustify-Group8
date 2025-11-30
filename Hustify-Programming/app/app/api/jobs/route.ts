import { NextRequest, NextResponse } from "next/server";
import { db } from "@/firebase/admin";

export async function POST(req: NextRequest) {
  try {
    const { title, company, location, logoUrl, description, requirements } =
      await req.json();
    const createdAt = new Date().toISOString();

    const docRef = await db.collection("jobs").add({
      title,
      company,
      location,
      logoUrl,
      description,
      requirements,
      createdAt,
    });

    return NextResponse.json({ success: true, id: docRef.id });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
