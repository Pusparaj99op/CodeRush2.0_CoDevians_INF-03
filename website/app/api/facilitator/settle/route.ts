// POST /api/facilitator/settle — x402 facilitator: confirm settlement and
// issue a receipt once verification has passed. Idempotent on txnHash.
// Body: { workflowId, stepId, payload: PaymentPayload }
//
// This is the endpoint the laptop-server calls before doing paid work — it
// holds no Algorand keys of its own and never confirms a payment itself
// (Doc/specs/03-laptop-server.md).

import { NextRequest, NextResponse } from "next/server";
import { settlePayment, verifyPayment, type PaymentPayload } from "@/lib/facilitator";
import { logEvent } from "@/lib/orchestrator";
import { getProvider } from "@/lib/providers";
import { store } from "@/lib/store";
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

  const workflow = await store.getWorkflow(body.workflowId);
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
  const existing = await store.findReceiptByStepAndTxn(step.id, body.payload.txnHash);

  const verification = existing
    ? { valid: true as const, simulated: existing.simulated }
    : await verifyPayment(body.payload, {
        scheme: provider.scheme,
        amountAlgo: step.quotedPriceAlgo ?? provider.priceAlgo,
        payeeAddress: FACILITATOR_PAYEE_ADDRESS,
        network: "testnet",
      });

  if (!verification.valid) {
    await logEvent(
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

  const receipt = settlePayment(
    workflow.id,
    step.id,
    provider.id,
    body.payload,
    provider.scheme,
    existing ?? undefined
  );
  await store.saveReceipt(receipt);

  if (!existing) {
    step.status = "paid";
    step.settledPriceAlgo = receipt.amountAlgo;
    step.receiptId = receipt.id;
    workflow.spentAlgo += receipt.amountAlgo;
    workflow.updatedAt = nowIso();
    await store.saveWorkflow(workflow);

    await logEvent(
      workflow.id,
      "payment_verified",
      { txnHash: receipt.txnHash, amountAlgo: receipt.amountAlgo, simulated: receipt.simulated },
      step.id
    );
    await logEvent(
      workflow.id,
      "payment_settled",
      { receiptId: receipt.id, amountAlgo: receipt.amountAlgo, simulated: receipt.simulated },
      step.id
    );
  }

  return NextResponse.json({ receipt, workflow });
}
