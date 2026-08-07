// GET /api/providers — marketplace: list available paid providers/offers,
// including the Laptop-as-Server with its live reachability.
//
// The laptop is probed on every request rather than assumed up: a tunnel
// that dropped should show as offline in the marketplace instead of being
// discovered, quoted, and only then failing mid-payment.

import { NextResponse } from "next/server";
import { PROVIDERS } from "@/lib/providers";
import { probeProvider } from "@/lib/provider-client";
import { settlementMode } from "@/lib/settlement-mode";
import { store } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const providers = await Promise.all(
    PROVIDERS.map(async (provider) => ({
      ...provider,
      status: await probeProvider(provider),
    }))
  );

  return NextResponse.json({
    providers,
    settlementMode: settlementMode(),
    storeBackend: store.backend,
  });
}
