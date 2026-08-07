// Orchestrator: workflow compiler, budget manager, approval gate, and
// fulfillment verifier described in Doc/specs/02-website.md.
//
// Deliberately simple for the hackathon build: goals compile into a fixed
// two-step pipeline (translate -> fact-check) plus the laptop's local
// verification step, since the demo's job is to show the payment/approval/
// trace mechanics working end-to-end, not a general-purpose planner.

import { newId, nowIso } from "./id";
import { getProvider, PROVIDERS } from "./providers";
import { store } from "./store";
import { TIER_CAPS } from "./types";
import type {
  Approval,
  LedgerEvent,
  LedgerEventType,
  Tier,
  Workflow,
  WorkflowStep,
} from "./types";

export function logEvent(
  workflowId: string,
  type: LedgerEventType,
  detail: Record<string, unknown>,
  stepId?: string
): void {
  const event: LedgerEvent = {
    id: newId("evt"),
    workflowId,
    type,
    stepId,
    detail,
    at: nowIso(),
  };
  store.appendLedgerEvent(event);
}

/** Compiles a goal into a step graph. Every provider offer seen is logged. */
export function compileWorkflow(
  userId: string,
  tier: Tier,
  goal: string,
  budgetAlgo: number
): Workflow {
  const workflowId = newId("wf");

  const steps: WorkflowStep[] = PROVIDERS.filter((p) => p.capability !== "local-inference").map(
    (provider, i) => ({
      id: newId("step"),
      providerId: provider.id,
      description: `${provider.capability} via ${provider.name}`,
      condition: i === 0 ? undefined : "runs only if the prior step's output needs verification",
      dependsOn: i === 0 ? [] : [],
      status: "pending",
      quotedPriceAlgo: null,
      settledPriceAlgo: null,
      receiptId: null,
    })
  );
  // wire dependsOn now that ids exist
  for (let i = 1; i < steps.length; i++) {
    const prev = steps[i - 1];
    const cur = steps[i];
    if (prev && cur) cur.dependsOn = [prev.id];
  }

  const workflow: Workflow = {
    id: workflowId,
    userId,
    tier,
    goal,
    budgetAlgo,
    spentAlgo: 0,
    status: "planning",
    steps,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };

  store.workflows.set(workflowId, workflow);
  logEvent(workflowId, "workflow_created", { goal, budgetAlgo, tier, stepCount: steps.length });

  for (const step of steps) {
    const provider = getProvider(step.providerId);
    logEvent(
      workflowId,
      "offer_seen",
      { providerId: step.providerId, scheme: provider?.scheme, priceAlgo: provider?.priceAlgo },
      step.id
    );
  }

  workflow.status = "running";
  return workflow;
}

export interface QuoteResult {
  ok: boolean;
  reason?: string;
  requiresApproval: boolean;
  approval?: Approval;
}

/**
 * Quotes the next runnable step, checks it against the tier's budget cap,
 * and either marks it ready-to-pay or opens a human-in-the-loop approval.
 * This is the budget/policy enforcement point — it runs server-side
 * regardless of what any client displayed, per the App/Website specs.
 */
export function quoteStep(workflow: Workflow, step: WorkflowStep): QuoteResult {
  const provider = getProvider(step.providerId);
  if (!provider) {
    return { ok: false, reason: "unknown provider", requiresApproval: false };
  }

  const dependenciesMet = step.dependsOn.every(
    (depId) => workflow.steps.find((s) => s.id === depId)?.status === "fulfilled"
  );
  if (!dependenciesMet) {
    return { ok: false, reason: "dependencies not yet fulfilled", requiresApproval: false };
  }

  step.quotedPriceAlgo = provider.priceAlgo;
  step.status = "quoted";
  logEvent(
    workflow.id,
    "quote_received",
    { providerId: provider.id, priceAlgo: provider.priceAlgo, scheme: provider.scheme },
    step.id
  );

  if (workflow.spentAlgo + provider.priceAlgo > workflow.budgetAlgo) {
    return {
      ok: false,
      reason: "step would exceed workflow budget",
      requiresApproval: false,
    };
  }

  const cap = TIER_CAPS[workflow.tier].perTxnCapAlgo;
  const overCap = cap !== null && provider.priceAlgo > cap;
  const needsApproval = overCap || !provider.verified;

  if (!needsApproval) {
    step.status = "paying";
    return { ok: true, requiresApproval: false };
  }

  const approval: Approval = {
    id: newId("appr"),
    workflowId: workflow.id,
    stepId: step.id,
    providerId: provider.id,
    amountAlgo: provider.priceAlgo,
    reason: overCap
      ? `payment exceeds ${workflow.tier} tier cap of ${cap} ALGO`
      : "provider is not yet verified",
    status: "pending",
    createdAt: nowIso(),
    decidedAt: null,
  };
  store.approvals.set(approval.id, approval);
  step.status = "awaiting_approval";
  logEvent(
    workflow.id,
    "approval_requested",
    { approvalId: approval.id, reason: approval.reason, amountAlgo: approval.amountAlgo },
    step.id
  );

  return { ok: true, requiresApproval: true, approval };
}

export function decideApproval(
  approval: Approval,
  decision: "approved" | "denied"
): void {
  approval.status = decision;
  approval.decidedAt = nowIso();

  const workflow = store.workflows.get(approval.workflowId);
  const step = workflow?.steps.find((s) => s.id === approval.stepId);
  if (workflow && step) {
    step.status = decision === "approved" ? "paying" : "cancelled";
    logEvent(
      workflow.id,
      "approval_decided",
      { approvalId: approval.id, decision },
      step.id
    );
  }
}

/**
 * Fulfillment verifier: checks a step's result before the workflow is
 * allowed to advance to the next payment. Simplified to a presence/shape
 * check for the demo — Doc/specs/02-website.md's production version adds
 * schema, provenance, and quality-metadata checks.
 */
export function verifyFulfillment(workflow: Workflow, step: WorkflowStep, result: unknown): boolean {
  const passed = result !== null && result !== undefined;
  logEvent(
    workflow.id,
    "fulfillment_verified",
    { passed, result },
    step.id
  );
  step.status = passed ? "fulfilled" : "failed";
  if (!passed) {
    logEvent(workflow.id, "step_failed", { reason: "fulfillment verification failed" }, step.id);
  }
  workflow.updatedAt = nowIso();

  if (workflow.steps.every((s) => s.status === "fulfilled" || s.status === "skipped")) {
    workflow.status = "completed";
    logEvent(workflow.id, "workflow_completed", { spentAlgo: workflow.spentAlgo });
  }

  return passed;
}

export function cancelWorkflow(workflow: Workflow): { delivered: string[]; notPurchased: string[] } {
  const delivered = workflow.steps.filter((s) => s.status === "fulfilled").map((s) => s.id);
  const notPurchased = workflow.steps
    .filter((s) => !["fulfilled", "cancelled"].includes(s.status))
    .map((s) => s.id);

  for (const step of workflow.steps) {
    if (step.status !== "fulfilled") step.status = "cancelled";
  }
  workflow.status = "cancelled";
  workflow.updatedAt = nowIso();

  logEvent(workflow.id, "workflow_cancelled", { delivered, notPurchased });
  return { delivered, notPurchased };
}
