import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const result = await query(
      "SELECT setting_value, file_path FROM document_settings WHERE setting_key = 'oferta_text'"
    );
    if (result.rows.length === 0) {
      return NextResponse.json({ oferta: null });
    }
    return NextResponse.json({ oferta: result.rows[0] });
  } catch {
    return NextResponse.json({ oferta: null });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "superadmin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { oferta_text } = await req.json();
    if (!oferta_text || typeof oferta_text !== "string") {
      return NextResponse.json(
        { error: "Oferta text is required" },
        { status: 400 }
      );
    }

    await query(
      `INSERT INTO document_settings (setting_key, setting_value, updated_at)
       VALUES ('oferta_text', $1, NOW())
       ON CONFLICT (setting_key) DO UPDATE SET setting_value = $1, updated_at = NOW()`,
      [oferta_text]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Oferta save error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
