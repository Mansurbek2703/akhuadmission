import { NextResponse } from "next/server";
import { sendEmail, type EmailAttachment } from "@/lib/email";

export const runtime = "nodejs";

// Max 10 MB per file
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_PROGRAMS = [
  "Software Engineering",
  "Artificial Intelligence",
  "Engineering of Drone Technologies",
];

// Fields that must be present (text fields)
const REQUIRED_TEXT_FIELDS: Record<string, string> = {
  fullName: "Full name",
  email: "Email",
  phone: "Phone number",
  parentPhone: "Parent's phone number",
  currentUniversity: "Current university",
  program: "Program",
  completedFirstYear: "First-year confirmation",
};

// Files that must be uploaded
const REQUIRED_FILES = ["passport", "transcript", "diploma", "englishCert"];

const FILE_LABELS: Record<string, string> = {
  passport: "Passport / ID",
  transcript: "Academic Transcript",
  diploma: "High School Diploma",
  englishCert: "English Certificate (IELTS/TOEFL)",
  motivationLetter: "Motivation Letter",
  achievements: "Additional Achievements",
};

function escapeHtml(str: string) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    // --- Collect and validate text fields ---
    const fields: Record<string, string> = {};
    for (const key of Object.keys(REQUIRED_TEXT_FIELDS)) {
      const value = (formData.get(key) as string | null)?.trim() || "";
      if (!value) {
        return NextResponse.json(
          { error: `${REQUIRED_TEXT_FIELDS[key]} is required.` },
          { status: 400 }
        );
      }
      fields[key] = value;
    }

    // Optional text fields
    fields.currentProgram =
      (formData.get("currentProgram") as string | null)?.trim() || "";
    fields.currentYear =
      (formData.get("currentYear") as string | null)?.trim() || "";
    fields.message = (formData.get("message") as string | null)?.trim() || "";

    // --- Validate email format ---
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    // --- Validate program ---
    if (!ALLOWED_PROGRAMS.includes(fields.program)) {
      return NextResponse.json(
        { error: "Please select a valid transfer program." },
        { status: 400 }
      );
    }

    // --- Validate first-year completion (eligibility) ---
    if (fields.completedFirstYear !== "yes") {
      return NextResponse.json(
        {
          error:
            "Only students who have completed their first year are eligible to transfer.",
        },
        { status: 400 }
      );
    }

    // --- Collect and validate files ---
    const attachments: EmailAttachment[] = [];
    const uploadedFileNames: Record<string, string> = {};

    for (const key of Object.keys(FILE_LABELS)) {
      const file = formData.get(key) as File | null;
      const isRequired = REQUIRED_FILES.includes(key);

      if (!file || file.size === 0) {
        if (isRequired) {
          return NextResponse.json(
            { error: `${FILE_LABELS[key]} is required.` },
            { status: 400 }
          );
        }
        continue;
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `${FILE_LABELS[key]} exceeds the 10 MB limit.` },
          { status: 400 }
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      // Prefix filename with the applicant name for clarity in the inbox
      const safeName = fields.fullName.replace(/[^\w\s.-]/g, "").trim();
      const filename = `${safeName} - ${FILE_LABELS[key]} - ${file.name}`;
      attachments.push({
        filename,
        content: buffer,
        contentType: file.type || "application/octet-stream",
      });
      uploadedFileNames[key] = file.name;
    }

    // --- Build the email HTML ---
    const row = (label: string, value: string) =>
      `<tr>
        <td style="padding:10px 14px;border:1px solid #e2e8f0;background:#f8fafc;font-weight:600;color:#1e293b;width:220px;">${escapeHtml(
          label
        )}</td>
        <td style="padding:10px 14px;border:1px solid #e2e8f0;color:#334155;">${escapeHtml(
          value || "—"
        )}</td>
      </tr>`;

    const filesList = Object.keys(FILE_LABELS)
      .filter((k) => uploadedFileNames[k])
      .map(
        (k) =>
          `<li style="margin-bottom:4px;color:#334155;"><strong>${escapeHtml(
            FILE_LABELS[k]
          )}:</strong> ${escapeHtml(uploadedFileNames[k])}</li>`
      )
      .join("");

    const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:640px;margin:0 auto;">
      <div style="background:#1d4ed8;padding:20px 24px;border-radius:8px 8px 0 0;">
        <h1 style="margin:0;color:#ffffff;font-size:20px;">New Transfer Application</h1>
        <p style="margin:6px 0 0;color:#dbeafe;font-size:13px;">Al-Khwarizmi University · Transfer Admissions</p>
      </div>
      <div style="border:1px solid #e2e8f0;border-top:none;padding:24px;border-radius:0 0 8px 8px;">
        <h2 style="font-size:15px;color:#1e293b;margin:0 0 12px;">Applicant Details</h2>
        <table style="border-collapse:collapse;width:100%;font-size:14px;">
          ${row("Full Name", fields.fullName)}
          ${row("Email", fields.email)}
          ${row("Phone Number", fields.phone)}
          ${row("Parent's Phone Number", fields.parentPhone)}
          ${row("Current University", fields.currentUniversity)}
          ${row("Current Program", fields.currentProgram)}
          ${row("Current Year of Study", fields.currentYear)}
          ${row("Completed First Year", fields.completedFirstYear === "yes" ? "Yes" : "No")}
          ${row("Desired Transfer Program", fields.program)}
        </table>

        ${
          fields.message
            ? `<h2 style="font-size:15px;color:#1e293b;margin:20px 0 8px;">Message</h2>
               <p style="font-size:14px;color:#334155;line-height:1.6;background:#f8fafc;padding:12px 14px;border:1px solid #e2e8f0;border-radius:6px;">${escapeHtml(
                 fields.message
               )}</p>`
            : ""
        }

        <h2 style="font-size:15px;color:#1e293b;margin:20px 0 8px;">Attached Documents</h2>
        <ul style="font-size:14px;padding-left:20px;margin:0;">${filesList}</ul>

        <p style="font-size:12px;color:#94a3b8;margin-top:24px;">
          Submitted on ${new Date().toLocaleString("en-GB", {
            timeZone: "Asia/Tashkent",
          })} (Tashkent time)
        </p>
      </div>
    </div>`;

    // Recipient inbox (single configured SMTP account)
    const recipient =
      process.env.TRANSFER_TO || process.env.SMTP_USER || "";

    const result = await sendEmail({
      to: recipient,
      subject: `Transfer Application — ${fields.fullName} (${fields.program})`,
      html,
      attachments,
      // Replies from staff go straight back to the applicant
      replyTo: fields.email,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: "Failed to send your application. Please try again later." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[TRANSFER] Submission error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}