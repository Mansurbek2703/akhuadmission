import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { readFile, stat } from "fs/promises";
import path from "path";

const MIME_TYPES: Record<string, string> = {
  ".pdf": "application/pdf",
  ".jpg": "application/octet-stream",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const segments = (await params).path;
    if (!segments || segments.length < 2) {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    }

    // Sanitize path segments to prevent directory traversal
    for (const seg of segments) {
      if (seg.includes("..") || seg.includes("~")) {
        return NextResponse.json({ error: "Invalid path" }, { status: 400 });
      }
    }

    const filePath = path.join(process.cwd(), "public", "uploads", ...segments);

    // Check file exists
    try {
      await stat(filePath);
    } catch {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    const buffer = await readFile(filePath);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": ext === ".pdf" ? "inline" : "inline",
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error) {
    console.error("File serve error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
