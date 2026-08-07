// Orchestrator: workflow compiler, budget manager, approval gate, provider
// executor, and fulfillment verifier described in Doc/specs/02-website.md.
//
// Deliberately simple for the hackathon build: goals compile into a fixed
// pipeline (translate -> fact-check -> local verification on the laptop),
// since the demo's job is to show the payment/approval/trace mechanics
// working end-to-end, not a general-purpose planner.
//
// Every function here is async because the store is (lib/store) — Firestore
// on the live deploy, in-memory locally.

import { settlePayment } from "./facilitator";
import { newId, nowIso } from "./id";
import { getProvider, PROVIDERS } from "./providers";
import { callProvider, ProviderError } from "./provider-client";
import { settlementMode } from "./settlement-mode";
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

export async function logEvent(
  workflowId: string,
  type: LedgerEventType,
  detail: Record<string, unknown>,
  stepId?: string
): Promise<void> {
  const event: LedgerEvent = {
    id: newId("evt"),
    workflowId,
    type,
    stepId,
    detail,
    at: nowIso(),
  };
  await store.appendLedgerEvent(event);
}

/** Compiles a goal into a step graph. Every provider offer seen is logged. */
export async function compileWorkflow(
  userId: string,
  tier: Tier,
  goal: string,
  budgetAlgo: number
): Promise<Workflow> {
  const workflowId = newId("wf");

  // All providers participate, including the laptop's local-inference step.
  // It used to be filtered out here, which meant the one real paid provider
  // in the marketplace was never actually part of any workflow.
  const steps: WorkflowStep[] = PROVIDERS.map((provider, i) => ({
    id: newId("step"),
    providerId: provider.id,
    description: `${provider.capability} via ${provider.name}`,
    condition: i === 0 ? undefined : "runs only if the prior step's output needs verification",
    dependsOn: [],
    status: "pending",
    quotedPriceAlgo: null,
    settledPriceAlgo: null,
    receiptId: null,
  }));
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
    status: "running",
    steps,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };

  await store.saveWorkflow(workflow);
  await logEvent(workflowId, "workflow_created", {
    goal,
    budgetAlgo,
    tier,
    stepCount: steps.length,
    settlementMode: settlementMode(),
  });

  for (const step of steps) {
    const provider = getProvider(step.providerId);
    await logEvent(
      workflowId,
      "offer_seen",
      {
        providerId: step.providerId,
        scheme: provider?.scheme,
        priceAlgo: provider?.priceAlgo,
        mock: provider?.mock ?? false,
      },
      step.id
    );
  }

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
export async function quoteStep(workflow: Workflow, step: WorkflowStep): Promise<QuoteResult> {
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
  await logEvent(
    workflow.id,
    "quote_received",
    { providerId: provider.id, priceAlgo: provider.priceAlgo, scheme: provider.scheme },
    step.id
  );

  if (workflow.spentAlgo + provider.priceAlgo > workflow.budgetAlgo) {
    await store.saveWorkflow(workflow);
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
    await store.saveWorkflow(workflow);
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
  await store.saveApproval(approval);
  step.status = "awaiting_approval";
  await store.saveWorkflow(workflow);
  await logEvent(
    workflow.id,
    "approval_requested",
    { approvalId: approval.id, reason: approval.reason, amountAlgo: approval.amountAlgo },
    step.id
  );

  return { ok: true, requiresApproval: true, approval };
}

export async function decideApproval(
  approval: Approval,
  decision: "approved" | "denied"
): Promise<void> {
  approval.status = decision;
  approval.decidedAt = nowIso();
  await store.saveApproval(approval);

  const workflow = await store.getWorkflow(approval.workflowId);
  const step = workflow?.steps.find((s) => s.id === approval.stepId);
  if (workflow && step) {
    step.status = decision === "approved" ? "paying" : "cancelled";
    if (decision === "denied") workflow.status = "cancelled";
    workflow.updatedAt = nowIso();
    await store.saveWorkflow(workflow);
    await logEvent(workflow.id, "approval_decided", { approvalId: approval.id, decision }, step.id);
  }
}

/**
 * Buys the step's work from its provider and records the settlement.
 *
 * This is the call that was missing entirely: `Provider.endpoint` was never
 * read, so no work was ever purchased. The step must already be in `paying`
 * (i.e. it cleared the budget cap, or a human approved it) — this function
 * does not bypass the approval gate.
 */
export async function executeStep(
  workflow: Workflow,
  step: WorkflowStep
): Promise<{ ok: boolean; reason?: string; retryable?: boolean; output?: string }> {
  const provider = getProvider(step.providerId);
  if (!provider) {
    return { ok: false, reason: "unknown provider" };
  }
  if (step.status !== "paying") {
    return { ok: false, reason: `step is '${step.status}', expected 'paying'` };
  }

  // Feed the previous step's output forward so the pipeline is a real
  // chain rather than three unrelated calls.
  const priorStep = step.dependsOn
    .map((id) => workflow.steps.find((s) => s.id === id))
    .find((s) => s?.output);
  const input = priorStep?.output ?? workflow.goal;

  await logEvent(
    workflow.id,
    "provider_called",
    { providerId: provider.id, endpoint: provider.endpoint, mock: provider.mock ?? false },
    step.id
  );

  let result: Awaited<ReturnType<typeof callProvider>>;
  try {
    result = await callProvider(provider, {
      workflowId: workflow.id,
      stepId: step.id,
      task: provider.capability,
      input,
    });
  } catch (err) {
    const retryable = err instanceof ProviderError ? err.retryable : false;
    step.status = "failed";
    workflow.status = "failed";
    workflow.updatedAt = nowIso();
    await store.saveWorkflow(workflow);
    await logEvent(
      workflow.id,
      "step_failed",
      { reason: (err as Error).message, retryable, providerId: provider.id },
      step.id
    );
    return { ok: false, reason: (err as Error).message, retryable };
  }

  // Record settlement. A real provider already had our facilitator verify
  // the payment before doing the work — in that case the settle route has
  // already written the receipt and logged it, and we must not double-count
  // the spend or duplicate the ledger entries.
  const existing = await store.findReceiptByStepAndTxn(step.id, result.payment.txnHash);
  const receipt = settlePayment(
    workflow.id,
    step.id,
    provider.id,
    result.payment,
    provider.scheme,
    existing ?? undefined
  );
  await store.saveReceipt(receipt);

  step.status = "paid";
  step.settledPriceAlgo = receipt.amountAlgo;
  step.receiptId = receipt.id;
  step.output = result.output;
  workflow.spentAlgo += existing ? 0 : receipt.amountAlgo;
  workflow.updatedAt = nowIso();
  await store.saveWorkflow(workflow);

  if (!existing) {
    await logEvent(
      workflow.id,
      "payment_settled",
      {
        receiptId: receipt.id,
        amountAlgo: receipt.amountAlgo,
        txnHash: receipt.txnHash,
        simulated: receipt.simulated,
        scheme: provider.scheme,
      },
      step.id
    );
  }
  await logEvent(
    workflow.id,
    "provider_result",
    {
      providerId: provider.id,
      usage: result.usage,
      settlement: result.settlement,
      preview: result.output.slice(0, 200),
    },
    step.id
  );

  await verifyFulfillment(workflow, step, result.output);
  return { ok: true, output: result.output };
}

/**
 * Fulfillment verifier: checks a step's result before the workflow is
 * allowed to advance to the next payment. Simplified to a presence/shape
 * check for the demo — Doc/specs/02-website.md's production version adds
 * schema, provenance, and quality-metadata checks.
 */
export async function verifyFulfillment(
  workflow: Workflow,
  step: WorkflowStep,
  result: unknown
): Promise<boolean> {
  const passed = typeof result === "string" ? result.trim().length > 0 : result != null;
  await logEvent(workflow.id, "fulfillment_verified", { passed }, step.id);

  step.status = passed ? "fulfilled" : "failed";
  if (!passed) {
    await logEvent(workflow.id, "step_failed", { reason: "fulfillment verification failed" }, step.id);
    workflow.status = "failed";
  }
  workflow.updatedAt = nowIso();

  if (workflow.steps.every((s) => s.status === "fulfilled" || s.status === "skipped")) {
    workflow.status = "completed";
    await store.saveWorkflow(workflow);
    await logEvent(workflow.id, "workflow_completed", { spentAlgo: workflow.spentAlgo });
  } else {
    await store.saveWorkflow(workflow);
  }

  return passed;
}

/**
 * Drives the workflow as far as it can go without human input: quote the
 * next runnable step, execute it if it cleared the budget gate, repeat.
 * Stops at the first approval request, failure, or completion.
 */
export async function advanceWorkflow(workflow: Workflow): Promise<Workflow> {
  // Bounded so a bug can't spin: at most one pass per step.
  for (let i = 0; i < workflow.steps.length; i++) {
    if (workflow.status !== "running") break;

    const next = workflow.steps.find((s) => s.status === "pending" || s.status === "paying");
    if (!next) break;

    if (next.status === "pending") {
      const quote = await quoteStep(workflow, next);
      if (!quote.ok || quote.requiresApproval) break;
    }

    const executed = await executeStep(workflow, next);
    if (!executed.ok) break;
  }

  return workflow;
}

export async function cancelWorkflow(
  workflow: Workflow
): Promise<{ delivered: string[]; notPurchased: string[] }> {
  const delivered = workflow.steps.filter((s) => s.status === "fulfilled").map((s) => s.id);
  const notPurchased = workflow.steps
    .filter((s) => !["fulfilled", "cancelled"].includes(s.status))
    .map((s) => s.id);

  for (const step of workflow.steps) {
    if (step.status !== "fulfilled") step.status = "cancelled";
  }
  workflow.status = "cancelled";
  workflow.updatedAt = nowIso();
  await store.saveWorkflow(workflow);

  await logEvent(workflow.id, "workflow_cancelled", { delivered, notPurchased });
  return { delivered, notPurchased };
}
