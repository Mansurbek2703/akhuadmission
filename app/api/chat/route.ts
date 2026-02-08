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
    const applicationId = searchParams.get("application_id");

    if (!applicationId) {
      return NextResponse.json(
        { error: "Application ID is required" },
        { status: 400 }
      );
    }

    // Verify access
    if (session.role === "applicant") {
      const check = await query(
        "SELECT id FROM applications WHERE id = $1 AND user_id = $2",
        [applicationId, session.userId]
      );
      if (check.rows.length === 0) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const messages = await query(
      `SELECT cm.*, u.email as sender_email, u.first_name as sender_first_name, u.last_name as sender_last_name, u.position as sender_position
       FROM chat_messages cm
       JOIN users u ON cm.sender_id = u.id
       WHERE cm.application_id = $1
       ORDER BY cm.created_at ASC`,
      [applicationId]
    );

    // Mark messages as read for current user
    await query(
      `UPDATE chat_messages SET is_read = TRUE
       WHERE application_id = $1 AND sender_id != $2 AND is_read = FALSE`,
      [applicationId, session.userId]
    );

    // If admin/superadmin opens chat, auto-assign application to them (For Me)
    if (session.role === "admin" || session.role === "superadmin") {
      const assignCheck = await query(
        "SELECT assigned_admin_id FROM applications WHERE id = $1",
        [applicationId]
      );
      const currentAssigned = assignCheck.rows[0]?.assigned_admin_id;

      if (!currentAssigned) {
        // No one assigned yet, assign this admin
        await query(
          `UPDATE applications SET assigned_admin_id = $1 WHERE id = $2`,
          [session.userId, applicationId]
        );
      } else if (currentAssigned !== session.userId) {
        // Already assigned to another admin, return info
        const assignedAdmin = await query(
          "SELECT first_name, last_name FROM users WHERE id = $1",
          [currentAssigned]
        );
        const aName = assignedAdmin.rows[0];
        const assignedName = aName?.first_name && aName?.last_name
          ? `${aName.first_name} ${aName.last_name}`
          : "another admin";
        return NextResponse.json({
          messages: messages.rows,
          assignedToOther: true,
          assignedAdminName: assignedName,
        });
      }
    }

    return NextResponse.json({ messages: messages.rows });
  } catch (error) {
    console.error("Chat fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { applicationId, message, filePath, fileName } = body;

    if (!applicationId || (!message && !filePath)) {
      return NextResponse.json(
        { error: "Application ID and message or file are required" },
        { status: 400 }
      );
    }

    // If admin/superadmin, check if this application is already assigned to another admin
    if (session.role === "admin" || session.role === "superadmin") {
      const assignCheck = await query(
        "SELECT assigned_admin_id FROM applications WHERE id = $1",
        [applicationId]
      );
      const assignedId = assignCheck.rows[0]?.assigned_admin_id;
      if (assignedId && assignedId !== session.userId) {
        // Get assigned admin name
        const assignedAdmin = await query(
          "SELECT first_name, last_name FROM users WHERE id = $1",
          [assignedId]
        );
        const aName = assignedAdmin.rows[0];
        const assignedName = aName?.first_name && aName?.last_name
          ? `${aName.first_name} ${aName.last_name}`
          : "another admin";
        return NextResponse.json(
          { error: `This applicant is in communication with ${assignedName}` },
          { status: 403 }
        );
      }
    }

    const result = await query(
      `INSERT INTO chat_messages (application_id, sender_id, sender_role, message, file_path, file_name)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        applicationId,
        session.userId,
        session.role,
        message || null,
        filePath || null,
        fileName || null,
      ]
    );

    // Get sender info
    const userResult = await query(
      "SELECT email, first_name, last_name, position FROM users WHERE id = $1",
      [session.userId]
    );
    const senderUser = userResult.rows[0];

    const newMessage = {
      ...result.rows[0],
      sender_email: senderUser?.email,
      sender_first_name: senderUser?.first_name,
      sender_last_name: senderUser?.last_name,
      sender_position: senderUser?.position,
    };

    // If admin/superadmin sends chat, auto-assign application to them (For Me)
    if (session.role === "admin" || session.role === "superadmin") {
      await query(
        `UPDATE applications SET assigned_admin_id = $1 WHERE id = $2 AND assigned_admin_id IS NULL`,
        [session.userId, applicationId]
      );
    }

    // Notify the other party - group chat messages into one notification
    if (session.role === "applicant") {
      // Check if application is assigned
      const appAssign = await query(
        "SELECT assigned_admin_id FROM applications WHERE id = $1",
        [applicationId]
      );
      const assignedAdminId = appAssign.rows[0]?.assigned_admin_id;

      let targetAdminIds: string[];
      if (assignedAdminId) {
        // If assigned, only notify the assigned admin (for their "for me" and chat)
        targetAdminIds = [assignedAdminId];
      } else {
        // If unassigned, notify ALL admins (for their "all" tab and chat)
        const admins = await query(
          "SELECT id FROM users WHERE role IN ('admin', 'superadmin')"
        );
        targetAdminIds = admins.rows.map((a: { id: string }) => a.id);
      }

      for (const adminId of targetAdminIds) {
        const existing = await query(
          `SELECT id, message FROM notifications
           WHERE user_id = $1 AND application_id = $2
             AND notification_type = 'chat_message' AND is_read = FALSE
           ORDER BY created_at DESC LIMIT 1`,
          [adminId, applicationId]
        );
        if (existing.rows.length > 0) {
          const current = existing.rows[0].message;
          const countMatch = current.match(/\((\d+)\)$/);
          const count = countMatch ? parseInt(countMatch[1]) + 1 : 2;
          await query(
            `UPDATE notifications SET message = $1, created_at = NOW() WHERE id = $2`,
            [`New chat messages from applicant (${count})`, existing.rows[0].id]
          );
        } else {
          await query(
            `INSERT INTO notifications (user_id, application_id, message, notification_type)
             VALUES ($1, $2, $3, $4)`,
            [adminId, applicationId, "New chat message from applicant", "chat_message"]
          );
        }
      }
    } else {
      const app = await query(
        "SELECT user_id FROM applications WHERE id = $1",
        [applicationId]
      );
      if (app.rows.length > 0) {
        const targetUserId = app.rows[0].user_id;
        const adminDisplayName = senderUser?.first_name && senderUser?.last_name
          ? `${senderUser.first_name} ${senderUser.last_name}`
          : "Registrar Office";
        // Check if there's already an unread chat notification for this application
        const existing = await query(
          `SELECT id, message FROM notifications
           WHERE user_id = $1 AND application_id = $2
             AND notification_type = 'chat_message' AND is_read = FALSE
           ORDER BY created_at DESC LIMIT 1`,
          [targetUserId, applicationId]
        );
        if (existing.rows.length > 0) {
          const current = existing.rows[0].message;
          const countMatch = current.match(/\((\d+)\)$/);
          const count = countMatch ? parseInt(countMatch[1]) + 1 : 2;
          await query(
            `UPDATE notifications SET message = $1, created_at = NOW() WHERE id = $2`,
            [`New messages from ${adminDisplayName} (${count})`, existing.rows[0].id]
          );
        } else {
          await query(
            `INSERT INTO notifications (user_id, application_id, message, notification_type)
             VALUES ($1, $2, $3, $4)`,
            [targetUserId, applicationId, `New message from ${adminDisplayName}`, "chat_message"]
          );
        }
      }
    }

    return NextResponse.json({ message: newMessage });
  } catch (error) {
    console.error("Chat send error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
