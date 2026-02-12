import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { query } from "@/lib/db";
import { randomUUID } from "crypto";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, phone, password, program } = body;

    if (!email || !phone || !password || !program) {
      return NextResponse.json(
        { error: "All fields are required (email, phone, password, program)" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const existing = await query("SELECT id FROM users WHERE email = $1", [
      email.toLowerCase(),
    ]);
    if (existing.rows.length > 0) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const verificationToken = randomUUID();

    const result = await query(
      `INSERT INTO users (email, phone, password_hash, role, program, verification_token)
       VALUES ($1, $2, $3, 'applicant', $4, $5)
       RETURNING id, email, phone, role, program`,
      [email.toLowerCase(), phone.trim(), passwordHash, program, verificationToken]
    );

    const user = result.rows[0];

    // Create application record with "submitted" default
    const appResult = await query(
      `INSERT INTO applications (user_id, status, completion_percentage)
       VALUES ($1, 'submitted', 0) RETURNING id`,
      [user.id]
    );
    const applicationId = appResult.rows[0].id;

    // Notify all admins about new registration
    const admins = await query(
      "SELECT id FROM users WHERE role IN ('admin', 'superadmin')"
    );
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")} ${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()}`;
    for (const admin of admins.rows) {
      await query(
        `INSERT INTO notifications (user_id, application_id, message, notification_type)
         VALUES ($1, $2, $3, $4)`,
        [
          admin.id,
          applicationId,
          `${user.email} registered at ${timeStr}`,
          "applicant_update",
        ]
      );
    }

    // Send verification email with credentials (non-blocking - don't fail registration if email fails)
    sendVerificationEmail(user.email, verificationToken, password).catch((err) =>
      console.error("[REGISTER] Failed to send verification email:", err)
    );

    return NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, program: user.program },
      message:
        "Registration successful. Please check your email to verify your account.",
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
