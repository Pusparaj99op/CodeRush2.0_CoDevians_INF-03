// POST /api/workflows/:id/cancel — cancel a running workflow. Returns what
// was delivered vs. not purchased and the ledger close-out, per the
// "emergency stop" safety boundary in Doc/specs/00-overview.md.

import { NextRequest, NextResponse } from "next/server";
import { cancelWorkflow } from "@/lib/orchestrator";
import { store } from "@/lib/store";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const workflow = await store.getWorkflow(id);
  if (!workflow) {
    return NextResponse.json({ error: "workflow not found" }, { status: 404 });
  }
  if (workflow.status === "completed" || workflow.status === "cancelled") {
    return NextResponse.json({ error: `workflow already ${workflow.status}` }, { status: 409 });
  }

  const closeOut = await cancelWorkflow(workflow);
  return NextResponse.json({ workflow, closeOut });
}
