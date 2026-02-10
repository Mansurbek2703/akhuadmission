import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { query } from "@/lib/db";
import { createToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const result = await query(
      "SELECT id, email, password_hash, role, program, email_verified, failed_login_attempts, locked_until FROM users WHERE email = $1",
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const user = result.rows[0];

    // Check if account is locked
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      const remainingMinutes = Math.ceil(
        (new Date(user.locked_until).getTime() - Date.now()) / 60000
      );
      return NextResponse.json(
        {
          error: `Account is locked. Try again in ${remainingMinutes} minute(s).`,
        },
        { status: 423 }
      );
    }

    const passwordValid = await bcrypt.compare(password, user.password_hash);

    if (!passwordValid) {
      const attempts = user.failed_login_attempts + 1;
      if (attempts >= 5) {
        const lockUntil = new Date(Date.now() + 15 * 60 * 1000);
        await query(
          "UPDATE users SET failed_login_attempts = $1, locked_until = $2 WHERE id = $3",
          [attempts, lockUntil, user.id]
        );
        return NextResponse.json(
          { error: "Too many failed attempts. Account locked for 15 minutes." },
          { status: 423 }
        );
      } else {
        await query(
          "UPDATE users SET failed_login_attempts = $1 WHERE id = $2",
          [attempts, user.id]
        );
      }
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Reset failed attempts on successful login
    await query(
      "UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE id = $1",
      [user.id]
    );

    // Log activity
    await query(
      "INSERT INTO activity_logs (user_id, action, details) VALUES ($1, $2, $3)",
      [user.id, "login", "User logged in"]
    );

    const token = await createToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        program: user.program,
        email_verified: user.email_verified,
      },
    });


    response.cookies.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
