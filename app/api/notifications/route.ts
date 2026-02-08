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

    // For admin/superadmin: exclude chat_message notifications from the bell
    // (admins see chat notifications via the Chat nav badge instead)
    const isAdminRole = session.role === "admin" || session.role === "superadmin";
    const isSuperadmin = session.role === "superadmin";
    const chatFilterAliased = isAdminRole ? "AND n.notification_type != 'chat_message'" : "";
    const chatFilterPlain = isAdminRole ? "AND notification_type != 'chat_message'" : "";

    // For regular admins: show notifications for:
    // 1. Applications assigned to them (any notification type)
    // 2. Unassigned applications' chat_message notifications (all admins see unassigned chats)
    const assignmentFilterAliased = !isSuperadmin && isAdminRole
      ? "AND (a.assigned_admin_id = $1 OR (a.assigned_admin_id IS NULL AND n.notification_type = 'chat_message'))"
      : "";
    const assignmentFilterPlain = !isSuperadmin && isAdminRole
      ? "AND (assigned_admin_id = $1 OR (assigned_admin_id IS NULL AND notification_type = 'chat_message'))"
      : "";

    const queryParams = isAdminRole && !isSuperadmin
      ? [session.userId, limit, offset]
      : [session.userId, limit, offset];

    const result = await query(
      `SELECT n.id, n.user_id, n.application_id, n.message, n.notification_type,
              n.changed_fields, n.is_read, n.created_at,
              a.surname, a.given_name, a.status as app_status,
              a.completion_percentage, a.assigned_admin_id
       FROM notifications n
       LEFT JOIN applications a ON n.application_id = a.id
       WHERE n.user_id = $1 ${chatFilterAliased} ${assignmentFilterAliased}
       ${orderClause}
       LIMIT $2 OFFSET $3`,
      queryParams
    );

    const countParams = isAdminRole && !isSuperadmin
      ? [session.userId]
      : [session.userId];

    const totalResult = await query(
      `SELECT COUNT(*) as count FROM notifications n
       LEFT JOIN applications a ON n.application_id = a.id
       WHERE n.user_id = $1 ${chatFilterPlain} ${assignmentFilterPlain}`,
      countParams
    );
    const totalCount = parseInt(totalResult.rows[0].count);

    const unreadResult = await query(
      `SELECT COUNT(*) as count FROM notifications n
       LEFT JOIN applications a ON n.application_id = a.id
       WHERE n.user_id = $1 AND n.is_read = FALSE ${chatFilterPlain} ${assignmentFilterPlain}`,
      countParams
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
    const { notificationId, markAll, markChatRead } = body;

    const isAdminRole = session.role === "admin" || session.role === "superadmin";

    // Mark all chat_message notifications as read for this user
    if (markChatRead) {
      await query(
        `UPDATE notifications SET is_read = TRUE WHERE user_id = $1 AND notification_type = 'chat_message' AND is_read = FALSE`,
        [session.userId]
      );
      return NextResponse.json({ success: true });
    }

    if (markAll) {
      if (isAdminRole) {
        // Mark all notifications for all admins/superadmins as read (shared read)
        const adminIds = await query(
          "SELECT id FROM users WHERE role IN ('admin', 'superadmin')"
        );
        const ids = adminIds.rows.map((r: { id: string }) => r.id);
        if (ids.length > 0) {
          await query(
            `UPDATE notifications SET is_read = TRUE WHERE user_id = ANY($1)`,
            [ids]
          );
        }
      } else {
        await query(
          "UPDATE notifications SET is_read = TRUE WHERE user_id = $1",
          [session.userId]
        );
      }
    } else if (notificationId) {
      await query(
        "UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2",
        [notificationId, session.userId]
      );
      // Shared read: also mark same application's notifications for other admins
      if (isAdminRole) {
        const notifResult = await query(
          "SELECT application_id, notification_type FROM notifications WHERE id = $1",
          [notificationId]
        );
        if (notifResult.rows.length > 0) {
          const { application_id, notification_type } = notifResult.rows[0];
          if (application_id) {
            const adminIds = await query(
              "SELECT id FROM users WHERE role IN ('admin', 'superadmin')"
            );
            const ids = adminIds.rows.map((r: { id: string }) => r.id);
            await query(
              `UPDATE notifications SET is_read = TRUE
               WHERE application_id = $1 AND notification_type = $2 AND user_id = ANY($3) AND is_read = FALSE`,
              [application_id, notification_type, ids]
            );
          }
        }
      }
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
