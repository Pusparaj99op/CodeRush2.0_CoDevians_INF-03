// POST /api/workflows/:id/steps/:stepId/execute — buy one step's work from
// its provider.
//
// The orchestrator normally drives this itself (advanceWorkflow), but an
// explicit endpoint matters for the demo: it's how you retry a step after
// the laptop's tunnel drops and comes back, which is INF-03's
// dependency-failure scenario.

import { NextRequest, NextResponse } from "next/server";
import { executeStep, quoteStep } from "@/lib/orchestrator";
import { store } from "@/lib/store";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; stepId: string }> }
) {
  const { id, stepId } = await params;

  const workflow = await store.getWorkflow(id);
  if (!workflow) {
    return NextResponse.json({ error: "workflow not found" }, { status: 404 });
  }
  const step = workflow.steps.find((s) => s.id === stepId);
  if (!step) {
    return NextResponse.json({ error: "step not found in this workflow" }, { status: 404 });
  }

  // A step that previously failed is back to a retry from its quote — the
  // budget/approval gate has to run again rather than being skipped.
  if (step.status === "failed" || step.status === "pending") {
    workflow.status = "running";
    const quote = await quoteStep(workflow, step);
    if (!quote.ok) {
      return NextResponse.json({ error: quote.reason, workflow }, { status: 409 });
    }
    if (quote.requiresApproval) {
      return NextResponse.json(
        { error: "step requires approval before it can be executed", approval: quote.approval, workflow },
        { status: 409 }
      );
    }
  }

  if (step.status !== "paying") {
    return NextResponse.json(
      { error: `step is '${step.status}', expected 'paying'`, workflow },
      { status: 409 }
    );
  }

  const result = await executeStep(workflow, step);
  const updated = (await store.getWorkflow(id)) ?? workflow;

  if (!result.ok) {
    // 503 for a transient provider outage so a client can distinguish
    // "try again" from "this step is rejected".
    return NextResponse.json(
      { error: result.reason, retryable: result.retryable ?? false, workflow: updated },
      { status: result.retryable ? 503 : 502 }
    );
  }

  return NextResponse.json({ workflow: updated, output: result.output });
}
