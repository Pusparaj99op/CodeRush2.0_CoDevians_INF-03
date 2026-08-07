// "upto"-scheme metering.
//
// This provider is the demo's usage-based-pricing example (see
// Doc/specs/03-laptop-server.md "Role in the INF-03 demo"): the caller
// authorizes *up to* a cap, and the real charge is derived from how much
// compute the request actually consumed. Everything here is deterministic
// arithmetic over the token counts Ollama reports back, so a trace can be
// re-derived from the receipt without trusting this service's word.

/** Flat charge applied to every accepted request, in ALGO. */
const BASE_ALGO = Number(process.env.PRICE_BASE_ALGO ?? 0.25);

/** Marginal charge per generated token, in ALGO. */
const PER_TOKEN_ALGO = Number(process.env.PRICE_PER_TOKEN_ALGO ?? 0.002);

export interface UsageCost {
  /** Tokens the model generated (null when Ollama didn't report a count). */
  tokensGenerated: number | null;
  /** Wall-clock inference time in ms, as reported by Ollama. */
  durationMs: number | null;
  baseAlgo: number;
  perTokenAlgo: number;
  /** What the work cost before the cap is applied. */
  rawCostAlgo: number;
  /** What we actually charge: `min(rawCost, cap)`. */
  costAlgo: number;
  /** The `upto` cap this request was quoted against. */
  capAlgo: number;
  /** True when raw cost hit the cap and the overage was absorbed. */
  cappedAt: boolean;
}

function round6(n: number): number {
  return Math.round(n * 1_000_000) / 1_000_000;
}

/**
 * Prices one completed inference against the quoted cap. When Ollama
 * reports no token count we fall back to the base charge only — never to
 * the cap, so an unmetered request can't be silently billed at maximum.
 */
export function priceUsage(
  tokensGenerated: number | null,
  durationMs: number | null,
  capAlgo: number
): UsageCost {
  const tokens = tokensGenerated ?? 0;
  const rawCostAlgo = round6(BASE_ALGO + tokens * PER_TOKEN_ALGO);
  const costAlgo = round6(Math.min(rawCostAlgo, capAlgo));

  return {
    tokensGenerated,
    durationMs,
    baseAlgo: BASE_ALGO,
    perTokenAlgo: PER_TOKEN_ALGO,
    rawCostAlgo,
    costAlgo,
    capAlgo,
    cappedAt: rawCostAlgo > capAlgo,
  };
}

/**
 * How much of an authorized payment went unused. In a full x402 `upto`
 * implementation this is the amount a settle-down/refund would return;
 * on the TestNet demo we surface it in the response so the trace shows
 * the difference between the authorized cap and the metered charge.
 */
export function unusedAlgo(authorizedAlgo: number, costAlgo: number): number {
  return round6(Math.max(0, authorizedAlgo - costAlgo));
}
