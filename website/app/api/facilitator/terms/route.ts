// GET /api/facilitator/terms — the canonical settlement terms a provider
// should quote in its 402.
//
// The laptop-server calls this at startup so there is exactly one source of
// truth for the payee address. Previously both sides read it from their own
// env var and had to agree by hand; when they didn't, the mismatch only
// showed up as a failed verification *after* payment.

import { NextResponse } from "next/server";
import {
  FACILITATOR_NETWORK,
  FACILITATOR_PAYEE_ADDRESS,
  isPlaceholderPayee,
} from "@/lib/facilitator-config";
import { settlementMode } from "@/lib/settlement-mode";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    payeeAddress: FACILITATOR_PAYEE_ADDRESS,
    network: FACILITATOR_NETWORK,
    settlementMode: settlementMode(),
    placeholderPayee: isPlaceholderPayee,
  });
}
