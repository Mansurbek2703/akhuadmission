import nodemailer from "nodemailer";

// ============================================================
//  EMAIL CONFIGURATION
// ============================================================
//
//  Required environment variables:
//
//    SMTP_HOST     - SMTP server address
//    SMTP_PORT     - SMTP port (587 or 465)
//    SMTP_USER     - Email login
//    SMTP_PASS     - Email password / App password
//    SMTP_FROM     - "From" address (optional, uses SMTP_USER)
//    NEXT_PUBLIC_APP_URL - Site URL (for verification links)
//
//  ---- GMAIL ----
//    SMTP_HOST=smtp.gmail.com
//    SMTP_PORT=587
//    SMTP_USER=your-email@gmail.com
//    SMTP_PASS=xxxx xxxx xxxx xxxx   (App Password)
//
//  ---- YANDEX ----
//    SMTP_HOST=smtp.yandex.ru
//    SMTP_PORT=465
//
//  ---- CUSTOM (University server) ----
//    SMTP_HOST=mail.alkhwarizmi.uz
//    SMTP_PORT=587
//
// ============================================================

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.warn(
      "[EMAIL] SMTP credentials not configured. Emails will be logged to console instead."
    );
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    tls: { rejectUnauthorized: false },
  });
}

const FROM_ADDRESS =
  process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@alkhwarizmi.uz";

const APP_URL =
  process.env.APP_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  "https://admission.akhu.uz";

export interface EmailAttachment {
  filename: string;
  content: Buffer;
  contentType?: string;
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
  attachments,
  replyTo,
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: EmailAttachment[];
  replyTo?: string;
}) {
  const transporter = getTransporter();

  if (!transporter) {
    console.log("=".repeat(60));
    console.log("[EMAIL - CONSOLE MODE]");
    console.log(`  To:      ${to}`);
    console.log(`  Subject: ${subject}`);
    if (attachments?.length) {
      console.log(`  Files:   ${attachments.map((a) => a.filename).join(", ")}`);
    }
    console.log(`  Body:    ${text || html.replace(/<[^>]*>/g, "")}`);
    console.log("=".repeat(60));
    return { success: true, mode: "console" };
  }

  // Build a clean plain-text version (better than naive tag stripping)
  const plainText =
    text ||
    html
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  // Extract the domain of the From address for List-Unsubscribe / Message-ID
  const fromDomain = FROM_ADDRESS.split("@")[1] || "alkhwarizmi.uz";

  try {
    const info = await transporter.sendMail({
      from: `"Al-Khwarizmi University" <${FROM_ADDRESS}>`,
      to,
      subject,
      html,
      text: plainText,
      ...(attachments?.length ? { attachments } : {}),
      // Replies go to a real, monitored inbox (improves trust score)
      replyTo: replyTo || process.env.SMTP_REPLY_TO || FROM_ADDRESS,
      headers: {
        // One-click unsubscribe — major providers reward this heavily
        "List-Unsubscribe": `<mailto:${FROM_ADDRESS}?subject=unsubscribe>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        // Mark as transactional (not bulk marketing)
        "X-Entity-Ref-ID": `akhu-${Date.now()}`,
        Precedence: "transactional",
      },
      // Ensures the Return-Path/envelope matches the From domain (SPF alignment)
      envelope: {
        from: FROM_ADDRESS,
        to,
      },
    });
    console.log(`[EMAIL] Sent to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("[EMAIL] Failed to send:", error);
    return { success: false, error: String(error) };
  }
}

export async function sendVerificationEmail(to: string, token: string, plainPassword?: string) {
  console.log(`[EMAIL] Verification email skipped for ${to} (admission closed)`);
  return { success: true, skipped: true };
}

export async function sendStatusUpdateEmail(
  to: string,
  applicantName: string,
  newStatus: string,
  applicantScore?: string
) {
  console.log(`[EMAIL] Status update email skipped for ${to} (${newStatus}) - admission closed`);
  return { success: true, skipped: true };
}

export async function sendDocumentVerificationEmail(
  to: string,
  applicantName: string,
  documentName: string,
  action: "verified" | "invalid"
) {
  console.log(`[EMAIL] Document verification email skipped for ${to} (${documentName} - ${action}) - admission closed`);
  return { success: true, skipped: true };
}

export async function sendChatNotificationEmail(
  to: string,
  senderName: string
) {
  console.log(`[EMAIL] Chat notification email skipped for ${to} (from ${senderName}) - admission closed`);
  return { success: true, skipped: true };
}

export async function sendAcceptedEmail(
  to: string,
  applicantName: string,
  applicantScore?: string
) {
  console.log(`[EMAIL] Accepted email skipped for ${to} - admission closed`);
  return { success: true, skipped: true };
}

export async function sendReservedEmail(
  to: string,
  applicantName: string
) {
  console.log(`[EMAIL] Reserved email skipped for ${to} - admission closed`);
  return { success: true, skipped: true };
}

export async function sendRejectionEmail(
  to: string,
  applicantName: string
) {
  console.log(`[EMAIL] Rejection email skipped for ${to} - admission closed`);
  return { success: true, skipped: true };
}
