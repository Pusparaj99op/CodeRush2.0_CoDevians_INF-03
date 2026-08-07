// POST /api/workflows/:id/approve — approve or deny a pending step.
// Body: { approvalId: string, decision: "approved" | "denied" }

import { NextRequest, NextResponse } from "next/server";
import { requireOwnedWorkflow } from "@/lib/api-auth";
import { advanceWorkflow, decideApproval } from "@/lib/orchestrator";
import { store } from "@/lib/store";

interface ApproveBody {
  approvalId: string;
  decision: "approved" | "denied";
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Before req.json(), so an unauthenticated caller gets 401 rather than a
  // 400 that would tell them the body shape was the only thing wrong.
  const auth = await requireOwnedWorkflow(req, id);
  if (!auth.ok) return auth.response;
  const { workflow } = auth;

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

  // Carry on after *either* decision. Denying an optional step now marks it
  // skipped and leaves the workflow running, so the rest of the trip still
  // needs driving forward; only a denied core step cancels the workflow, and
  // advanceWorkflow stops immediately on that.
  await advanceWorkflow(updated);

  return NextResponse.json({ approval, workflow: updated });
}
