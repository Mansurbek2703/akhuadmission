import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { sendDocumentVerificationEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("session")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || (payload.role !== "admin" && payload.role !== "superadmin")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { applicationId, field, value } = await req.json();

    // Validate field name
    const allowedFields = [
      "language_cert_verified", "language_cert_invalid",
      "sat_verified", "sat_invalid",
      "cefr_verified", "cefr_invalid",
      "attestat_verified", "attestat_invalid",
    ];

    if (!allowedFields.includes(field)) {
      return NextResponse.json({ error: "Invalid field" }, { status: 400 });
    }

    // Update the field
    await query(
      `UPDATE applications SET ${field} = $1, updated_at = NOW() WHERE id = $2`,
      [value, applicationId]
    );

    // Get applicant info for email
    const result = await query(
      `SELECT a.id, a.surname, a.given_name, u.email
       FROM applications a
       JOIN users u ON a.user_id = u.id
       WHERE a.id = $1`,
      [applicationId]
    );

    if (result.rows.length > 0 && value === true) {
      const app = result.rows[0];
      const applicantName = [app.surname, app.given_name].filter(Boolean).join(" ") || "Applicant";
      const email = app.email;

      // Determine document name and action
      const docNames: Record<string, string> = {
        language_cert_verified: "Language Certificate",
        language_cert_invalid: "Language Certificate",
        sat_verified: "SAT Certificate",
        sat_invalid: "SAT Certificate",
        cefr_verified: "CEFR Certificate",
        cefr_invalid: "CEFR Certificate",
        attestat_verified: "Attestat / Diploma",
        attestat_invalid: "Attestat / Diploma",
      };

      const docName = docNames[field] || "Document";
      const action = field.endsWith("_invalid") ? "invalid" : "verified";

      if (email) {
        await sendDocumentVerificationEmail(email, applicantName, docName, action);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[VERIFY API] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
