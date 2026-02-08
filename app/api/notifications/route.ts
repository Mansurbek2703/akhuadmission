import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const sort = searchParams.get("sort") || "time";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "5");
    const offset = (page - 1) * limit;

    let orderClause = "ORDER BY n.created_at DESC";
    if (sort === "unread") {
      orderClause = "ORDER BY n.is_read ASC, n.created_at DESC";
    }

    const result = await query(
      `SELECT n.id, n.user_id, n.application_id, n.message, n.notification_type,
              n.changed_fields, n.is_read, n.created_at,
              a.surname, a.given_name, a.status as app_status,
              a.completion_percentage, a.assigned_admin_id
       FROM notifications n
       LEFT JOIN applications a ON n.application_id = a.id
       WHERE n.user_id = $1
       ${orderClause}
       LIMIT $2 OFFSET $3`,
      [session.userId, limit, offset]
    );

    const totalResult = await query(
      "SELECT COUNT(*) as count FROM notifications WHERE user_id = $1",
      [session.userId]
    );
    const totalCount = parseInt(totalResult.rows[0].count);

    const unreadResult = await query(
      "SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND is_read = FALSE",
      [session.userId]
    );
    const unreadCount = parseInt(unreadResult.rows[0].count);

    return NextResponse.json({
      notifications: result.rows,
      unreadCount,
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
      hasMore: offset + limit < totalCount,
    });
  } catch (error) {
    console.error("Notifications fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { notificationId, markAll } = body;

    if (markAll) {
      await query(
        "UPDATE notifications SET is_read = TRUE WHERE user_id = $1",
        [session.userId]
      );
    } else if (notificationId) {
      await query(
        "UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2",
        [notificationId, session.userId]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Notification update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
