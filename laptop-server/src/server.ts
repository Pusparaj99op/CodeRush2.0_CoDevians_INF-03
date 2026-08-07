// Laptop-as-Server: exposes the RTX 4050's local inference as one paid
// marketplace provider, implementing the *provider* side of the x402 flow.
// See Doc/specs/03-laptop-server.md.
//
// Flow for POST /infer:
//   1. No `payment` in the body -> respond 402 with payment terms.
//   2. `payment` present -> forward it to the website's facilitator
//      (POST /api/facilitator/settle) to verify + settle on Algorand
//      TestNet. Only on success do we run inference and return a result.
//
// This service holds no Algorand signing keys and never confirms a
// payment itself — the website's facilitator (lib/facilitator.ts) is the
// only thing that talks to algod, per the "least privilege" boundary in
// Doc/specs/00-overview.md.

import express, { type Request, type Response } from "express";
import { runInference } from "./ollama";
import type { InferRequestBody, PaymentTerms } from "./types";

const PORT = Number(process.env.PORT ?? 8787);
const PRICE_CAP_ALGO = Number(process.env.PRICE_CAP_ALGO ?? 3.0);
const PAYEE_ADDRESS = process.env.PAYEE_ADDRESS ?? "FACILITATORPLACEHOLDERADDRESSTESTNETONLY";
const FACILITATOR_BASE_URL = process.env.FACILITATOR_BASE_URL ?? "http://localhost:3000";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? "llama3.2:3b";
const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://localhost:11434";

const app = express();
app.use(express.json());

const paymentTerms: PaymentTerms = {
  scheme: "upto",
  amountAlgo: PRICE_CAP_ALGO,
  payeeAddress: PAYEE_ADDRESS,
  network: "testnet",
};

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", model: OLLAMA_MODEL, ollamaUrl: OLLAMA_URL, priceCapAlgo: PRICE_CAP_ALGO });
});

app.post("/infer", async (req: Request, res: Response) => {
  const body = req.body as Partial<InferRequestBody>;

  if (!body.workflowId || !body.stepId || !body.task || !body.input) {
    res.status(400).json({ error: "workflowId, stepId, task, and input are required" });
    return;
  }

  // Step 1: no payment yet -> tell the caller what this call costs.
  if (!body.payment) {
    res.status(402).json({ error: "payment required", terms: paymentTerms });
    return;
  }

  // Step 2: forward the payment payload to the facilitator for
  // verification + settlement before doing any paid work.
  let settleRes: Awaited<ReturnType<typeof fetch>>;
  try {
    settleRes = await fetch(`${FACILITATOR_BASE_URL}/api/facilitator/settle`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        workflowId: body.workflowId,
        stepId: body.stepId,
        payload: body.payment,
      }),
    });
  } catch (err) {
    res.status(502).json({ error: "could not reach facilitator", detail: (err as Error).message });
    return;
  }

  const settleBody = (await settleRes.json()) as { receipt?: unknown; error?: string };
  if (!settleRes.ok) {
    res.status(402).json({ error: "payment not settled", detail: settleBody });
    return;
  }

  // Payment confirmed on Algorand TestNet — do the actual paid work.
  try {
    const result = await runInference(body.task, body.input);
    res.status(200).json({ result, receipt: settleBody.receipt });
  } catch (err) {
    res.status(500).json({ error: "inference failed", detail: (err as Error).message });
  }
});

app.listen(PORT, () => {
  console.log(`veldar-laptop-server listening on :${PORT}`);
  console.log(`  model=${OLLAMA_MODEL} ollama=${OLLAMA_URL}`);
  console.log(`  facilitator=${FACILITATOR_BASE_URL} priceCapAlgo=${PRICE_CAP_ALGO}`);
  console.log(`  expose publicly with a tunnel (ngrok http ${PORT}), then set`);
  console.log(`  LAPTOP_SERVER_URL in the website's .env.local to the tunnel URL.`);
});
