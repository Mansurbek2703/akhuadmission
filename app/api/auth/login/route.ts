import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { query } from "@/lib/db";
import { createToken } from "@/lib/auth";

// Helper: increment IP attempts, lock if >= 5
async function incrementIpAttempts(ip: string) {
  const existing = await query(
    "SELECT attempts FROM ip_login_attempts WHERE ip_address = $1",
    [ip]
  );
  const newAttempts = existing.rows.length > 0 ? existing.rows[0].attempts + 1 : 1;
  const lockUntil = newAttempts >= 5 ? new Date(Date.now() + 24 * 60 * 60 * 1000) : null;

  if (existing.rows.length > 0) {
    await query(
      "UPDATE ip_login_attempts SET attempts = $1, locked_until = $2, last_attempt = NOW() WHERE ip_address = $3",
      [newAttempts, lockUntil, ip]
    );
  } else {
    await query(
      "INSERT INTO ip_login_attempts (ip_address, attempts, locked_until, last_attempt) VALUES ($1, $2, $3, NOW())",
      [ip, newAttempts, lockUntil]
    );
  }
  return newAttempts;
}

// Helper: reset IP attempts on success
async function resetIpAttempts(ip: string) {
  await query(
    "DELETE FROM ip_login_attempts WHERE ip_address = $1",
    [ip]
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    // Get client IP
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : req.headers.get("x-real-ip") || "unknown";

    // --- IP-based brute force check ---
    const ipResult = await query(
      "SELECT attempts, locked_until FROM ip_login_attempts WHERE ip_address = $1",
      [ip]
    );
    if (ipResult.rows.length > 0) {
      const ipRow = ipResult.rows[0];
      if (ipRow.locked_until && new Date(ipRow.locked_until) > new Date()) {
        const remainingMs = new Date(ipRow.locked_until).getTime() - Date.now();
        const remainingHours = Math.floor(remainingMs / 3600000);
        const remainingMinutes = Math.ceil((remainingMs % 3600000) / 60000);
        const timeStr =
          remainingHours > 0
            ? `${remainingHours} hour(s) ${remainingMinutes} minute(s)`
            : `${remainingMinutes} minute(s)`;
        return NextResponse.json(
          { error: `Too many requests from your IP. Blocked for ${timeStr}.` },
          { status: 429 }
        );
      }
      // Lock expired - reset
      if (ipRow.locked_until) {
        await resetIpAttempts(ip);
      }
    }

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
      // User not found - still increment IP attempts
      const ipAttempts = await incrementIpAttempts(ip);
      if (ipAttempts >= 5) {
        return NextResponse.json(
          { error: "Too many failed attempts. Your IP is blocked for 24 hours." },
          { status: 429 }
        );
      }
      return NextResponse.json(
        { error: `Invalid email or password. ${5 - ipAttempts} attempt(s) remaining.` },
        { status: 401 }
      );
    }

    const user = result.rows[0];

    // Check if account is locked
    if (user.locked_until) {
      if (new Date(user.locked_until) > new Date()) {
        const remainingMs = new Date(user.locked_until).getTime() - Date.now();
        const remainingHours = Math.floor(remainingMs / 3600000);
        const remainingMinutes = Math.ceil((remainingMs % 3600000) / 60000);
        const timeStr =
          remainingHours > 0
            ? `${remainingHours} hour(s) ${remainingMinutes} minute(s)`
            : `${remainingMinutes} minute(s)`;
        return NextResponse.json(
          {
            error: `Account is locked due to too many failed attempts. Try again in ${timeStr}.`,
          },
          { status: 423 }
        );
      }
      // Lock expired - reset attempts
      await query(
        "UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE id = $1",
        [user.id]
      );
      user.failed_login_attempts = 0;
      user.locked_until = null;
    }

    // Check password FIRST (before email_verified check) so brute force counter always works
    const passwordValid = await bcrypt.compare(password, user.password_hash);

    if (!passwordValid) {
      // Increment both user and IP attempts
      await incrementIpAttempts(ip);
      const attempts = user.failed_login_attempts + 1;
      if (attempts >= 5) {
        const lockUntil = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await query(
          "UPDATE users SET failed_login_attempts = $1, locked_until = $2 WHERE id = $3",
          [attempts, lockUntil, user.id]
        );
        return NextResponse.json(
          {
            error:
              "Too many failed attempts. Account locked for 24 hours.",
          },
          { status: 423 }
        );
      }
      await query(
        "UPDATE users SET failed_login_attempts = $1 WHERE id = $2",
        [attempts, user.id]
      );
      return NextResponse.json(
        {
          error: `Invalid email or password. ${5 - attempts} attempt(s) remaining.`,
        },
        { status: 401 }
      );
    }

    // Password is correct - now check email verification
    if (!user.email_verified) {
      return NextResponse.json(
        {
          error:
            "Please verify your email before signing in. Check your inbox for the verification link.",
        },
        { status: 403 }
      );
    }

    // Reset failed attempts on successful login (both user and IP)
    await query(
      "UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE id = $1",
      [user.id]
    );
    await resetIpAttempts(ip);

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
