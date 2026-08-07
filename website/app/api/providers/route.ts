// GET /api/providers — marketplace: list available paid providers/offers,
// including the Laptop-as-Server when its tunnel is configured.

import { NextResponse } from "next/server";
import { PROVIDERS } from "@/lib/providers";

export async function GET() {
  return NextResponse.json({ providers: PROVIDERS });
}
