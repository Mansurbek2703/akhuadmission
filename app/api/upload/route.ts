import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const docType = formData.get("doc_type") as string;

    if (!file || !docType) {
      return NextResponse.json(
        { error: "File and document type are required" },
        { status: 400 }
      );
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 10MB" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes: Record<string, string[]> = {
      passport_image: ["image/jpeg", "image/png"],
      attestat_pdf: ["application/pdf"],
      language_cert_pdf: ["application/pdf"],
      sat_pdf: ["application/pdf"],
      cefr_pdf: ["application/pdf"],
      social_protection_pdf: ["application/pdf"],
      social_registry_pdf: ["application/pdf"],
      achievements_pdf: ["application/pdf"],
      chat_file: ["application/pdf", "image/jpeg", "image/png"],
    };

    const allowed = allowedTypes[docType];
    if (allowed && !allowed.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type. Allowed: ${allowed.join(", ")}` },
        { status: 400 }
      );
    }

    // Create upload directory
    const userDir = path.join(UPLOAD_DIR, session.userId);
    await mkdir(userDir, { recursive: true });

    // Generate unique filename
    const ext = path.extname(file.name);
    const fileName = `${docType}_${randomUUID()}${ext}`;
    const filePath = path.join(userDir, fileName);

    // Write file
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    const publicPath = `/api/files/${session.userId}/${fileName}`;

    return NextResponse.json({
      success: true,
      filePath: publicPath,
      fileName: file.name,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
