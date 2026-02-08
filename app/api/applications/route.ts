import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";
import { sendStatusUpdateEmail } from "@/lib/email";

const FIELD_LABELS: Record<string, string> = {
  education_type: "Education Type",
  surname: "Surname",
  given_name: "Given Name",
  gender: "Gender",
  citizenship: "Citizenship",
  card_number: "Passport Number",
  date_of_birth: "Date of Birth",
  date_of_issue: "Date of Issue",
  date_of_expiry: "Date of Expiry",
  personal_number: "Personal Number (JSHIR)",
  place_of_birth: "Place of Birth",
  passport_image_path: "Passport Image",
  attestat_pdf_path: "Attestat / Diploma",
  language_cert_type: "Language Certificate Type",
  language_cert_pdf_path: "Language Certificate PDF",
  language_cert_score: "Language Certificate Score",
  language_cert_date: "Language Certificate Date",
  social_registry: "Social Registry",
  social_registry_pdf_path: "Social Registry PDF",
  status: "Application Status",
  completion_percentage: "Completion Percentage",
};

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.role === "applicant") {
      const result = await query(
        `SELECT a.*, u.email as user_email, u.program as user_program
         FROM applications a
         JOIN users u ON a.user_id = u.id
         WHERE a.user_id = $1
         ORDER BY a.created_at DESC
         LIMIT 1`,
        [session.userId]
      );
      return NextResponse.json({ application: result.rows[0] || null });
    }

    // Admin / Superadmin - auto transition "submitted" to "pending_review" when they view
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const educationType = searchParams.get("education_type");
    const dateFrom = searchParams.get("date_from");
    const dateTo = searchParams.get("date_to");
    const forMe = searchParams.get("for_me");
    const search = searchParams.get("search");

    let sql = `
      SELECT a.*, u.email as user_email, u.program as user_program,
             admin_user.email as assigned_admin_email
      FROM applications a
      JOIN users u ON a.user_id = u.id
      LEFT JOIN users admin_user ON a.assigned_admin_id = admin_user.id
      WHERE 1=1
    `;
    const params: unknown[] = [];
    let paramIndex = 1;

    if (forMe === "true") {
      sql += ` AND a.assigned_admin_id = $${paramIndex}`;
      params.push(session.userId);
      paramIndex++;
    }

    if (status) {
      sql += ` AND a.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (educationType) {
      sql += ` AND a.education_type = $${paramIndex}`;
      params.push(educationType);
      paramIndex++;
    }

    if (dateFrom) {
      sql += ` AND a.created_at >= $${paramIndex}`;
      params.push(dateFrom);
      paramIndex++;
    }

    if (dateTo) {
      sql += ` AND a.created_at <= $${paramIndex}`;
      params.push(dateTo + "T23:59:59");
      paramIndex++;
    }

    if (search) {
      sql += ` AND (u.email ILIKE $${paramIndex} OR a.surname ILIKE $${paramIndex} OR a.given_name ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    sql += " ORDER BY a.updated_at DESC";

    const result = await query(sql, params);
    return NextResponse.json({ applications: result.rows });
  } catch (error) {
    console.error("Applications fetch error:", error);
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
    const { applicationId, ...fields } = body;

    if (!applicationId) {
      return NextResponse.json(
        { error: "Application ID is required" },
        { status: 400 }
      );
    }

    // Check ownership for applicants
    if (session.role === "applicant") {
      const check = await query(
        "SELECT id FROM applications WHERE id = $1 AND user_id = $2",
        [applicationId, session.userId]
      );
      if (check.rows.length === 0) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    // Build dynamic update
    const allowedFields = [
      "education_type", "surname", "given_name", "gender", "citizenship",
      "card_number", "date_of_birth", "date_of_issue", "date_of_expiry",
      "personal_number", "place_of_birth", "passport_image_path",
      "attestat_pdf_path", "language_cert_type", "language_cert_pdf_path",
      "language_cert_score", "language_cert_date", "social_registry",
      "social_registry_pdf_path", "status", "completion_percentage",
    ];

    const setClauses: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    for (const [key, value] of Object.entries(fields)) {
      if (allowedFields.includes(key)) {
        setClauses.push(`${key} = $${idx}`);
        values.push(value);
        idx++;
      }
    }

    if (setClauses.length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    setClauses.push(`updated_at = NOW()`);

    // If admin edits, assign to them (For Me logic)
    if (session.role === "admin" || session.role === "superadmin") {
      // Fetch OLD values before update to track changes
      const oldResult = await query(
        "SELECT * FROM applications WHERE id = $1",
        [applicationId]
      );
      const oldApp = oldResult.rows[0];

      // Auto-transition: if status was "submitted", set to "pending_review" (admin has opened it)
      if (oldApp?.status === "submitted" && !fields.status) {
        setClauses.push(`status = $${idx}`);
        values.push("pending_review");
        idx++;
      }

      setClauses.push(`assigned_admin_id = $${idx}`);
      values.push(session.userId);
      idx++;

      // Log admin action
      await query(
        "INSERT INTO admin_logs (admin_id, application_id, action, details) VALUES ($1, $2, $3, $4)",
        [session.userId, applicationId, "edit_application", JSON.stringify(fields)]
      );

      // Compute exactly which fields changed (old -> new)
      const changedFields: Record<string, { old_value: string; new_value: string; label: string }> = {};
      for (const [key, newVal] of Object.entries(fields)) {
        if (!allowedFields.includes(key) || key === "completion_percentage") continue;
        let oldVal = oldApp?.[key];
        if (oldVal instanceof Date) {
          oldVal = oldVal.toISOString().split("T")[0];
        } else if (typeof oldVal === "string" && oldVal.includes("T")) {
          oldVal = oldVal.split("T")[0];
        }
        const oldStr = oldVal != null ? String(oldVal) : "";
        const newStr = newVal != null ? String(newVal) : "";
        if (oldStr !== newStr) {
          changedFields[key] = {
            old_value: oldStr || "(empty)",
            new_value: newStr || "(empty)",
            label: FIELD_LABELS[key] || key,
          };
        }
      }

      // Notify applicant with detailed change info
      const appResult = await query(
        "SELECT a.user_id, a.given_name, a.surname, u.email FROM applications a JOIN users u ON a.user_id = u.id WHERE a.id = $1",
        [applicationId]
      );
      if (appResult.rows.length > 0) {
        const applicant = appResult.rows[0];
        const changedCount = Object.keys(changedFields).length;

        if (changedCount > 0) {
          const changedLabels = Object.values(changedFields).map((f) => f.label).join(", ");
          const notifMessage = `${changedCount} field(s) updated in your application: ${changedLabels}`;
          const notifType = fields.status ? "status_change" : "field_change";

          await query(
            `INSERT INTO notifications (user_id, application_id, message, notification_type, changed_fields)
             VALUES ($1, $2, $3, $4, $5)`,
            [applicant.user_id, applicationId, notifMessage, notifType, JSON.stringify(changedFields)]
          );
        }

        // Send email notification on status change
        if (fields.status && applicant.email) {
          sendStatusUpdateEmail(
            applicant.email,
            `${applicant.given_name || ""} ${applicant.surname || ""}`.trim() || "Applicant",
            fields.status
          ).catch((err) =>
            console.error("[APP] Failed to send status email:", err)
          );
        }
      }
    } else {
      // Applicant updated, notify admins
      const admins = await query(
        "SELECT id FROM users WHERE role IN ('admin', 'superadmin')"
      );
      for (const admin of admins.rows) {
        await query(
          `INSERT INTO notifications (user_id, application_id, message, notification_type)
           VALUES ($1, $2, $3, $4)`,
          [admin.id, applicationId, "Applicant has updated their application", "applicant_update"]
        );
      }
    }

    values.push(applicationId);
    const sql = `UPDATE applications SET ${setClauses.join(", ")} WHERE id = $${idx} RETURNING *`;
    const result = await query(sql, values);

    return NextResponse.json({ application: result.rows[0] });
  } catch (error) {
    console.error("Application update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
