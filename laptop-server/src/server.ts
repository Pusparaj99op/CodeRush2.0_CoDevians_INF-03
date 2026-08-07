// Laptop-as-Server: exposes the RTX 4050's local inference as one paid
// marketplace provider, implementing the *provider* side of the x402 flow.
// See Doc/specs/03-laptop-server.md.
//
// Flow for POST /infer:
//   1. No `payment` in the body -> respond 402 with "upto" payment terms.
//   2. `payment` present -> forward it to the website's facilitator
//      (POST /api/facilitator/settle) to verify + settle on Algorand
//      TestNet. Only on success do we run inference and return a result,
//      metered against the authorized cap (see pricing.ts).
//
// This service holds no Algorand signing keys and never confirms a
// payment itself — the website's facilitator (lib/facilitator.ts) is the
// only thing that talks to algod, per the "least privilege" boundary in
// Doc/specs/00-overview.md.

import express, { type Request, type Response } from "express";
import { GpuBusyError, isBusy, withGpu } from "./gpu-lock";
import { checkOllama, ollamaConfig, OllamaUnavailableError, runInference } from "./ollama";
import { priceUsage, unusedAlgo } from "./pricing";
import type { InferRequestBody, PaymentTerms, SettleResponse } from "./types";

type FetchResponse = Awaited<ReturnType<typeof fetch>>;

const PORT = Number(process.env.PORT ?? 8787);
const PRICE_CAP_ALGO = Number(process.env.PRICE_CAP_ALGO ?? 3.0);
const PAYEE_ADDRESS = process.env.PAYEE_ADDRESS ?? "FACILITATORPLACEHOLDERADDRESSTESTNETONLY";
const FACILITATOR_BASE_URL = process.env.FACILITATOR_BASE_URL ?? "http://localhost:3000";
const FACILITATOR_TIMEOUT_MS = Number(process.env.FACILITATOR_TIMEOUT_MS ?? 15_000);

/** Reject oversized prompts before they reach the GPU. */
const MAX_INPUT_CHARS = Number(process.env.MAX_INPUT_CHARS ?? 20_000);

const startedAt = Date.now();
const app = express();
app.use(express.json({ limit: "1mb" }));

const paymentTerms: PaymentTerms = {
  scheme: "upto",
  amountAlgo: PRICE_CAP_ALGO,
  payeeAddress: PAYEE_ADDRESS,
  network: "testnet",
};

/** One line per request so the demo has a provider-side trace to show. */
function log(event: string, fields: Record<string, unknown> = {}): void {
  console.log(JSON.stringify({ ts: new Date().toISOString(), event, ...fields }));
}

app.get("/health", async (_req: Request, res: Response) => {
  const ollama = await checkOllama();
  const ready = ollama.reachable && ollama.modelReady && !isBusy();

  // 503 when we can't serve, so a tunnel/marketplace liveness check sees
  // the failure instead of a cheerful 200 from a server with no model.
  res.status(ollama.reachable && ollama.modelReady ? 200 : 503).json({
    status: ready ? "ok" : ollama.reachable && ollama.modelReady ? "busy" : "degraded",
    provider: "laptop-inference",
    model: ollamaConfig.model,
    ollamaUrl: ollamaConfig.url,
    ollama,
    busy: isBusy(),
    terms: paymentTerms,
    facilitator: FACILITATOR_BASE_URL,
    uptimeSeconds: Math.round((Date.now() - startedAt) / 1000),
  });
});

/** Unauthenticated price quote — lets the marketplace show terms without a 402 round-trip. */
app.get("/terms", (_req: Request, res: Response) => {
  res.json({ terms: paymentTerms, maxTokens: ollamaConfig.maxTokens, capability: "local-inference" });
});

app.post("/infer", async (req: Request, res: Response) => {
  const body = req.body as Partial<InferRequestBody>;

  if (!body.workflowId || !body.stepId || !body.task || !body.input) {
    res.status(400).json({ error: "workflowId, stepId, task, and input are required" });
    return;
  }
  if (body.input.length > MAX_INPUT_CHARS) {
    res.status(413).json({ error: `input exceeds ${MAX_INPUT_CHARS} characters` });
    return;
  }

  // Step 1: no payment yet -> tell the caller what this call costs.
  if (!body.payment) {
    log("payment_required", { workflowId: body.workflowId, stepId: body.stepId });
    res.status(402).json({ error: "payment required", terms: paymentTerms });
    return;
  }

  // Refuse before settling money if we can't do the work anyway — taking
  // payment for an inference we can't run would be the worst failure mode
  // in a live payments demo.
  if (isBusy()) {
    log("rejected_busy", { workflowId: body.workflowId, stepId: body.stepId });
    res.status(503).json({
      error: "provider busy",
      detail: "single RTX 4050 serves one inference at a time; retry shortly",
      retryable: true,
    });
    return;
  }

  const authorizedAlgo = body.payment.amountMicroAlgos / 1_000_000;
  if (authorizedAlgo > PRICE_CAP_ALGO) {
    res.status(402).json({ error: "authorized amount exceeds upto cap", terms: paymentTerms });
    return;
  }

  // Step 2: forward the payment payload to the facilitator for
  // verification + settlement before doing any paid work.
  // NB: `Response` here would resolve to express's, hence the alias.
  let settleRes: FetchResponse;
  try {
    settleRes = await fetch(`${FACILITATOR_BASE_URL}/api/facilitator/settle`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        workflowId: body.workflowId,
        stepId: body.stepId,
        payload: body.payment,
      }),
      signal: AbortSignal.timeout(FACILITATOR_TIMEOUT_MS),
    });
  } catch (err) {
    log("facilitator_unreachable", { stepId: body.stepId, detail: (err as Error).message });
    res.status(502).json({
      error: "could not reach facilitator",
      detail: (err as Error).message,
      retryable: true,
    });
    return;
  }

  let settleBody: SettleResponse;
  try {
    settleBody = (await settleRes.json()) as SettleResponse;
  } catch {
    res.status(502).json({ error: "facilitator returned a non-JSON response" });
    return;
  }

  if (!settleRes.ok) {
    log("payment_rejected", { stepId: body.stepId, status: settleRes.status });
    res.status(402).json({ error: "payment not settled", detail: settleBody });
    return;
  }

  // Payment confirmed on Algorand TestNet — do the actual paid work,
  // one request at a time.
  try {
    const result = await withGpu(() => runInference(body.task!, body.input!));
    const usage = priceUsage(result.tokensGenerated, result.durationMs, PRICE_CAP_ALGO);

    log("inference_complete", {
      stepId: body.stepId,
      tokens: usage.tokensGenerated,
      durationMs: usage.durationMs,
      costAlgo: usage.costAlgo,
    });

    res.status(200).json({
      result,
      usage,
      // The "upto" settlement story: the caller authorized `authorizedAlgo`,
      // the metered work cost `usage.costAlgo`, and the difference is what a
      // settle-down would return.
      settlement: {
        scheme: "upto" as const,
        authorizedAlgo,
        chargedAlgo: usage.costAlgo,
        unusedAlgo: unusedAlgo(authorizedAlgo, usage.costAlgo),
      },
      receipt: settleBody.receipt,
    });
  } catch (err) {
    if (err instanceof GpuBusyError) {
      res.status(503).json({ error: "provider busy", detail: err.message, retryable: true });
      return;
    }
    if (err instanceof OllamaUnavailableError) {
      log("inference_unavailable", { stepId: body.stepId, detail: err.message });
      // Paid but undeliverable: say so explicitly, including the receipt,
      // so the orchestrator's fulfillment verifier can flag it as a
      // provider failure (INF-03 "dependency failure") rather than a
      // silent loss.
      res.status(503).json({
        error: "inference backend unavailable",
        detail: err.message,
        receipt: settleBody.receipt,
        retryable: true,
      });
      return;
    }
    log("inference_failed", { stepId: body.stepId, detail: (err as Error).message });
    res.status(500).json({
      error: "inference failed",
      detail: (err as Error).message,
      receipt: settleBody.receipt,
    });
  }
});

const server = app.listen(PORT, async () => {
  console.log(`veldar-laptop-server listening on :${PORT}`);
  console.log(`  model=${ollamaConfig.model} ollama=${ollamaConfig.url}`);
  console.log(`  facilitator=${FACILITATOR_BASE_URL} priceCapAlgo=${PRICE_CAP_ALGO}`);

  const ollama = await checkOllama();
  if (!ollama.reachable) {
    console.warn(`  ! Ollama unreachable (${ollama.reason}) — /infer will 503 until it's up`);
  } else if (!ollama.modelReady) {
    console.warn(`  ! ${ollama.reason}`);
  } else {
    console.log(`  ollama ready, models: ${ollama.models.join(", ")}`);
  }

  console.log(`  expose publicly with a tunnel (ngrok http ${PORT}), then set`);
  console.log(`  LAPTOP_SERVER_URL in the website's .env.local to the tunnel URL.`);
});

// Let a Ctrl-C during the demo drain the in-flight inference instead of
// severing the tunnel mid-response.
for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => {
    console.log(`\n${signal} received, shutting down…`);
    server.close(() => process.exit(0));
  });
}
