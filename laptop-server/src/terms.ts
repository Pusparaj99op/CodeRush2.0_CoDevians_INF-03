// Where this provider's 402 payment terms come from.
//
// The payee address used to be a local env var that had to be kept
// byte-identical to the website's FACILITATOR_PAYEE_ADDRESS by hand. They
// drifted, and the only symptom was "payee address does not match declared
// terms" — raised *after* the caller had already paid. So the facilitator
// is now the single source of truth: we fetch it from
// GET /api/facilitator/terms and cache it.
//
// PAYEE_ADDRESS remains as an offline fallback for running this service
// without the website up.

import type { PaymentTerms } from "./types";

const FACILITATOR_BASE_URL = process.env.FACILITATOR_BASE_URL ?? "http://localhost:3000";
const FALLBACK_PAYEE = process.env.PAYEE_ADDRESS ?? "FACILITATORPLACEHOLDERADDRESSTESTNETONLY";
const PRICE_CAP_ALGO = Number(process.env.PRICE_CAP_ALGO ?? 3.0);
const FETCH_TIMEOUT_MS = Number(process.env.TERMS_FETCH_TIMEOUT_MS ?? 4_000);

/** Re-fetch periodically so a facilitator restart with new config is picked
 *  up without restarting the laptop mid-demo. */
const CACHE_TTL_MS = Number(process.env.TERMS_CACHE_TTL_MS ?? 60_000);

interface CachedTerms {
  payeeAddress: string;
  source: "facilitator" | "fallback";
  fetchedAt: number;
}

let cache: CachedTerms | null = null;

async function fetchPayeeAddress(): Promise<CachedTerms> {
  try {
    const res = await fetch(`${FACILITATOR_BASE_URL}/api/facilitator/terms`, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const body = (await res.json()) as { payeeAddress?: string };
    if (!body.payeeAddress) throw new Error("response had no payeeAddress");

    return { payeeAddress: body.payeeAddress, source: "facilitator", fetchedAt: Date.now() };
  } catch (err) {
    console.warn(
      JSON.stringify({
        event: "terms_fetch_failed",
        detail: (err as Error).message,
        usingFallback: FALLBACK_PAYEE,
      })
    );
    return { payeeAddress: FALLBACK_PAYEE, source: "fallback", fetchedAt: Date.now() };
  }
}

/** The terms quoted in every 402. */
export async function getPaymentTerms(): Promise<PaymentTerms & { payeeSource: string }> {
  if (!cache || Date.now() - cache.fetchedAt > CACHE_TTL_MS) {
    cache = await fetchPayeeAddress();
  }

  return {
    scheme: "upto",
    amountAlgo: PRICE_CAP_ALGO,
    payeeAddress: cache.payeeAddress,
    network: "testnet",
    payeeSource: cache.source,
  };
}

export const priceCapAlgo = PRICE_CAP_ALGO;
export const facilitatorBaseUrl = FACILITATOR_BASE_URL;
