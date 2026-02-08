import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Verification token is required" },
        { status: 400 }
      );
    }

    const result = await query(
      "SELECT id, email_verified FROM users WHERE verification_token = $1",
      [token]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Invalid verification token" },
        { status: 400 }
      );
    }

    if (result.rows[0].email_verified) {
      return NextResponse.redirect(
        new URL("/login?verified=already", req.url)
      );
    }

    await query(
      "UPDATE users SET email_verified = TRUE, verification_token = NULL WHERE verification_token = $1",
      [token]
    );

    return NextResponse.redirect(new URL("/login?verified=true", req.url));
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
