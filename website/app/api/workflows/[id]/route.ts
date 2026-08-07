// GET /api/workflows/:id — current workflow status, step graph, ledger snapshot.

import { NextRequest, NextResponse } from "next/server";
import { requireOwnedWorkflow } from "@/lib/api-auth";
import { store } from "@/lib/store";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const auth = await requireOwnedWorkflow(req, id);
  if (!auth.ok) return auth.response;
  const { workflow } = auth;

  const recentEvents = (await store.getTrace(id)).slice(-10);
  return NextResponse.json({ workflow, recentEvents });
}
