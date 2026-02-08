import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { query } from "@/lib/db";
import { randomUUID } from "crypto";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, program } = body;

    if (!email || !password || !program) {
      return NextResponse.json(
        { error: "All fields are required" },
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
      `INSERT INTO users (email, password_hash, role, program, verification_token)
       VALUES ($1, $2, 'applicant', $3, $4)
       RETURNING id, email, role, program`,
      [email.toLowerCase(), passwordHash, program, verificationToken]
    );

    const user = result.rows[0];

    // Create application record with "submitted" default
    await query(
      `INSERT INTO applications (user_id, status, completion_percentage)
       VALUES ($1, 'submitted', 0)`,
      [user.id]
    );

    // Send verification email (non-blocking - don't fail registration if email fails)
    sendVerificationEmail(user.email, verificationToken).catch((err) =>
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
