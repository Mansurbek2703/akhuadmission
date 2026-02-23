import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";
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

    if (!file) {
      return NextResponse.json(
        { error: "File is required" },
        { status: 400 }
      );
    }

    // Validate type
    if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
      return NextResponse.json(
        { error: "Only JPG and PNG images are allowed" },
        { status: 400 }
      );
    }

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 5MB" },
        { status: 400 }
      );
    }

    // Create upload directory
    const userDir = path.join(UPLOAD_DIR, session.userId);
    await mkdir(userDir, { recursive: true });

    // Generate unique filename
    const ext = path.extname(file.name) || ".jpg";
    const fileName = `profile_photo_${randomUUID()}${ext}`;
    const filePath = path.join(userDir, fileName);

    // Write file
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    const publicPath = `${session.userId}/${fileName}`;

    // Update user record
    await query(
      "UPDATE users SET profile_photo_path = $1 WHERE id = $2",
      [publicPath, session.userId]
    );

    return NextResponse.json({
      success: true,
      profile_photo_path: publicPath,
    });
  } catch (error) {
    console.error("Profile photo upload error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Admin endpoint to update an applicant's profile photo
export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "admin" && session.role !== "superadmin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const userId = formData.get("userId") as string;

    if (!file || !userId) {
      return NextResponse.json({ error: "File and userId are required" }, { status: 400 });
    }

    if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
      return NextResponse.json({ error: "Only JPG and PNG images are allowed" }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File size must be less than 5MB" }, { status: 400 });
    }

    const userDir = path.join(UPLOAD_DIR, userId);
    await mkdir(userDir, { recursive: true });

    const ext = path.extname(file.name) || ".jpg";
    const fileName = `profile_photo_${randomUUID()}${ext}`;
    const filePath = path.join(userDir, fileName);

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    const publicPath = `${userId}/${fileName}`;

    await query(
      "UPDATE users SET profile_photo_path = $1 WHERE id = $2",
      [publicPath, userId]
    );

    return NextResponse.json({
      success: true,
      profile_photo_path: publicPath,
    });
  } catch (error) {
    console.error("Admin profile photo upload error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
