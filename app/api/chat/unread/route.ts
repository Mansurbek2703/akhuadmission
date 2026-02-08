import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || (session.role !== "admin" && session.role !== "superadmin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isSuperadmin = session.role === "superadmin";

    let allUnreadMap: Record<string, number> = {};
    let forMeUnreadMap: Record<string, number> = {};

    if (isSuperadmin) {
      // Superadmin sees ALL unread messages in both tabs
      const allResult = await query(
        `SELECT cm.application_id, COUNT(*) as unread_count
         FROM chat_messages cm
         WHERE cm.sender_role = 'applicant' AND cm.is_read = FALSE
         GROUP BY cm.application_id`
      );
      for (const row of allResult.rows) {
        allUnreadMap[row.application_id] = parseInt(row.unread_count);
      }
      forMeUnreadMap = allUnreadMap;
    } else {
      // Regular admin:
      // - allUnreadMap: ONLY unassigned applications
      // - forMeUnreadMap: ONLY assigned applications

      // Unassigned applications' unread messages
      const allResult = await query(
        `SELECT cm.application_id, COUNT(*) as unread_count
         FROM chat_messages cm
         JOIN applications a ON cm.application_id = a.id
         WHERE cm.sender_role = 'applicant' AND cm.is_read = FALSE AND a.assigned_admin_id IS NULL
         GROUP BY cm.application_id`
      );
      for (const row of allResult.rows) {
        allUnreadMap[row.application_id] = parseInt(row.unread_count);
      }

      // Assigned to current admin unread messages
      const forMeResult = await query(
        `SELECT cm.application_id, COUNT(*) as unread_count
         FROM chat_messages cm
         JOIN applications a ON cm.application_id = a.id
         WHERE cm.sender_role = 'applicant' AND cm.is_read = FALSE AND a.assigned_admin_id = $1
         GROUP BY cm.application_id`,
        [session.userId]
      );
      for (const row of forMeResult.rows) {
        forMeUnreadMap[row.application_id] = parseInt(row.unread_count);
      }
    }

    // Total unread chat count (for nav badge) - only for assigned applications
    let totalUnreadChats = 0;
    if (isSuperadmin) {
      const totalResult = await query(
        `SELECT COUNT(DISTINCT cm.application_id) as total
         FROM chat_messages cm
         WHERE cm.sender_role = 'applicant' AND cm.is_read = FALSE`
      );
      totalUnreadChats = parseInt(totalResult.rows[0]?.total || "0");
    } else {
      const totalResult = await query(
        `SELECT COUNT(DISTINCT cm.application_id) as total
         FROM chat_messages cm
         JOIN applications a ON cm.application_id = a.id
         WHERE cm.sender_role = 'applicant' AND cm.is_read = FALSE AND a.assigned_admin_id = $1`,
        [session.userId]
      );
      totalUnreadChats = parseInt(totalResult.rows[0]?.total || "0");
    }

    return NextResponse.json({ allUnreadMap, forMeUnreadMap, totalUnreadChats });
  } catch (error) {
    console.error("Unread chat fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
