import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

const APP_URL =
  process.env.APP_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  "https://admission.akhu.uz";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.redirect(`${APP_URL}/login?verified=error&reason=missing_token`);
    }

    // First check: find user by token (token still exists = not yet verified)
    const result = await query(
      "SELECT id, email_verified FROM users WHERE verification_token = $1",
      [token]
    );

    if (result.rows.length === 0) {
      // Token not found - either already used or invalid
      // Check if any user was already verified (token was cleared after verification)
      return NextResponse.redirect(`${APP_URL}/login?verified=error&reason=invalid_token`);
    }

    const user = result.rows[0];

    if (user.email_verified) {
      return NextResponse.redirect(`${APP_URL}/login?verified=already`);
    }

    // Verify the user
    await query(
      "UPDATE users SET email_verified = TRUE, verification_token = NULL WHERE id = $1",
      [user.id]
    );

    // Assign sequential unikal_id to the applicant's application
    const maxResult = await query(
      "SELECT COALESCE(MAX(unikal_id), 0) as max_id FROM applications WHERE unikal_id IS NOT NULL"
    );
    const nextId = (maxResult.rows[0].max_id || 0) + 1;
    await query(
      "UPDATE applications SET unikal_id = $1 WHERE user_id = $2 AND unikal_id IS NULL",
      [nextId, user.id]
    );

    return NextResponse.redirect(`${APP_URL}/login?verified=true`);
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.redirect(`${APP_URL}/login?verified=error&reason=server_error`);
  }
}
