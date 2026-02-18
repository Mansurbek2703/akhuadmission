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

    const LANG_CERT_LABELS: Record<string, string> = {
      ielts: "IELTS",
      toefl: "TOEFL iBT",
      duolingo: "Duolingo English Test",
      cambridge: "Cambridge (FCE/CAE/CPE)",
      pearson: "Pearson PTE Academic",
      other_lang: "Other",
    };

    const CITIZENSHIP_MAP: Record<string, string> = {
      uzbekistan: "Uzbekistan",
      kazakhstan: "Kazakhstan",
      tajikistan: "Tajikistan",
      kyrgyzstan: "Kyrgyzstan",
      turkmenistan: "Turkmenistan",
      other: "Other",
    };

    // Helper: parse combined address "Uzbekistan, Region, District, Street" into parts
    function parseAddress(combined: string | undefined, country?: string, region?: string, district?: string, street?: string) {
      // If structured fields exist, use them
      if (country) {
        return {
          country: country === "uzbekistan" ? "Uzbekistan" : country === "other" ? "Other" : country,
          region: region || "",
          district: district || "",
          street: street || "",
        };
      }
      // Fallback: parse from combined string
      if (!combined) return { country: "", region: "", district: "", street: "" };
      const parts = combined.split(", ").map((s: string) => s.trim());
      if (parts.length >= 2 && parts[0].toLowerCase() === "uzbekistan") {
        return {
          country: "Uzbekistan",
          region: parts[1] || "",
          district: parts[2] || "",
          street: parts.slice(3).join(", ") || "",
        };
      }
      // "Other" country - full address stored as-is
      return { country: "Other", region: "", district: "", street: combined };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = result.rows.map((row: any) => {
      const birth = parseAddress(row.place_of_birth, row.birth_country, row.birth_region, row.birth_district, row.birth_street);
      const addr = parseAddress(row.current_address, row.address_country, row.address_region, row.address_district, row.address_street);

      return {
      "Applicant ID": row.unikal_id || "",
      "Surname": row.surname || "",
      "Given Name": row.given_name || "",
      "Middle Name": row.middle_name || "",
      "Email": row.user_email || "",
      "Program": row.user_program ? PROGRAM_LABELS[row.user_program as Program] : "N/A",
      "Status": APPLICATION_STATUS_LABELS[row.status as ApplicationStatus] || row.status,
      "Completion %": row.completion_percentage ?? 0,
      // Personal info
      "Gender": row.gender || "",
      "Citizenship": row.citizenship ? (CITIZENSHIP_MAP[row.citizenship] || row.citizenship) : "",
      "Citizenship (Other)": row.citizenship_other || "",
      "Card / Passport Number": row.card_number || "",
      "Date of Birth": row.date_of_birth || "",
      "Date of Issue": row.date_of_issue || "",
      "Date of Expiry": row.date_of_expiry || "",
      "Personal Number": row.personal_number || "",
      "Place of Birth (Combined)": row.place_of_birth || "",
      "Birth Country": birth.country,
      "Birth Region": birth.region,
      "Birth District": birth.district,
      "Birth Street/House": birth.street,
      "Current Address (Combined)": row.current_address || "",
      "Address Country": addr.country,
      "Address Region": addr.region,
      "Address District": addr.district,
      "Address Street/House": addr.street,
      "Passport Image": row.passport_image_path ? "Uploaded" : "Not uploaded",
      // Contact
      "Personal Phone": row.personal_phone || "",
      "Parent Phone": row.parent_phone || "",
      "Friend Phone": row.friend_phone || "",
      // Education
      "Education Type": row.education_type ? (EDUCATION_TYPE_LABELS[row.education_type as EducationType] || row.education_type) : "",
      "Institution Type": row.institution_type || "",
      "Institution Location": row.institution_location || "",
      "Institution Name": row.institution_name || "",
      "Attestat PDF": row.attestat_pdf_path ? "Uploaded" : "Not uploaded",
      "Attestat Verified": row.attestat_verified ? "Yes" : row.attestat_invalid ? "Invalid" : "Pending",
      // Language cert
      "Language Cert Type": row.language_cert_type ? (LANG_CERT_LABELS[row.language_cert_type] || row.language_cert_type) : "",
      "Language Cert Score": row.language_cert_score || "",
      "Language Cert ID": row.language_cert_id || "",
      "Language Cert Date": row.language_cert_date || "",
      "Language Cert PDF": row.language_cert_pdf_path ? "Uploaded" : "Not uploaded",
      "Language Cert Verified": row.language_cert_verified ? "Yes" : row.language_cert_invalid ? "Invalid" : "Pending",
      // SAT
      "SAT Score": row.sat_score || "",
      "SAT ID": row.sat_id || "",
      "SAT PDF": row.sat_pdf_path ? "Uploaded" : "Not uploaded",
      "SAT Verified": row.sat_verified ? "Yes" : row.sat_invalid ? "Invalid" : "Pending",
      // CEFR
      "CEFR Score": row.cefr_score || "",
      "CEFR ID": row.cefr_id || "",
      "CEFR PDF": row.cefr_pdf_path ? "Uploaded" : "Not uploaded",
      "CEFR Verified": row.cefr_verified ? "Yes" : row.cefr_invalid ? "Invalid" : "Pending",
      // Social protection
      "Social Protection": row.social_protection ? "Yes" : "No",
      "Social Protection PDF": row.social_protection_pdf_path ? "Uploaded" : "Not uploaded",
      "Social Registry": row.social_registry ? "Yes" : "No",
      "Social Registry PDF": row.social_registry_pdf_path ? "Uploaded" : "Not uploaded",
      // Achievements
      "Other Achievements": row.other_achievements_text || "",
      "Achievements PDF": row.other_achievements_pdf_path ? "Uploaded" : "Not uploaded",
      // Misc
      "Hear About": row.hear_about || "",
      "Info Confirmed": row.confirm_info_correct ? "Yes" : "No",
      "Oferta Agreed": row.oferta_agreed ? "Yes" : "No",
      // Admin
      "Assigned Admin": row.assigned_admin_email || "Unassigned",
      "Submission Date": row.created_at ? new Date(row.created_at).toLocaleDateString() : "",
      "Last Updated": row.updated_at ? new Date(row.updated_at).toLocaleDateString() : "",
    };
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);

    // Set column widths for all columns
    const colWidths = [
      12, 20, 20, 30, 28, 24, 12,
      10, 16, 20, 22, 14, 14, 14, 18,
      30, 16, 25, 20, 22, // birth address (combined, country, region, district, street)
      30, 16, 25, 20, 22, // current address (combined, country, region, district, street)
      14, // passport image
      16, 16, 16, // phones
      45, 20, 20, 30, 14, 14, // education
      22, 16, 18, 14, 14, 14, // lang cert
      12, 12, 14, 14, // sat
      12, 12, 14, 14, // cefr
      16, 14, 14, 14, // social
      30, 14, // achievements
      20, 16, 14, 14, // misc
      25, 15, 15, // admin/dates
    ];
    ws["!cols"] = colWidths.map(w => ({ wch: w }));

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
