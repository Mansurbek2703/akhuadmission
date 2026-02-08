import nodemailer from "nodemailer";

// ============================================================
//  EMAIL CONFIGURATION
// ============================================================
//
//  Environment variables zarur:
//
//    SMTP_HOST     - SMTP server manzili
//    SMTP_PORT     - SMTP port (587 yoki 465)
//    SMTP_USER     - Email login
//    SMTP_PASS     - Email parol / App password
//    SMTP_FROM     - "From" address (optional, SMTP_USER ishlatiladi)
//    NEXT_PUBLIC_APP_URL - Sayt URL (verification link uchun)
//
//  ---- GMAIL UCHUN ----
//    SMTP_HOST=smtp.gmail.com
//    SMTP_PORT=587
//    SMTP_USER=your-email@gmail.com
//    SMTP_PASS=xxxx xxxx xxxx xxxx   (App Password!)
//
//    Gmail App Password olish:
//    1. https://myaccount.google.com/security ga kiring
//    2. "2-Step Verification" yoqilgan bo'lishi kerak
//    3. "App passwords" bo'limiga kiring
//    4. "Mail" va "Other (Custom name)" tanlang
//    5. "Al-Xorazmiy Admissions" deb nom bering
//    6. Generate tugmasini bosing - 16 belgili parol chiqadi
//    7. Shu parolni SMTP_PASS ga qo'ying (bo'shliqlari bilan)
//
//  ---- YANDEX UCHUN ----
//    SMTP_HOST=smtp.yandex.ru
//    SMTP_PORT=465
//    SMTP_USER=your-email@yandex.ru
//    SMTP_PASS=your-password
//
//  ---- MAIL.RU UCHUN ----
//    SMTP_HOST=smtp.mail.ru
//    SMTP_PORT=465
//    SMTP_USER=your-email@mail.ru
//    SMTP_PASS=your-app-password
//
//  ---- CUSTOM (University server) ----
//    SMTP_HOST=mail.alxorazmiy.uz
//    SMTP_PORT=587
//    SMTP_USER=admissions@alxorazmiy.uz
//    SMTP_PASS=your-password
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
    tls: {
      rejectUnauthorized: false,
    },
  });
}

const FROM_ADDRESS =
  process.env.SMTP_FROM ||
  process.env.SMTP_USER ||
  "noreply@alxorazmiy.uz";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// ---- Send generic email ----
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
      from: `"Al-Xorazmiy University" <${FROM_ADDRESS}>`,
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

// ---- Verification email ----
export async function sendVerificationEmail(
  to: string,
  token: string
) {
  const verifyUrl = `${APP_URL}/api/auth/verify?token=${token}`;

  return sendEmail({
    to,
    subject: "Al-Xorazmiy University - Emailingizni tasdiqlang",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #1e40af;">
          <h1 style="color: #1e40af; margin: 0;">Al-Xorazmiy University</h1>
          <p style="color: #6b7280; margin: 5px 0 0 0;">Online Qabul Platformasi</p>
        </div>
        
        <div style="padding: 30px 0;">
          <h2 style="color: #111827;">Assalomu alaykum!</h2>
          <p style="color: #374151; line-height: 1.6;">
            Al-Xorazmiy University Online Qabul Platformasiga ro'yxatdan o'tganingiz uchun rahmat.
            Emailingizni tasdiqlash uchun quyidagi tugmani bosing:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verifyUrl}" 
               style="background: #1e40af; color: #ffffff; padding: 14px 40px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
              Emailni Tasdiqlash
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px;">
            Agar tugma ishlamasa, quyidagi havolani brauzeringizga nusxalang:
          </p>
          <p style="color: #1e40af; font-size: 13px; word-break: break-all;">
            ${verifyUrl}
          </p>
        </div>
        
        <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center;">
          <p style="color: #9ca3af; font-size: 12px;">
            Bu email Al-Xorazmiy University tomonidan yuborilgan. 
            Agar siz ro'yxatdan o'tmagan bo'lsangiz, bu emailni e'tiborsiz qoldiring.
          </p>
        </div>
      </div>
    `,
  });
}

// ---- Status update notification email ----
export async function sendStatusUpdateEmail(
  to: string,
  applicantName: string,
  newStatus: string
) {
  const statusLabels: Record<string, string> = {
    pending_review: "Ko'rib chiqish kutilmoqda",
    incomplete_document: "Hujjatlar to'liq emas",
    approved_to_attend_exam: "Imtihonga kirishga ruxsat berildi",
    passed_with_exemption: "Imtihonsiz qabul qilindi",
    application_approved: "Ariza tasdiqlandi",
  };

  const statusLabel = statusLabels[newStatus] || newStatus;
  const dashboardUrl = `${APP_URL}/dashboard`;

  return sendEmail({
    to,
    subject: `Al-Xorazmiy University - Ariza holati yangilandi: ${statusLabel}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #1e40af;">
          <h1 style="color: #1e40af; margin: 0;">Al-Xorazmiy University</h1>
        </div>
        
        <div style="padding: 30px 0;">
          <h2 style="color: #111827;">Hurmatli ${applicantName},</h2>
          <p style="color: #374151; line-height: 1.6;">
            Sizning arizangiz holati yangilandi:
          </p>
          
          <div style="background: #eff6ff; border-left: 4px solid #1e40af; padding: 15px 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
            <p style="margin: 0; color: #1e40af; font-weight: bold; font-size: 18px;">
              ${statusLabel}
            </p>
          </div>
          
          <p style="color: #374151;">
            Batafsil ma'lumot uchun shaxsiy kabinetingizga kiring:
          </p>
          
          <div style="text-align: center; margin: 25px 0;">
            <a href="${dashboardUrl}" 
               style="background: #1e40af; color: #ffffff; padding: 12px 35px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
              Shaxsiy Kabinetga Kirish
            </a>
          </div>
        </div>
        
        <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center;">
          <p style="color: #9ca3af; font-size: 12px;">
            Al-Xorazmiy University Online Qabul Platformasi
          </p>
        </div>
      </div>
    `,
  });
}

// ---- Chat message notification email ----
export async function sendChatNotificationEmail(
  to: string,
  senderName: string
) {
  const chatUrl = `${APP_URL}/dashboard/chat`;

  return sendEmail({
    to,
    subject: "Al-Xorazmiy University - Yangi xabar keldi",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #1e40af;">
          <h1 style="color: #1e40af; margin: 0;">Al-Xorazmiy University</h1>
        </div>
        
        <div style="padding: 30px 0;">
          <p style="color: #374151; line-height: 1.6;">
            <strong>${senderName}</strong> sizga yangi xabar yubordi.
          </p>
          
          <div style="text-align: center; margin: 25px 0;">
            <a href="${chatUrl}" 
               style="background: #1e40af; color: #ffffff; padding: 12px 35px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
              Xabarni O'qish
            </a>
          </div>
        </div>
      </div>
    `,
  });
}
