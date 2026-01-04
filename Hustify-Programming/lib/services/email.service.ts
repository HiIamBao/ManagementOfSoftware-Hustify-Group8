import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface SendJobNotificationEmailParams {
  to: string;
  recipientName: string;
  companyName: string;
  jobTitle: string;
  jobId: string;
  jobLocation?: string;
}

export interface EmailResult {
  success: boolean;
  email: string;
  error?: string;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== "string") return false;
  return EMAIL_REGEX.test(email.trim());
}

/**
 * Send job notification email to a single recipient
 */
export async function sendJobNotificationEmail(
  params: SendJobNotificationEmailParams
): Promise<EmailResult> {
  const { to, recipientName, companyName, jobTitle, jobId, jobLocation } =
    params;

  // Validate email format first
  if (!isValidEmail(to)) {
    console.log(`[Email Service] Invalid email format: ${to}`);
    return {
      success: false,
      email: to,
      error: "Invalid email format",
    };
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const jobUrl = `${baseUrl}/jobs/${jobId}`;

    const { data, error } = await resend.emails.send({
      from: "Hustify <onboarding@resend.dev>", // TODO: Change to notifications@hustify.id.vn after domain verification
      to: [to],
      subject: `🚀 New Job Alert: ${jobTitle} at ${companyName}`,
      html: generateJobNotificationHTML({
        recipientName,
        companyName,
        jobTitle,
        jobUrl,
        jobLocation,
        baseUrl,
      }),
    });

    if (error) {
      console.error(`[Email Service] Failed to send to ${to}:`, error);
      return {
        success: false,
        email: to,
        error: error.message,
      };
    }

    console.log(
      `[Email Service] Email sent successfully to ${to}, id: ${data?.id}`
    );
    return {
      success: true,
      email: to,
    };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error(`[Email Service] Exception sending to ${to}:`, error);
    return {
      success: false,
      email: to,
      error: errorMessage,
    };
  }
}

/**
 * Send job notification emails to multiple recipients
 * Handles errors gracefully - continues sending even if some fail
 */
export async function sendBulkJobNotificationEmails(
  recipients: Array<{ email: string; name: string }>,
  jobDetails: {
    companyName: string;
    jobTitle: string;
    jobId: string;
    jobLocation?: string;
  }
): Promise<{
  totalSent: number;
  totalFailed: number;
  results: EmailResult[];
}> {
  const { companyName, jobTitle, jobId, jobLocation } = jobDetails;
  const results: EmailResult[] = [];

  // Filter out invalid emails before sending
  const validRecipients = recipients.filter((r) => isValidEmail(r.email));
  const invalidRecipients = recipients.filter((r) => !isValidEmail(r.email));

  // Log invalid emails
  invalidRecipients.forEach((r) => {
    console.log(`[Email Service] Skipping invalid email: ${r.email}`);
    results.push({
      success: false,
      email: r.email,
      error: "Invalid email format",
    });
  });

  // Send emails in parallel with concurrency limit
  const BATCH_SIZE = 10; // Resend rate limit consideration

  for (let i = 0; i < validRecipients.length; i += BATCH_SIZE) {
    const batch = validRecipients.slice(i, i + BATCH_SIZE);

    const batchResults = await Promise.all(
      batch.map((recipient) =>
        sendJobNotificationEmail({
          to: recipient.email,
          recipientName: recipient.name,
          companyName,
          jobTitle,
          jobId,
          jobLocation,
        })
      )
    );

    results.push(...batchResults);

    // Small delay between batches to respect rate limits
    if (i + BATCH_SIZE < validRecipients.length) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  const totalSent = results.filter((r) => r.success).length;
  const totalFailed = results.filter((r) => !r.success).length;

  console.log(
    `[Email Service] Bulk send complete: ${totalSent} sent, ${totalFailed} failed`
  );

  return {
    totalSent,
    totalFailed,
    results,
  };
}

/**
 * Generate HTML email template for job notification
 */
function generateJobNotificationHTML(params: {
  recipientName: string;
  companyName: string;
  jobTitle: string;
  jobUrl: string;
  jobLocation?: string;
  baseUrl: string;
}): string {
  const { recipientName, companyName, jobTitle, jobUrl, jobLocation, baseUrl } =
    params;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Job Alert</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header -->
    <tr>
      <td style="background: linear-gradient(135deg, #BF3131 0%, #8B0000 100%); padding: 30px 40px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">Hustify</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">Your Career Companion</p>
      </td>
    </tr>
    
    <!-- Content -->
    <tr>
      <td style="padding: 40px;">
        <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 22px;">
          Hi ${recipientName || "there"}! 👋
        </h2>
        
        <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
          Great news! <strong style="color: #BF3131;">${companyName}</strong>, a company you follow, just posted a new job opening:
        </p>
        
        <!-- Job Card -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8f9fa; border-radius: 12px; border-left: 4px solid #BF3131;">
          <tr>
            <td style="padding: 25px;">
              <h3 style="color: #333333; margin: 0 0 10px 0; font-size: 20px; font-weight: 600;">
                ${jobTitle}
              </h3>
              <p style="color: #666666; margin: 0 0 5px 0; font-size: 15px;">
                🏢 ${companyName}
              </p>
              ${
                jobLocation
                  ? `
              <p style="color: #666666; margin: 0; font-size: 15px;">
                📍 ${jobLocation}
              </p>
              `
                  : ""
              }
            </td>
          </tr>
        </table>
        
        <!-- CTA Button -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top: 30px;">
          <tr>
            <td align="center">
              <a href="${jobUrl}" style="display: inline-block; background-color: #BF3131; color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                View Job Details →
              </a>
            </td>
          </tr>
        </table>
        
        <p style="color: #888888; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0; text-align: center;">
          Don't miss out on this opportunity!
        </p>
      </td>
    </tr>
    
    <!-- Footer -->
    <tr>
      <td style="background-color: #f8f9fa; padding: 25px 40px; border-top: 1px solid #eeeeee;">
        <p style="color: #888888; font-size: 12px; line-height: 1.6; margin: 0; text-align: center;">
          You received this email because you're following ${companyName} on Hustify.<br>
          <a href="${baseUrl}/user" style="color: #BF3131; text-decoration: none;">Manage your followed companies</a>
        </p>
        <p style="color: #aaaaaa; font-size: 11px; margin: 15px 0 0 0; text-align: center;">
          © ${new Date().getFullYear()} Hustify. All rights reserved.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
