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

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}) {
  const transporter = getTransporter();

  if (!transporter) {
    console.log("=".repeat(60));
    console.log("[EMAIL - CONSOLE MODE]");
    console.log(`  To:      ${to}`);
    console.log(`  Subject: ${subject}`);
    console.log(`  Body:    ${text || html.replace(/<[^>]*>/g, "")}`);
    console.log("=".repeat(60));
    return { success: true, mode: "console" };
  }

  try {
    const info = await transporter.sendMail({
      from: `"Al-Khwarizmi University" <${FROM_ADDRESS}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ""),
    });
    console.log(`[EMAIL] Sent to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("[EMAIL] Failed to send:", error);
    return { success: false, error: String(error) };
  }
}

export async function sendVerificationEmail(to: string, token: string, plainPassword?: string) {
  const verifyUrl = `${APP_URL}/api/auth/verify?token=${token}`;
  const loginUrl = `${APP_URL}/login`;

  const credentialsBlock = plainPassword
    ? `
          <div style="background: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px 20px; margin: 20px 0;">
            <p style="margin: 0 0 8px 0; color: #374151; font-weight: bold;">Your login credentials:</p>
            <p style="margin: 0 0 4px 0; color: #111827;"><strong>Email:</strong> ${to}</p>
            <p style="margin: 0; color: #111827;"><strong>Password:</strong> ${plainPassword}</p>
          </div>
          <p style="color: #dc2626; font-size: 13px; margin: 0 0 15px 0;">
            Please save your credentials and delete this email for security.
          </p>
    `
    : "";

  return sendEmail({
    to,
    subject: "Al-Khwarizmi University - Verify Your Email",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #1e40af;">
          <h1 style="color: #1e40af; margin: 0;">Al-Khwarizmi University</h1>
          <p style="color: #6b7280; margin: 5px 0 0 0;">Online Admissions Platform</p>
        </div>
        <div style="padding: 30px 0;">
          <h2 style="color: #111827;">Welcome!</h2>
          <p style="color: #374151; line-height: 1.6;">
            Thank you for registering with the Al-Khwarizmi University Online Admissions Platform.
            Please verify your email address by clicking the button below:
          </p>
          ${credentialsBlock}
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verifyUrl}" style="background: #1e40af; color: #ffffff; padding: 14px 40px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
              Verify Email
            </a>
          </div>
          <p style="color: #6b7280; font-size: 14px;">
            If the button does not work, copy and paste this URL into your browser:
          </p>
          <p style="color: #1e40af; font-size: 13px; word-break: break-all;">${verifyUrl}</p>
          <div style="text-align: center; margin: 25px 0 0 0;">
            <p style="color: #374151; margin: 0 0 10px 0;">After verifying, sign in here:</p>
            <a href="${loginUrl}" style="background: #059669; color: #ffffff; padding: 12px 35px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
              Go to Login Page
            </a>
          </div>
        </div>
        <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center;">
          <p style="color: #9ca3af; font-size: 12px;">
            This email was sent by Al-Khwarizmi University. If you did not register, please ignore this email.
          </p>
        </div>
      </div>
    `,
  });
}

export async function sendStatusUpdateEmail(
  to: string,
  applicantName: string,
  newStatus: string
) {
  const statusLabels: Record<string, string> = {
    submitted: "Submitted",
    pending_review: "Pending Review",
    incomplete_document: "Incomplete Document",
    approved_to_attend_exam: "Approved to Attend Exam",
    passed_with_exemption: "Passed with Exemption",
    application_approved: "Application Approved",
    reserved: "Seat Reserved",
    rejected: "Application Rejected",
  };

  const statusLabel = statusLabels[newStatus] || newStatus;
  const dashboardUrl = `${APP_URL}/dashboard`;

  // Special handling for rejection and reserved statuses
  if (newStatus === "rejected") {
    return sendRejectionEmail(to, applicantName);
  }
  if (newStatus === "reserved") {
    return sendReservedEmail(to, applicantName);
  }

  return sendEmail({
    to,
    subject: `Al-Khwarizmi University - Application Status Updated: ${statusLabel}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #1e40af;">
          <h1 style="color: #1e40af; margin: 0;">Al-Khwarizmi University</h1>
        </div>
        <div style="padding: 30px 0;">
          <h2 style="color: #111827;">Dear ${applicantName},</h2>
          <p style="color: #374151; line-height: 1.6;">Your application status has been updated:</p>
          <div style="background: #eff6ff; border-left: 4px solid #1e40af; padding: 15px 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
            <p style="margin: 0; color: #1e40af; font-weight: bold; font-size: 18px;">${statusLabel}</p>
          </div>
          <p style="color: #374151;">For more details, please visit your personal dashboard:</p>
          <div style="text-align: center; margin: 25px 0;">
            <a href="${dashboardUrl}" style="background: #1e40af; color: #ffffff; padding: 12px 35px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
              Go to Dashboard
            </a>
          </div>
        </div>
        <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center;">
          <p style="color: #9ca3af; font-size: 12px;">Al-Khwarizmi University Online Admissions Platform</p>
        </div>
      </div>
    `,
  });
}

export async function sendDocumentVerificationEmail(
  to: string,
  applicantName: string,
  documentName: string,
  action: "verified" | "invalid"
) {
  const dashboardUrl = `${APP_URL}/dashboard`;
  const isVerified = action === "verified";
  const actionLabel = isVerified ? "Verified" : "Marked as Invalid";
  const color = isVerified ? "#059669" : "#dc2626";
  const bgColor = isVerified ? "#ecfdf5" : "#fef2f2";
  const borderColor = isVerified ? "#059669" : "#dc2626";

  return sendEmail({
    to,
    subject: `Al-Khwarizmi University - Document ${actionLabel}: ${documentName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #1e40af;">
          <h1 style="color: #1e40af; margin: 0;">Al-Khwarizmi University</h1>
        </div>
        <div style="padding: 30px 0;">
          <h2 style="color: #111827;">Dear ${applicantName},</h2>
          <p style="color: #374151; line-height: 1.6;">
            Your document <strong>${documentName}</strong> has been reviewed by the admissions team:
          </p>
          <div style="background: ${bgColor}; border-left: 4px solid ${borderColor}; padding: 15px 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
            <p style="margin: 0; color: ${color}; font-weight: bold; font-size: 18px;">${actionLabel}</p>
          </div>
          ${!isVerified ? `
          <p style="color: #dc2626; line-height: 1.6;">
            The information in your document was found to be incorrect or invalid. Please review your application and contact the admissions office if you believe this is an error.
          </p>` : `
          <p style="color: #059669; line-height: 1.6;">
            Your document has been successfully verified. No further action is needed for this document.
          </p>`}
          <div style="text-align: center; margin: 25px 0;">
            <a href="${dashboardUrl}" style="background: #1e40af; color: #ffffff; padding: 12px 35px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
              Go to Dashboard
            </a>
          </div>
        </div>
        <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center;">
          <p style="color: #9ca3af; font-size: 12px;">Al-Khwarizmi University Online Admissions Platform</p>
        </div>
      </div>
    `,
  });
}

export async function sendChatNotificationEmail(
  to: string,
  senderName: string
) {
  const chatUrl = `${APP_URL}/dashboard/chat`;

  return sendEmail({
    to,
    subject: "Al-Khwarizmi University - New Message Received",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #1e40af;">
          <h1 style="color: #1e40af; margin: 0;">Al-Khwarizmi University</h1>
        </div>
        <div style="padding: 30px 0;">
          <p style="color: #374151; line-height: 1.6;">
            <strong>${senderName}</strong> has sent you a new message.
          </p>
          <div style="text-align: center; margin: 25px 0;">
            <a href="${chatUrl}" style="background: #1e40af; color: #ffffff; padding: 12px 35px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
              Read Message
            </a>
          </div>
        </div>
      </div>
    `,
  });
}

export async function sendReservedEmail(
  to: string,
  applicantName: string
) {
  const dashboardUrl = `${APP_URL}/dashboard`;
  const contactPhone = "+998 62 227 71 71";

  return sendEmail({
    to,
    subject: "Al-Khwarizmi University - Your Seat Has Been Reserved",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #1e40af;">
          <h1 style="color: #1e40af; margin: 0;">Al-Khwarizmi University</h1>
          <p style="color: #6b7280; margin: 5px 0 0 0;">Online Admissions Platform</p>
        </div>
        <div style="padding: 30px 0;">
          <h2 style="color: #059669; font-size: 24px; margin-bottom: 20px;">Congratulations, ${applicantName}!</h2>
          <p style="color: #374151; line-height: 1.6; margin-bottom: 15px;">
            We are pleased to inform you that your seat at Al-Khwarizmi University has been <strong>reserved</strong>.
          </p>
          <p style="color: #374151; line-height: 1.6;">
            Your application meets all the admission requirements, and you have successfully completed the required deposit payment.
          </p>
          <div style="background: #ecfdf5; border-left: 4px solid #059669; padding: 15px 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
            <p style="margin: 0; color: #059669; font-weight: bold; font-size: 16px;">Your seat is now secured!</p>
          </div>
          <p style="color: #374151; line-height: 1.6; margin-top: 20px;">
            For any additional information or queries, please do not hesitate to contact our admissions office:
          </p>
          <p style="color: #1e40af; font-weight: bold; font-size: 16px; margin: 15px 0;">
            ${contactPhone}
          </p>
          <p style="color: #6b7280; line-height: 1.6;">
            We look forward to welcoming you as a student at Al-Khwarizmi University.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${dashboardUrl}" style="background: #1e40af; color: #ffffff; padding: 12px 35px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
              Go to Dashboard
            </a>
          </div>
        </div>
        <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center;">
          <p style="color: #9ca3af; font-size: 12px;">Al-Khwarizmi University Online Admissions Platform</p>
        </div>
      </div>
    `,
  });
}

export async function sendRejectionEmail(
  to: string,
  applicantName: string
) {
  const dashboardUrl = `${APP_URL}/dashboard`;
  const contactPhone = "+998 62 227 71 71";

  return sendEmail({
    to,
    subject: "Al-Khwarizmi University - Application Status Update",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #1e40af;">
          <h1 style="color: #1e40af; margin: 0;">Al-Khwarizmi University</h1>
          <p style="color: #6b7280; margin: 5px 0 0 0;">Online Admissions Platform</p>
        </div>
        <div style="padding: 30px 0;">
          <h2 style="color: #111827;">Dear ${applicantName},</h2>
          <p style="color: #374151; line-height: 1.6; margin-bottom: 15px;">
            Thank you for your interest in Al-Khwarizmi University and for submitting your application.
          </p>
          <p style="color: #374151; line-height: 1.6;">
            After careful review of your application by our admissions committee, we regret to inform you that your application has not been accepted at this time.
          </p>
          <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
            <p style="margin: 0; color: #dc2626; font-weight: bold;">Application Status: Rejected</p>
          </div>
          <p style="color: #6b7280; line-height: 1.6; margin-top: 20px;">
            We appreciate your interest and encourage you to consider applying again in future admission cycles.
            If you have any questions regarding your application or would like more information, please feel free to contact our admissions office.
          </p>
          <div style="background: #f0f9ff; border: 1px solid #bfdbfe; padding: 15px 20px; margin: 20px 0; border-radius: 8px;">
            <p style="color: #1e40af; font-weight: bold; margin: 0 0 10px 0;">Contact Admissions Office:</p>
            <p style="color: #1e40af; font-weight: bold; font-size: 16px; margin: 0;">
              ${contactPhone}
            </p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${dashboardUrl}" style="background: #1e40af; color: #ffffff; padding: 12px 35px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
              Go to Dashboard
            </a>
          </div>
        </div>
        <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center;">
          <p style="color: #9ca3af; font-size: 12px;">Al-Khwarizmi University Online Admissions Platform</p>
        </div>
      </div>
    `,
  });
}
