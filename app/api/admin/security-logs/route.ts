import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "superadmin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await query(
      `SELECT al.id, al.user_id, al.action, al.details, al.ip_address, al.created_at,
              u.email as user_email, u.role as user_role,
              TRIM(COALESCE(u.first_name, '') || ' ' || COALESCE(u.last_name, '')) as user_name
       FROM activity_logs al
       JOIN users u ON al.user_id = u.id
       WHERE al.action = 'login'
       ORDER BY al.created_at DESC
       LIMIT 500`
    );

    return NextResponse.json({ logs: result.rows });
  } catch (error) {
    console.error("Security logs fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
