// POST /api/workflows — submit a goal + constraints, get back a compiled
// workflow. See Doc/specs/02-website.md API surface table.

import { NextRequest, NextResponse } from "next/server";
import { compileWorkflow, quoteStep } from "@/lib/orchestrator";
import type { Tier } from "@/lib/types";

interface CreateWorkflowBody {
  userId: string;
  goal: string;
  budgetAlgo: number;
  tier?: Tier;
}

export async function POST(req: NextRequest) {
  let body: CreateWorkflowBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  if (!body.userId || !body.goal || typeof body.budgetAlgo !== "number") {
    return NextResponse.json(
      { error: "userId, goal, and numeric budgetAlgo are required" },
      { status: 400 }
    );
  }
  if (body.budgetAlgo <= 0) {
    return NextResponse.json({ error: "budgetAlgo must be positive" }, { status: 400 });
  }

  const workflow = compileWorkflow(body.userId, body.tier ?? "free", body.goal, body.budgetAlgo);

  // Kick off the first runnable step's quote immediately so the caller
  // gets an actionable workflow (quoted or awaiting approval) rather than
  // an empty "planning" shell.
  const firstStep = workflow.steps[0];
  if (firstStep) {
    quoteStep(workflow, firstStep);
  }

  return NextResponse.json({ workflow }, { status: 201 });
}
