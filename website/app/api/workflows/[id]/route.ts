// GET /api/workflows/:id — current workflow status, step graph, ledger snapshot.

import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const workflow = store.workflows.get(params.id);
  if (!workflow) {
    return NextResponse.json({ error: "workflow not found" }, { status: 404 });
  }

  const recentEvents = store.getTrace(params.id).slice(-10);
  return NextResponse.json({ workflow, recentEvents });
}
