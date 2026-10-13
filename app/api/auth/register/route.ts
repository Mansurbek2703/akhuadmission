import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error:
        "Bachelor admission for the 2026-2027 academic year is closed. New registrations are not being accepted.",
    },
    { status: 403 }
  );
}
