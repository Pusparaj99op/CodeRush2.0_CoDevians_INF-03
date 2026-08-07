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
import { buildTravelPlan } from "./travel/compiler";
import type { StepKey, TravelPlan } from "./travel/compiler";
import { parseTravelGoal } from "./travel/goal-parser";
import { readMeta } from "./travel/mock-fulfillment";
import type { StepMeta } from "./travel/mock-fulfillment";
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

  const intent = parseTravelGoal(goal);
  const plan = buildTravelPlan(intent, budgetAlgo);

  const steps: WorkflowStep[] =
    plan.steps.length > 0
      ? compileTravelSteps(plan)
      : compileLegacyPipeline();

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
    // Carried on the existing event rather than a new LedgerEventType, so the
    // clients' event enums stay an exact mirror of the 13 that already exist.
    // This is what lets the app say "skipped travel insurance to stay inside
    // your budget" instead of silently showing one fewer step.
    intent: plan.steps.length > 0 ? intent : null,
    droppedSteps: plan.dropped,
    projectedAlgo: plan.projectedAlgo,
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

/**
 * Allocates step ids and resolves the plan's key references.
 *
 * The two passes matter: every id must exist before any `dependsOnKeys` is
 * looked up. Resolving as we go would leave later keys unresolved, and since
 * `[].every(...)` is true, a step with a silently emptied `dependsOn` looks
 * immediately runnable — the workflow would pay for the hotel before the
 * flight, and nothing would report an error.
 */
function compileTravelSteps(plan: TravelPlan): WorkflowStep[] {
  const ids = new Map<StepKey, string>();
  for (const planned of plan.steps) {
    ids.set(planned.key, newId("step"));
  }

  return plan.steps.map((planned) => ({
    id: ids.get(planned.key)!,
    providerId: planned.providerId,
    description: planned.description,
    condition: planned.condition,
    dependsOn: planned.dependsOnKeys.map((k) => ids.get(k)!).filter(Boolean),
    status: "pending" as const,
    quotedPriceAlgo: null,
    settledPriceAlgo: null,
    receiptId: null,
    optional: planned.optional,
  }));
}

/**
 * The original fixed translate -> fact-check -> local-inference pipeline, used
 * when the goal does not read as travel at all. Keeping it means a non-travel
 * goal still demonstrates the payment mechanics rather than failing to compile.
 */
function compileLegacyPipeline(): WorkflowStep[] {
  const legacy = PROVIDERS.filter((p) =>
    ["translate-api", "fact-check-api", "laptop-inference"].includes(p.id),
  );

  const steps: WorkflowStep[] = legacy.map((provider, i) => ({
    id: newId("step"),
    providerId: provider.id,
    description: `${provider.capability} via ${provider.name}`,
    condition: i === 0 ? undefined : "runs only if the prior step's output needs verification",
    dependsOn: [],
    status: "pending" as const,
    quotedPriceAlgo: null,
    settledPriceAlgo: null,
    receiptId: null,
    optional: false,
  }));

  for (let i = 1; i < steps.length; i++) {
    const prev = steps[i - 1];
    const cur = steps[i];
    if (prev && cur) cur.dependsOn = [prev.id];
  }
  return steps;
}

/**
 * Decides whether a step's conditional edge is satisfied, from the machine
 * readable header its dependencies wrote.
 *
 * Pure over the workflow it is given. A step with no condition, or whose
 * dependencies produced no readable signal, always runs — absence of evidence
 * must not silently cancel a booking the user is waiting for.
 */
export function evaluateCondition(
  workflow: Workflow,
  step: WorkflowStep,
): { run: boolean; reason?: string } {
  const metaOf = (providerId: string): StepMeta | null => {
    const dep = workflow.steps.find(
      (s) => step.dependsOn.includes(s.id) && s.providerId === providerId,
    );
    return readMeta(dep?.output);
  };

  switch (step.providerId) {
    case "flight-booking": {
      const search = metaOf("flight-search");
      if (!search) return { run: true };
      if (!search.found) {
        return { run: false, reason: "no fare was found within the budget" };
      }
      const price = typeof search.priceAlgo === "number" ? search.priceAlgo : 0;
      if (workflow.spentAlgo + price > workflow.budgetAlgo) {
        return { run: false, reason: "the fare no longer fits the remaining budget" };
      }
      return { run: true };
    }

    case "hotel-booking": {
      const search = metaOf("hotel-search");
      if (!search) return { run: true };
      if (!search.found) {
        return { run: false, reason: "no room was available for those dates" };
      }
      return { run: true };
    }

    case "ground-transfer": {
      const flight = metaOf("flight-booking");
      if (!flight || typeof flight.departHour !== "number") return { run: true };
      const hour = flight.departHour;
      // Airport transit runs 06:00-22:00; outside that a transfer is the only
      // way in, so this is exactly when the optional step earns its cost.
      if (hour >= 6 && hour < 22) {
        return { run: false, reason: "the arrival falls inside airport transit hours" };
      }
      return { run: true };
    }

    default:
      return { run: true };
  }
}

/** Marks a step skipped and records why, without inventing a new event type. */
async function skipStep(
  workflow: Workflow,
  step: WorkflowStep,
  reason: string,
): Promise<void> {
  step.status = "skipped";
  workflow.updatedAt = nowIso();
  await store.saveWorkflow(workflow);
  await logEvent(
    workflow.id,
    "provider_result",
    { providerId: step.providerId, skipped: true, reason },
    step.id,
  );
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

  // "skipped" counts as met. A skipped optional step is a resolved dependency,
  // not a pending one — treating it as unmet deadlocks everything downstream.
  const dependenciesMet = step.dependsOn.every((depId) => {
    const status = workflow.steps.find((s) => s.id === depId)?.status;
    return status === "fulfilled" || status === "skipped";
  });
  if (!dependenciesMet) {
    return { ok: false, reason: "dependencies not yet fulfilled", requiresApproval: false };
  }

  // Checked before quoting: a step whose condition is false must not appear in
  // the trace as a quote the user might think they were charged for.
  const condition = evaluateCondition(workflow, step);
  if (!condition.run) {
    await skipStep(workflow, step, condition.reason ?? "condition not met");
    return { ok: false, reason: "condition not met", requiresApproval: false };
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
    if (decision === "approved") {
      step.status = "paying";
    } else if (step.optional) {
      // Declining an optional extra must not kill the trip. Saying no to travel
      // insurance should leave the flight and hotel booked, not cancel both.
      step.status = "skipped";
    } else {
      step.status = "cancelled";
      workflow.status = "cancelled";
    }
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
      remainingBudgetAlgo: workflow.budgetAlgo - workflow.spentAlgo,
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
  // Bounded so a bug can't spin. Twice the step count, because a travel plan is
  // a diamond (flight and hotel search run in parallel) and a step can be
  // visited once to skip and once to run.
  for (let i = 0; i < workflow.steps.length * 2; i++) {
    if (workflow.status !== "running") break;

    // Pick the first step that is genuinely runnable rather than the first
    // pending one. The old version stopped at the head of the list, so with a
    // parallel branch it stalled on a step whose dependency was still queued.
    const next =
      workflow.steps.find((s) => s.status === "paying") ??
      workflow.steps.find(
        (s) =>
          s.status === "pending" &&
          s.dependsOn.every((depId) => {
            const status = workflow.steps.find((d) => d.id === depId)?.status;
            return status === "fulfilled" || status === "skipped";
          }),
      );
    if (!next) break;

    if (next.status === "pending") {
      const quote = await quoteStep(workflow, next);
      // A skipped step is progress, not a stop: keep going so the rest of the
      // plan still runs. quoteStep mutates `next` in place, so the reason code
      // is what distinguishes a skip from a real failure.
      if (!quote.ok) {
        if (quote.reason === "condition not met") continue;
        break;
      }
      // An approval blocks that step's branch, not the whole run. Stopping
      // outright would leave an independent hotel search queued behind an
      // unrelated decision about a flight — so keep going and let the user
      // decide everything that is ready at once. The step is now
      // `awaiting_approval`, so the selector will not pick it up again.
      if (quote.requiresApproval) continue;
    }

    const executed = await executeStep(workflow, next);
    if (!executed.ok) break;
  }

  // A run that ends on a skip never reaches verifyFulfillment, which is where
  // completion is normally detected — so check here too, or a trip whose last
  // step was skipped would sit at "running" forever.
  await settleCompletion(workflow);

  return workflow;
}

/** Marks a workflow completed once every step is fulfilled or skipped. */
async function settleCompletion(workflow: Workflow): Promise<void> {
  if (workflow.status !== "running") return;
  const done = workflow.steps.every(
    (s) => s.status === "fulfilled" || s.status === "skipped",
  );
  if (!done) return;

  workflow.status = "completed";
  workflow.updatedAt = nowIso();
  await store.saveWorkflow(workflow);
  await logEvent(workflow.id, "workflow_completed", { spentAlgo: workflow.spentAlgo });
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
