// POST /api/workflows — submit a goal + constraints, get back a compiled
// workflow. See Doc/specs/02-website.md API surface table.

import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/api-auth";
import { advanceWorkflow, compileWorkflow } from "@/lib/orchestrator";
import { store } from "@/lib/store";
import type { Tier } from "@/lib/types";

// GET /api/workflows — list the caller's workflows, newest first. Powers
// the /dashboard/workflows page. The user comes from a verified Firebase
// ID token, not a query param: the previous version trusted a `userId`
// param, so anyone could read anyone else's workflows by guessing a uid.
export async function GET(req: NextRequest) {
  const auth = await requireUser(req);
  if (!auth.ok) return auth.response;

  const workflows = await store.listWorkflowsByUser(auth.userId);
  return NextResponse.json({ workflows });
}

interface CreateWorkflowBody {
  goal: string;
  budgetAlgo: number;
  tier?: Tier;
}

export async function POST(req: NextRequest) {
  const auth = await requireUser(req);
  if (!auth.ok) return auth.response;

  let body: CreateWorkflowBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  if (!body.goal || typeof body.budgetAlgo !== "number") {
    return NextResponse.json(
      { error: "goal and numeric budgetAlgo are required" },
      { status: 400 }
    );
  }
  if (body.budgetAlgo <= 0) {
    return NextResponse.json({ error: "budgetAlgo must be positive" }, { status: 400 });
  }

  const workflow = await compileWorkflow(
    auth.userId,
    body.tier ?? "free",
    body.goal,
    body.budgetAlgo
  );

  // Drive the workflow as far as it can go on its own — quoting, paying,
  // and actually calling providers — so the caller gets a live workflow
  // rather than an inert "planning" shell. Stops at the first approval.
  await advanceWorkflow(workflow);

  return NextResponse.json({ workflow }, { status: 201 });
}
