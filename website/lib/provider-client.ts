// Outbound x402 client: the *consumer* side of the flow the laptop-server
// implements. This is what actually buys work from a provider.
//
// Until now `Provider.endpoint` was pure metadata — nothing in the website
// ever called it, so no work was ever purchased or performed. This module
// closes that loop:
//
//   1. POST the task unpaid          -> provider answers 402 with terms
//   2. pay those terms               -> lib/payer.ts (real or simulated)
//   3. POST again with the payment   -> provider verifies via our own
//                                       facilitator, then returns the result
//
// See Doc/specs/03-laptop-server.md for the provider half of this contract.

import { payProvider, PaymentError } from "./payer";
import { mockFulfillment } from "./travel/mock-fulfillment";
import { SIMULATED_TXN_PREFIX } from "./settlement-mode";
import type { PaymentPayload, PaymentTerms } from "./facilitator";
import type { Provider, ProviderStatus } from "./types";

const PROBE_TIMEOUT_MS = Number(process.env.PROVIDER_PROBE_TIMEOUT_MS ?? 3_000);
const CALL_TIMEOUT_MS = Number(process.env.PROVIDER_CALL_TIMEOUT_MS ?? 150_000);

export class ProviderError extends Error {
  readonly retryable: boolean;
  readonly status?: number;

  constructor(message: string, opts: { retryable?: boolean; status?: number } = {}) {
    super(message);
    this.name = "ProviderError";
    this.retryable = opts.retryable ?? false;
    this.status = opts.status;
  }
}

export interface ProviderCallRequest {
  workflowId: string;
  stepId: string;
  task: string;
  input: string;
  /**
   * Budget still unspent. A search provider uses it to report that nothing was
   * found in range, which is what makes the plan's conditional edges fire
   * instead of every step always running. Not sent to real providers.
   */
  remainingBudgetAlgo?: number;
}

export interface ProviderCallResult {
  output: string;
  /** Usage/metering block, when the provider reports one ("upto" scheme). */
  usage?: Record<string, unknown>;
  settlement?: Record<string, unknown>;
  payment: PaymentPayload;
  terms: PaymentTerms;
  simulatedPayment: boolean;
  mocked: boolean;
}

/**
 * Probes a provider's liveness. The laptop-server's `GET /health` returns
 * exactly this shape and 503s when its model isn't loaded, so an offline
 * or degraded laptop shows up as offline in the marketplace instead of
 * being discovered and then failing mid-payment.
 */
export async function probeProvider(provider: Provider): Promise<ProviderStatus> {
  const checkedAt = new Date().toISOString();

  if (provider.mock) {
    return { online: true, reason: "mock provider (no network call)", checkedAt };
  }

  try {
    const healthUrl = provider.healthEndpoint ?? `${provider.endpoint.replace(/\/$/, "")}/health`;
    const res = await fetch(healthUrl, {
      signal: AbortSignal.timeout(PROBE_TIMEOUT_MS),
      cache: "no-store",
    });
    const body = (await res.json().catch(() => ({}))) as {
      status?: string;
      busy?: boolean;
      model?: string;
      ollama?: { reason?: string };
    };

    return {
      online: res.ok,
      busy: body.busy,
      model: body.model,
      reason: res.ok ? undefined : (body.ollama?.reason ?? `HTTP ${res.status}`),
      checkedAt,
    };
  } catch (err) {
    return { online: false, reason: (err as Error).message, checkedAt };
  }
}

/** Placeholder providers have no reachable endpoint; stub their work so the
 *  demo has multiple steps without pretending a fake domain answered. */
function mockResult(provider: Provider, req: ProviderCallRequest): ProviderCallResult {
  const terms: PaymentTerms = {
    scheme: provider.scheme,
    amountAlgo: provider.priceAlgo,
    payeeAddress: "MOCK",
    network: "testnet",
  };
  // Travel providers serve deterministic fixtures with a machine-readable
  // header the orchestrator's condition evaluator reads; anything else keeps
  // the original echo, which is all the two legacy demo providers ever needed.
  const output =
    mockFulfillment(provider, req, req.remainingBudgetAlgo) ??
    `[mock ${provider.capability}] ${req.task}: ${req.input.slice(0, 240)}`;

  return {
    output,
    payment: {
      // Prefixed so the receipt and the trace both record this as a
      // non-settlement. A mock provider's "payment" must never render as a
      // real one.
      txnHash: `${SIMULATED_TXN_PREFIX}MOCK-${crypto.randomUUID()}`,
      payerAddress: `${SIMULATED_TXN_PREFIX}MOCK`,
      payeeAddress: `${SIMULATED_TXN_PREFIX}MOCK`,
      amountMicroAlgos: Math.round(provider.priceAlgo * 1_000_000),
    },
    terms,
    simulatedPayment: true,
    mocked: true,
  };
}

async function postTask(
  provider: Provider,
  req: ProviderCallRequest,
  payment?: PaymentPayload
): Promise<{ status: number; body: Record<string, unknown> }> {
  let res: Awaited<ReturnType<typeof fetch>>;
  try {
    res = await fetch(provider.endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      // remainingBudgetAlgo is an internal hint for the mock fixtures; a real
      // provider has no business knowing how much the buyer has left.
      body: JSON.stringify({
        workflowId: req.workflowId,
        stepId: req.stepId,
        task: req.task,
        input: req.input,
        payment,
      }),
      signal: AbortSignal.timeout(CALL_TIMEOUT_MS),
      cache: "no-store",
    });
  } catch (err) {
    // Unreachable provider — the tunnel dropped, the laptop slept, or the
    // request timed out. Retryable: this is INF-03's dependency-failure
    // case, not a permanent rejection.
    throw new ProviderError(`provider unreachable: ${(err as Error).message}`, { retryable: true });
  }

  const body = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  return { status: res.status, body };
}

/**
 * Buys one unit of work from a provider, paying its 402 terms.
 *
 * Throws ProviderError with `retryable` set so the orchestrator can tell a
 * transient provider outage (retry, or surface as a dependency failure)
 * from a hard rejection (fail the step).
 */
export async function callProvider(
  provider: Provider,
  req: ProviderCallRequest
): Promise<ProviderCallResult> {
  if (provider.mock) {
    return mockResult(provider, req);
  }

  // 1. Unpaid request — we expect to be told the price.
  const quote = await postTask(provider, req);

  if (quote.status !== 402) {
    if (quote.status >= 500) {
      throw new ProviderError(
        `provider is unavailable (HTTP ${quote.status}): ${JSON.stringify(quote.body)}`,
        { retryable: true, status: quote.status }
      );
    }
    throw new ProviderError(
      `expected 402 with payment terms, got HTTP ${quote.status}: ${JSON.stringify(quote.body)}`,
      { status: quote.status }
    );
  }

  const terms = quote.body.terms as PaymentTerms | undefined;
  if (!terms?.payeeAddress || typeof terms.amountAlgo !== "number") {
    throw new ProviderError("provider's 402 did not include usable payment terms");
  }
  if (terms.amountAlgo > provider.priceAlgo) {
    // The marketplace quoted one price and the provider is now asking for
    // more. Refuse rather than overspend behind the budget manager's back.
    throw new ProviderError(
      `provider quoted ${terms.amountAlgo} ALGO, above its advertised ${provider.priceAlgo} ALGO`
    );
  }

  // 2. Pay the terms.
  let paid: Awaited<ReturnType<typeof payProvider>>;
  try {
    paid = await payProvider(terms);
  } catch (err) {
    const retryable = err instanceof PaymentError ? err.retryable : false;
    throw new ProviderError(`payment failed: ${(err as Error).message}`, { retryable });
  }

  // 3. Re-submit with proof of payment; the provider verifies it through
  //    our facilitator before doing the work.
  const fulfilled = await postTask(provider, req, paid.payload);

  if (fulfilled.status !== 200) {
    const retryable = fulfilled.status >= 500 || fulfilled.body.retryable === true;
    throw new ProviderError(
      `provider did not fulfil after payment (HTTP ${fulfilled.status}): ${JSON.stringify(fulfilled.body)}`,
      { retryable, status: fulfilled.status }
    );
  }

  const result = fulfilled.body.result as { output?: string } | undefined;
  if (!result?.output) {
    throw new ProviderError("provider returned a 200 with no result output");
  }

  return {
    output: result.output,
    usage: fulfilled.body.usage as Record<string, unknown> | undefined,
    settlement: fulfilled.body.settlement as Record<string, unknown> | undefined,
    payment: paid.payload,
    terms,
    simulatedPayment: paid.simulated,
    mocked: false,
  };
}
