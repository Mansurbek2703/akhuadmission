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
      `SELECT cm.*, u.email as sender_email
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

    // Get sender email
    const userResult = await query("SELECT email FROM users WHERE id = $1", [
      session.userId,
    ]);

    const newMessage = {
      ...result.rows[0],
      sender_email: userResult.rows[0]?.email,
    };

    // Notify the other party
    if (session.role === "applicant") {
      const admins = await query(
        "SELECT id FROM users WHERE role IN ('admin', 'superadmin')"
      );
      for (const admin of admins.rows) {
        await query(
          "INSERT INTO notifications (user_id, application_id, message) VALUES ($1, $2, $3)",
          [admin.id, applicationId, "New chat message from applicant"]
        );
      }
    } else {
      const app = await query(
        "SELECT user_id FROM applications WHERE id = $1",
        [applicationId]
      );
      if (app.rows.length > 0) {
        await query(
          "INSERT INTO notifications (user_id, application_id, message) VALUES ($1, $2, $3)",
          [
            app.rows[0].user_id,
            applicationId,
            "New message from Registrar Office",
          ]
        );
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
