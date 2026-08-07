// POST /api/workflows/:id/approve — approve or deny a pending step.
// Body: { approvalId: string, decision: "approved" | "denied" }

import { NextRequest, NextResponse } from "next/server";
import { decideApproval, quoteStep } from "@/lib/orchestrator";
import { store } from "@/lib/store";

interface ApproveBody {
  approvalId: string;
  decision: "approved" | "denied";
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const workflow = store.workflows.get(params.id);
  if (!workflow) {
    return NextResponse.json({ error: "workflow not found" }, { status: 404 });
  }

  let body: ApproveBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const approval = store.approvals.get(body.approvalId);
  if (!approval || approval.workflowId !== params.id) {
    return NextResponse.json({ error: "approval not found for this workflow" }, { status: 404 });
  }
  if (approval.status !== "pending") {
    return NextResponse.json({ error: "approval already decided" }, { status: 409 });
  }
  if (body.decision !== "approved" && body.decision !== "denied") {
    return NextResponse.json({ error: "decision must be 'approved' or 'denied'" }, { status: 400 });
  }

  decideApproval(approval, body.decision);

  // If this unblocked a step, the caller (App/Website client) is expected
  // to proceed to the facilitator verify/settle endpoints next; we don't
  // auto-pay here since payment requires a client-signed Algorand txn.
  const nextStep = workflow.steps.find((s) => s.status === "pending");
  if (nextStep) quoteStep(workflow, nextStep);

  return NextResponse.json({ approval, workflow });
}
