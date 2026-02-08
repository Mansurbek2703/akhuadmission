import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "superadmin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await query(
      "SELECT id, email, role, created_at FROM users WHERE role IN ('admin', 'superadmin') ORDER BY created_at DESC"
    );

    return NextResponse.json({ admins: result.rows });
  } catch (error) {
    console.error("Admin users fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "superadmin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { email, password, role } = body;

    if (!email || !password || !role) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (!["admin", "superadmin"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const existing = await query("SELECT id FROM users WHERE email = $1", [
      email.toLowerCase(),
    ]);
    if (existing.rows.length > 0) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await query(
      `INSERT INTO users (email, password_hash, role, email_verified)
       VALUES ($1, $2, $3, TRUE)
       RETURNING id, email, role, created_at`,
      [email.toLowerCase(), passwordHash, role]
    );

    await query(
      "INSERT INTO admin_logs (admin_id, action, details) VALUES ($1, $2, $3)",
      [session.userId, "create_admin", `Created ${role}: ${email}`]
    );

    return NextResponse.json({ admin: result.rows[0] });
  } catch (error) {
    console.error("Admin create error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "superadmin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("id");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    if (userId === session.userId) {
      return NextResponse.json(
        { error: "Cannot remove yourself" },
        { status: 400 }
      );
    }

    const userResult = await query(
      "SELECT email, role FROM users WHERE id = $1",
      [userId]
    );
    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await query("DELETE FROM users WHERE id = $1 AND role != 'applicant'", [
      userId,
    ]);

    await query(
      "INSERT INTO admin_logs (admin_id, action, details) VALUES ($1, $2, $3)",
      [
        session.userId,
        "remove_admin",
        `Removed: ${userResult.rows[0].email}`,
      ]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin delete error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
