import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";
import * as XLSX from "xlsx";
import {
  APPLICATION_STATUS_LABELS,
  PROGRAM_LABELS,
  EDUCATION_TYPE_LABELS,
} from "@/lib/types";
import type {
  ApplicationStatus,
  Program,
  EducationType,
} from "@/lib/types";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "admin" && session.role !== "superadmin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const educationType = searchParams.get("education_type");
    const dateFrom = searchParams.get("date_from");
    const dateTo = searchParams.get("date_to");
    const forMe = searchParams.get("for_me");

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

    sql += " ORDER BY a.created_at DESC";

    const result = await query(sql, params);

    const data = result.rows.map(
      (row: {
        id: string;
        surname?: string;
        given_name?: string;
        user_email: string;
        user_program?: Program;
        education_type?: EducationType;
        status: ApplicationStatus;
        created_at: string;
        updated_at: string;
        assigned_admin_email?: string;
        attestat_pdf_path?: string;
        language_cert_pdf_path?: string;
      }) => ({
        "Applicant ID": row.id.slice(0, 8),
        "Full Name": `${row.surname || ""} ${row.given_name || ""}`.trim() || "Not provided",
        Email: row.user_email,
        Program: row.user_program
          ? PROGRAM_LABELS[row.user_program]
          : "N/A",
        "Initial Education Type": row.education_type
          ? EDUCATION_TYPE_LABELS[row.education_type]
          : "N/A",
        Status: APPLICATION_STATUS_LABELS[row.status],
        "Submission Date": new Date(row.created_at).toLocaleDateString(),
        "Last Updated": new Date(row.updated_at).toLocaleDateString(),
        "Assigned Admin": row.assigned_admin_email || "Unassigned",
        "Missing Documents":
          !row.attestat_pdf_path || !row.language_cert_pdf_path
            ? "Yes"
            : "No",
      })
    );

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);

    // Set column widths
    ws["!cols"] = [
      { wch: 12 },
      { wch: 25 },
      { wch: 30 },
      { wch: 30 },
      { wch: 25 },
      { wch: 22 },
      { wch: 15 },
      { wch: 15 },
      { wch: 25 },
      { wch: 18 },
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Applications");
    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    // Log export
    await query(
      "INSERT INTO admin_logs (admin_id, action, details) VALUES ($1, $2, $3)",
      [
        session.userId,
        "export_excel",
        `Exported ${data.length} applications`,
      ]
    );

    return new NextResponse(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="applications_${new Date().toISOString().split("T")[0]}.xlsx"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
