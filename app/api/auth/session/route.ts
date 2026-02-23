import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ user: null });
    }

    const result = await query(
      "SELECT id, email, phone, role, program, email_verified, profile_photo_path, first_name, last_name FROM users WHERE id = $1",
      [session.userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({ user: result.rows[0] });
  } catch {
    return NextResponse.json({ user: null });
  }
}
