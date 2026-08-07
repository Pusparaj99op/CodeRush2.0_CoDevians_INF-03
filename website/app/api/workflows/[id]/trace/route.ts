// GET /api/workflows/:id/trace — full replayable trace for the trace viewer.
// Every offer, quote, approval, payment, and verification is here in order,
// per the INF-03 "evidence" and "replay" requirements.

import { NextRequest, NextResponse } from "next/server";
import { requireOwnedWorkflow } from "@/lib/api-auth";
import { store } from "@/lib/store";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const auth = await requireOwnedWorkflow(req, id);
  if (!auth.ok) return auth.response;

  const trace = await store.getTrace(id);
  return NextResponse.json({ workflowId: id, trace });
}
