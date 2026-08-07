// GET /api/workflows/:id — current workflow status, step graph, ledger snapshot.

import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const workflow = await store.getWorkflow(id);
  if (!workflow) {
    return NextResponse.json({ error: "workflow not found" }, { status: 404 });
  }

  const recentEvents = (await store.getTrace(id)).slice(-10);
  return NextResponse.json({ workflow, recentEvents });
}
