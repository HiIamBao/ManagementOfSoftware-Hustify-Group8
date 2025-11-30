import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/actions/auth.action";

export async function GET() {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // In a real application, you would fetch this from your database
    // This is just sample data for demonstration
    const notices = [
      {
        id: "1",
        type: "like",
        user: {
          id: "1",
          name: "Hoàng Bá Bảo",
        },
        post: {
          id: "1",
          title: "Getting started with Next.js",
        },
        createdAt: new Date().toISOString(),
      },
      {
        id: "2",
        type: "comment",
        user: {
          id: "2",
          name: "Hai Anh Ant",
        },
        post: {
          id: "1",
          title: "Getting started with Next.js",
        },
        createdAt: new Date(Date.now() - 30 * 60000).toISOString(), // 30 minutes ago
      },
      {
        id: "3",
        type: "share",
        user: {
          id: "3",
          name: "Lê Hưng",
        },
        post: {
          id: "2",
          title: "Understanding TypeScript",
        },
        createdAt: new Date(Date.now() - 60 * 60000).toISOString(), // 1 hour ago
      },
    ];

    return NextResponse.json({ notices });
  } catch (error) {
    console.error("Error fetching notices:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 