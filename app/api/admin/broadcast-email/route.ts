import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { APPLICATION_STATUS_LABELS } from "@/lib/types";
import type { ApplicationStatus } from "@/lib/types";

const VALID_STATUSES = Object.keys(APPLICATION_STATUS_LABELS);

const BATCH_SIZE = 20;

function escapeHtml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildBroadcastHtml(applicantName: string, title: string, details: string) {
  const safeTitle = escapeHtml(title);
  const safeDetails = escapeHtml(details).replace(/\n/g, "<br />");
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #1e40af;">
        <h1 style="color: #1e40af; margin: 0;">Al-Khwarizmi University</h1>
      </div>
      <div style="padding: 30px 0;">
        <h2 style="color: #111827;">Dear ${escapeHtml(applicantName)},</h2>
        <div style="background: #eff6ff; border-left: 4px solid #1e40af; padding: 15px 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
          <p style="margin: 0; color: #1e40af; font-weight: bold; font-size: 18px;">${safeTitle}</p>
        </div>
        <p style="color: #374151; line-height: 1.6;">${safeDetails}</p>
      </div>
      <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center;">
        <p style="color: #9ca3af; font-size: 12px;">Al-Khwarizmi University Online Admissions Platform</p>
      </div>
    </div>
  `;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "superadmin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { status, title, details } = body as {
      status?: string;
      title?: string;
      details?: string;
    };

    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: "A valid application status is required" }, { status: 400 });
    }
    if (!title?.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    if (!details?.trim()) {
      return NextResponse.json({ error: "Details are required" }, { status: 400 });
    }

    const statusLabel = APPLICATION_STATUS_LABELS[status as ApplicationStatus];

    const result = await query(
      `SELECT DISTINCT u.email, a.given_name, a.surname
       FROM applications a
       JOIN users u ON a.user_id = u.id
       WHERE a.status = $1 AND u.email IS NOT NULL`,
      [status]
    );

    const recipients: { email: string; given_name?: string; surname?: string }[] = result.rows;

    if (recipients.length === 0) {
      return NextResponse.json(
        { error: `No applicants found with status "${statusLabel}"` },
        { status: 404 }
      );
    }

    let sent = 0;
    let failed = 0;

    // Send in batches to avoid overwhelming the SMTP server
    for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
      const batch = recipients.slice(i, i + BATCH_SIZE);
      const results = await Promise.allSettled(
        batch.map((r) => {
          const name =
            [r.given_name, r.surname].filter(Boolean).join(" ").trim() || "Applicant";
          return sendEmail({
            to: r.email,
            subject: `Al-Khwarizmi University - ${title.trim()}`,
            html: buildBroadcastHtml(name, title.trim(), details.trim()),
          });
        })
      );
      for (const res of results) {
        if (res.status === "fulfilled" && res.value?.success !== false) sent++;
        else failed++;
      }
    }

    await query(
      "INSERT INTO admin_logs (admin_id, action, details) VALUES ($1, $2, $3)",
      [
        session.userId,
        "broadcast_email",
        `Broadcast email "${title.trim()}" sent to status "${statusLabel}": ${sent} sent, ${failed} failed (of ${recipients.length} recipients)`,
      ]
    );

    return NextResponse.json({ total: recipients.length, sent, failed, statusLabel });
  } catch (error) {
    console.error("Broadcast email error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}