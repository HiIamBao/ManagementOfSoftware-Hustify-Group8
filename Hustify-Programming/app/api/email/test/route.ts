import { NextRequest, NextResponse } from "next/server";
import { sendJobNotificationEmail } from "@/lib/services/email.service";

/**
 * Test API endpoint for sending email notifications
 * POST /api/email/test
 * Body: { email: string, name?: string }
 */
export async function POST(req: NextRequest) {
  try {
    // Only allow in development mode
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { success: false, message: "Test endpoint not available in production" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { email, name } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      );
    }

    console.log(`[Test Email API] Sending test email to: ${email}`);

    const result = await sendJobNotificationEmail({
      to: email,
      recipientName: name || "Test User",
      companyName: "Test Company Inc.",
      jobTitle: "Senior Software Engineer",
      jobId: "test-job-123",
      jobLocation: "Ho Chi Minh City, Vietnam",
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Test email sent successfully to ${email}`,
        data: result,
      });
    } else {
      return NextResponse.json({
        success: false,
        message: `Failed to send test email: ${result.error}`,
        data: result,
      });
    }
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("[Test Email API] Error:", error);
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for testing API availability
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Email test API is available",
    usage: {
      method: "POST",
      body: {
        email: "your-email@example.com",
        name: "Your Name (optional)",
      },
    },
  });
}
