import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";
import { sendStatusUpdateEmail } from "@/lib/email";

const FIELD_LABELS: Record<string, string> = {
  surname: "Surname",
  given_name: "Given Name",
  gender: "Gender",
  citizenship: "Citizenship",
  citizenship_other: "Citizenship (Other)",
  card_number: "Passport Number",
  date_of_birth: "Date of Birth",
  date_of_issue: "Date of Issue",
  date_of_expiry: "Date of Expiry",
  personal_number: "Personal Number (JSHIR)",
  place_of_birth: "Place of Birth",
  current_address: "Current Address",
  birth_country: "Birth Country",
  birth_region: "Birth Region",
  birth_district: "Birth District",
  birth_street: "Birth Street/House",
  address_country: "Address Country",
  address_region: "Address Region",
  address_district: "Address District",
  address_street: "Address Street/House",
  passport_image_path: "Passport Image",
  personal_phone: "Personal Phone",
  parent_phone: "Parent Phone",
  friend_phone: "Friend Phone",
  education_type: "Education Type",
  institution_type: "Institution Type",
  institution_location: "Institution Location",
  institution_name: "Institution Name",
  attestat_pdf_path: "Attestat / Diploma",
  language_cert_type: "Language Certificate Type",
  language_cert_pdf_path: "Language Certificate PDF",
  language_cert_score: "Language Certificate Score",
  language_cert_id: "Language Certificate ID",
  language_cert_date: "Language Certificate Date",
  sat_score: "SAT Score",
  sat_id: "SAT ID",
  sat_pdf_path: "SAT Certificate PDF",
  cefr_score: "CEFR Score",
  cefr_id: "CEFR ID",
  cefr_pdf_path: "CEFR Certificate PDF",
  social_protection: "Social Protection",
  social_protection_pdf_path: "Social Protection PDF",
  social_registry: "Social Registry",
  social_registry_pdf_path: "Social Registry PDF",
  other_achievements_text: "Other Achievements Notes",
  other_achievements_pdf_path: "Other Achievements PDF",
  oferta_agreed: "Oferta Agreement",
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
      SELECT a.*, u.email as user_email, u.phone as user_phone, u.program as user_program,
             admin_user.email as assigned_admin_email,
             TRIM(COALESCE(admin_user.first_name, '') || ' ' || COALESCE(admin_user.last_name, '')) as assigned_admin_name
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
      const isNumericSearch = /^\d+$/.test(search.trim());
      if (isNumericSearch) {
        sql += ` AND (u.email ILIKE $${paramIndex} OR a.surname ILIKE $${paramIndex} OR a.given_name ILIKE $${paramIndex} OR a.unikal_id = $${paramIndex + 1})`;
        params.push(`%${search}%`);
        paramIndex++;
        params.push(parseInt(search.trim(), 10));
        paramIndex++;
      } else {
        sql += ` AND (u.email ILIKE $${paramIndex} OR a.surname ILIKE $${paramIndex} OR a.given_name ILIKE $${paramIndex})`;
        params.push(`%${search}%`);
        paramIndex++;
      }
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
      "surname", "given_name", "gender", "citizenship", "citizenship_other",
      "card_number", "date_of_birth", "date_of_issue", "date_of_expiry",
      "personal_number", "place_of_birth", "current_address", "passport_image_path",
      "personal_phone", "parent_phone", "friend_phone",
      "education_type", "institution_type", "institution_location", "institution_name",
      "attestat_pdf_path",
      "language_cert_type", "language_cert_pdf_path", "language_cert_score",
      "language_cert_id", "language_cert_date",
      "sat_score", "sat_id", "sat_pdf_path",
      "cefr_score", "cefr_id", "cefr_pdf_path",
      "social_protection", "social_protection_pdf_path",
      "social_registry", "social_registry_pdf_path",
      "other_achievements_text", "other_achievements_pdf_path",
      "hear_about", "sibling_study",
      "confirm_info_correct", "confirm_final_year", "confirm_fake_disqualify", "confirm_fake_cancel",
      "oferta_agreed", "status", "completion_percentage",
      "language_cert_verified", "language_cert_invalid",
      "sat_verified", "sat_invalid",
      "cefr_verified", "cefr_invalid",
      "attestat_verified", "attestat_invalid",
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

      // Check if this is the first admin to open (assign) this application
      const isFirstAssignment = !oldApp?.assigned_admin_id;

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

      // Get admin display name
      const adminInfoResult = await query(
        "SELECT first_name, last_name, position FROM users WHERE id = $1",
        [session.userId]
      );
      const adminInfo = adminInfoResult.rows[0];
      const adminDisplayName = adminInfo?.first_name && adminInfo?.last_name
        ? `${adminInfo.first_name} ${adminInfo.last_name}`
        : "Admin";

      // Notify applicant with detailed change info
      const appResult = await query(
        "SELECT a.user_id, a.given_name, a.surname, u.email FROM applications a JOIN users u ON a.user_id = u.id WHERE a.id = $1",
        [applicationId]
      );
      if (appResult.rows.length > 0) {
        const applicant = appResult.rows[0];

        // Notify applicant that admin has opened/been assigned to their application
        if (isFirstAssignment) {
          const adminPositionStr = adminInfo?.position ? ` (${adminInfo.position})` : "";
          await query(
            `INSERT INTO notifications (user_id, application_id, message, notification_type)
             VALUES ($1, $2, $3, $4)`,
            [
              applicant.user_id,
              applicationId,
              `Your application is now being reviewed by ${adminDisplayName}${adminPositionStr}`,
              "field_change",
            ]
          );
        }

        const changedCount = Object.keys(changedFields).length;

        if (changedCount > 0) {
          const changedLabels = Object.values(changedFields).map((f) => f.label).join(", ");
          const notifMessage = `${adminDisplayName} updated ${changedCount} field(s) in your application: ${changedLabels}`;
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
      // Applicant updated, notify only the assigned admin (or all admins if none assigned yet)
      const appCheck = await query(
        "SELECT assigned_admin_id FROM applications WHERE id = $1",
        [applicationId]
      );
      const assignedAdminId = appCheck.rows[0]?.assigned_admin_id;

      // Get applicant name for notification message
      const applicantInfo = await query(
        "SELECT a.surname, a.given_name, u.email FROM applications a JOIN users u ON a.user_id = u.id WHERE a.id = $1",
        [applicationId]
      );
      const appInfo = applicantInfo.rows[0];
      const applicantName = appInfo?.surname && appInfo?.given_name
        ? `${appInfo.surname} ${appInfo.given_name}`
        : appInfo?.email || "Applicant";
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")} ${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()}`;
      const updateMsg = `${applicantName} updated their application at ${timeStr}`;

      if (assignedAdminId) {
        // Only notify the assigned admin
        await query(
          `INSERT INTO notifications (user_id, application_id, message, notification_type)
           VALUES ($1, $2, $3, $4)`,
          [assignedAdminId, applicationId, updateMsg, "applicant_update"]
        );
      } else {
        // No assigned admin yet, notify all admins
        const admins = await query(
          "SELECT id FROM users WHERE role IN ('admin', 'superadmin')"
        );
        for (const admin of admins.rows) {
          await query(
            `INSERT INTO notifications (user_id, application_id, message, notification_type)
             VALUES ($1, $2, $3, $4)`,
            [admin.id, applicationId, updateMsg, "applicant_update"]
          );
        }
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
