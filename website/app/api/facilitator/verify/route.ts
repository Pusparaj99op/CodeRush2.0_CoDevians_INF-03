// POST /api/facilitator/verify — x402 facilitator: verify a submitted
// payment payload against the terms declared for a workflow step.
// Body: { workflowId, stepId, payload: PaymentPayload }

import { NextRequest, NextResponse } from "next/server";
import { verifyPayment, type PaymentPayload } from "@/lib/facilitator";
import { FACILITATOR_PAYEE_ADDRESS } from "@/lib/facilitator-config";
import { getProvider } from "@/lib/providers";
import { store } from "@/lib/store";

interface VerifyBody {
  workflowId: string;
  stepId: string;
  payload: PaymentPayload;
}

export async function POST(req: NextRequest) {
  let body: VerifyBody;
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
  if (step.status !== "paying") {
    return NextResponse.json(
      { error: `step is '${step.status}', expected 'paying' before verification` },
      { status: 409 }
    );
  }

  const result = await verifyPayment(body.payload, {
    scheme: provider.scheme,
    amountAlgo: step.quotedPriceAlgo ?? provider.priceAlgo,
    payeeAddress: FACILITATOR_PAYEE_ADDRESS,
    network: "testnet",
  });

  return NextResponse.json({ result });
}
