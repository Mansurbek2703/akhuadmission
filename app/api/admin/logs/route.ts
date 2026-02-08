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
      `SELECT al.*, u.email as admin_email
       FROM admin_logs al
       JOIN users u ON al.admin_id = u.id
       ORDER BY al.created_at DESC
       LIMIT 200`
    );

    return NextResponse.json({ logs: result.rows });
  } catch (error) {
    console.error("Logs fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
