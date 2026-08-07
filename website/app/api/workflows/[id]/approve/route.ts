// POST /api/workflows/:id/approve — approve or deny a pending step.
// Body: { approvalId: string, decision: "approved" | "denied" }

import { NextRequest, NextResponse } from "next/server";
import { advanceWorkflow, decideApproval } from "@/lib/orchestrator";
import { store } from "@/lib/store";

interface ApproveBody {
  approvalId: string;
  decision: "approved" | "denied";
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const workflow = await store.getWorkflow(id);
  if (!workflow) {
    return NextResponse.json({ error: "workflow not found" }, { status: 404 });
  }

  let body: ApproveBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const approval = await store.getApproval(body.approvalId);
  if (!approval || approval.workflowId !== id) {
    return NextResponse.json({ error: "approval not found for this workflow" }, { status: 404 });
  }
  if (approval.status !== "pending") {
    return NextResponse.json({ error: "approval already decided" }, { status: 409 });
  }
  if (body.decision !== "approved" && body.decision !== "denied") {
    return NextResponse.json({ error: "decision must be 'approved' or 'denied'" }, { status: 400 });
  }

  await decideApproval(approval, body.decision);

  // Re-read: decideApproval writes the step transition through the store.
  const updated = (await store.getWorkflow(id)) ?? workflow;

  // An approval unblocks payment, so carry on — buy the approved step's
  // work and continue until the next approval, failure, or completion.
  if (body.decision === "approved") {
    await advanceWorkflow(updated);
  }

  return NextResponse.json({ approval, workflow: updated });
}
