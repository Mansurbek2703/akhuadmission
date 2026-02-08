import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await query(
      `SELECT n.*, a.surname, a.given_name
       FROM notifications n
       LEFT JOIN applications a ON n.application_id = a.id
       WHERE n.user_id = $1
       ORDER BY n.created_at DESC
       LIMIT 50`,
      [session.userId]
    );

    const unreadCount = await query(
      "SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND is_read = FALSE",
      [session.userId]
    );

    return NextResponse.json({
      notifications: result.rows,
      unreadCount: parseInt(unreadCount.rows[0].count),
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
