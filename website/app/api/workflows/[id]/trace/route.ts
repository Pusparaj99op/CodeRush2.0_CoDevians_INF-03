// GET /api/workflows/:id/trace — full replayable trace for the trace viewer.
// Every offer, quote, approval, payment, and verification is here in order,
// per the INF-03 "evidence" and "replay" requirements.

import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const workflow = await store.getWorkflow(id);
  if (!workflow) {
    return NextResponse.json({ error: "workflow not found" }, { status: 404 });
  }

  const trace = await store.getTrace(id);
  return NextResponse.json({ workflowId: id, trace });
}
