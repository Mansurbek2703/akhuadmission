import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "superadmin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");

    let sql = `
      SELECT scl.id, scl.admin_id, scl.application_id, scl.old_status, scl.new_status, scl.created_at,
             u.email as admin_email,
             TRIM(COALESCE(u.first_name, '') || ' ' || COALESCE(u.last_name, '')) as admin_name,
             a.unikal_id as applicant_unikal_id,
             TRIM(COALESCE(a.surname, '') || ' ' || COALESCE(a.given_name, '')) as applicant_name,
             applicant_user.email as applicant_email
      FROM status_change_logs scl
      JOIN users u ON scl.admin_id = u.id
      JOIN applications a ON scl.application_id = a.id
      JOIN users applicant_user ON a.user_id = applicant_user.id
      WHERE 1=1
    `;
    const params: unknown[] = [];
    let idx = 1;

    if (search) {
      const isNumeric = /^\d+$/.test(search.trim());
      if (isNumeric) {
        sql += ` AND (a.unikal_id = $${idx} OR a.surname ILIKE $${idx + 1} OR a.given_name ILIKE $${idx + 1} OR applicant_user.email ILIKE $${idx + 1})`;
        params.push(parseInt(search.trim(), 10));
        idx++;
        params.push(`%${search}%`);
        idx++;
      } else {
        sql += ` AND (a.surname ILIKE $${idx} OR a.given_name ILIKE $${idx} OR applicant_user.email ILIKE $${idx})`;
        params.push(`%${search}%`);
        idx++;
      }
    }

    sql += " ORDER BY scl.created_at DESC LIMIT 500";

    const result = await query(sql, params);
    return NextResponse.json({ logs: result.rows });
  } catch (error) {
    console.error("Status logs fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
