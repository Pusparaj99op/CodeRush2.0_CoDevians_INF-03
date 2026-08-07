// POST /api/facilitator/settle — x402 facilitator: confirm settlement and
// issue a receipt once verification has passed. Idempotent on txnHash.
// Body: { workflowId, stepId, payload: PaymentPayload }

import { NextRequest, NextResponse } from "next/server";
import { settlePayment, verifyPayment, type PaymentPayload } from "@/lib/facilitator";
import { logEvent } from "@/lib/orchestrator";
import { getProvider } from "@/lib/providers";
import { store } from "@/lib/store";
import type { Receipt } from "@/lib/types";
import { nowIso } from "@/lib/id";

interface SettleBody {
  workflowId: string;
  stepId: string;
  payload: PaymentPayload;
}

const FACILITATOR_PAYEE_ADDRESS =
  process.env.FACILITATOR_PAYEE_ADDRESS ?? "FACILITATORPLACEHOLDERADDRESSTESTNETONLY";

export async function POST(req: NextRequest) {
  let body: SettleBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const workflow = store.workflows.get(body.workflowId);
  const step = workflow?.steps.find((s) => s.id === body.stepId);
  if (!workflow || !step) {
    return NextResponse.json({ error: "workflow or step not found" }, { status: 404 });
  }

  const provider = getProvider(step.providerId);
  if (!provider) {
    return NextResponse.json({ error: "unknown provider for this step" }, { status: 404 });
  }

  // Idempotency: if this txn was already settled for this step, return the
  // existing receipt instead of creating a duplicate.
  const existing = [...store.receipts.values()].find(
    (r) => r.stepId === step.id && r.txnHash === body.payload.txnHash
  );

  const verification = existing
    ? { valid: true as const }
    : await verifyPayment(body.payload, {
        scheme: provider.scheme,
        amountAlgo: step.quotedPriceAlgo ?? provider.priceAlgo,
        payeeAddress: FACILITATOR_PAYEE_ADDRESS,
        network: "testnet",
      });

  if (!verification.valid) {
    logEvent(
      workflow.id,
      "step_failed",
      { reason: "payment verification failed", detail: verification.reason },
      step.id
    );
    return NextResponse.json(
      { error: "payment verification failed", reason: verification.reason },
      { status: 402 }
    );
  }

  const receipt: Receipt = settlePayment(
    workflow.id,
    step.id,
    provider.id,
    body.payload,
    provider.scheme,
    existing
  );
  store.receipts.set(receipt.id, receipt);

  step.status = "paid";
  step.settledPriceAlgo = receipt.amountAlgo;
  step.receiptId = receipt.id;
  workflow.spentAlgo += receipt.amountAlgo;
  workflow.updatedAt = nowIso();

  logEvent(
    workflow.id,
    "payment_verified",
    { txnHash: receipt.txnHash, amountAlgo: receipt.amountAlgo },
    step.id
  );
  logEvent(
    workflow.id,
    "payment_settled",
    { receiptId: receipt.id, amountAlgo: receipt.amountAlgo },
    step.id
  );

  return NextResponse.json({ receipt, workflow });
}
