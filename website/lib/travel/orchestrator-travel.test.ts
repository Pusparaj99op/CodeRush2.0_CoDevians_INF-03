// End-to-end orchestrator behaviour for travel workflows, against the in-memory
// store. These are the tests that catch the failures that matter: a workflow
// stalling silently mid-graph, an optional step taking the whole trip down with
// it, or a tier cap not being applied.

import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";

import {
  advanceWorkflow,
  compileWorkflow,
  decideApproval,
} from "../orchestrator";
import { memoryStore } from "../store/memory";
import { store } from "../store";
import type { Tier, Workflow, WorkflowStep } from "../types";

const GOAL = "5 days in Goa in March for 2 people from Mumbai with insurance";

/**
 * The store is chosen once at module load. If a service account happens to be
 * configured these would hit Firestore, so assert we are on memory and bail
 * loudly rather than writing test data to a real project.
 */
function assertMemoryStore(): void {
  assert.equal(
    store,
    memoryStore,
    "these tests must run against the in-memory store; unset FIREBASE_SERVICE_ACCOUNT_JSON",
  );
}

async function run(tier: Tier, budget = 40, goal = GOAL): Promise<Workflow> {
  const wf = await compileWorkflow(`user_${tier}`, tier, goal, budget);
  return advanceWorkflow(wf);
}

function byProvider(wf: Workflow, providerId: string): WorkflowStep {
  const step = wf.steps.find((s) => s.providerId === providerId);
  assert.ok(step, `no step for ${providerId}`);
  return step;
}

/**
 * Finds the workflow's outstanding approval via the ledger.
 *
 * The store has no "list approvals for a workflow" method and this does not
 * warrant adding one — the trace already records every approval_requested,
 * which is the same path the app uses.
 */
async function pendingApproval(wf: Workflow) {
  const trace = await store.getTrace(wf.id);
  for (const event of trace) {
    if (event.type !== "approval_requested") continue;
    const approval = await store.getApproval(String(event.detail.approvalId));
    if (approval?.status === "pending") return approval;
  }
  return null;
}

beforeEach(() => {
  // Each workflow gets a fresh uuid, so no reset is needed between tests —
  // but writing to a real Firestore project from a unit test would be bad, so
  // fail loudly if the store is not the in-memory one.
  assertMemoryStore();
});

describe("compilation", () => {
  it("builds travel steps from a travel goal", async () => {
    const wf = await compileWorkflow("u1", "promax", GOAL, 40);
    const providers = wf.steps.map((s) => s.providerId);
    assert.ok(providers.includes("flight-search"));
    assert.ok(providers.includes("hotel-booking"));
    assert.ok(providers.includes("laptop-inference"));
    // The generic demo pipeline must not leak into a travel plan.
    assert.ok(!providers.includes("translate-api"));
  });

  it("falls back to the generic pipeline for a non-travel goal", async () => {
    const wf = await compileWorkflow("u1", "promax", "translate this document", 40);
    assert.deepEqual(wf.steps.map((s) => s.providerId), [
      "translate-api",
      "fact-check-api",
      "laptop-inference",
    ]);
  });

  it("resolves every dependency to a real step id", async () => {
    // A dependency resolving to undefined would leave dependsOn empty, and
    // [].every() is true — so the step would look immediately runnable and the
    // workflow would pay out of order with nothing reporting an error.
    const wf = await compileWorkflow("u1", "promax", GOAL, 40);
    const ids = new Set(wf.steps.map((s) => s.id));
    for (const step of wf.steps) {
      for (const dep of step.dependsOn) {
        assert.ok(ids.has(dep), `${step.providerId} depends on a missing step`);
      }
      assert.ok(!step.dependsOn.includes(undefined as unknown as string));
    }
  });

  it("records the intent and any dropped steps on workflow_created", async () => {
    const wf = await compileWorkflow("u1", "promax", GOAL, 12);
    const created = (await store.getTrace(wf.id)).find(
      (e) => e.type === "workflow_created",
    );
    assert.ok(created);
    assert.ok(created.detail.intent);
    assert.ok(Array.isArray(created.detail.droppedSteps));
    // Carried on an existing event rather than a new type, so client event
    // enums stay an exact mirror of the 13 that already exist.
    assert.equal(typeof created.detail.projectedAlgo, "number");
  });
});

describe("tier policy", () => {
  it("free tier stops at the first booking over its 0.5 cap", async () => {
    const wf = await run("free");
    assert.equal(wf.status, "running");

    // Both searches are 0.25, under the cap, so they clear without asking.
    assert.equal(byProvider(wf, "flight-search").status, "fulfilled");
    // Flight booking is 6.0, far over 0.5.
    assert.equal(byProvider(wf, "flight-booking").status, "awaiting_approval");

    const approval = await pendingApproval(wf);
    assert.ok(approval);
    assert.match(approval.reason, /exceeds free tier cap of 0\.5 ALGO/);
  });

  it("pro tier clears the hotel but still asks about the flight", async () => {
    // Hotel is 4.0 (under pro's 5), flight is 6.0 (over). This is the whole
    // point of the price choices.
    const wf = await run("pro");
    assert.equal(byProvider(wf, "flight-booking").status, "awaiting_approval");
  });

  it("promax runs the paid steps without asking", async () => {
    const wf = await run("promax");
    assert.equal(byProvider(wf, "flight-booking").status, "fulfilled");
    assert.equal(byProvider(wf, "hotel-booking").status, "fulfilled");
  });

  it("an unverified provider is gated on every tier, price notwithstanding", async () => {
    // travel-insurance is 0.4 — under every cap — but verified: false.
    const wf = await run("promax", 40, "3 nights in Goa with travel insurance");
    const insurance = byProvider(wf, "travel-insurance");
    assert.equal(insurance.status, "awaiting_approval");

    const approval = await pendingApproval(wf);
    assert.ok(approval);
    assert.equal(approval.reason, "provider is not yet verified");
  });
});

describe("the parallel search branch", () => {
  it("completes both searches rather than stalling on the first", async () => {
    // The old advanceWorkflow took the head of the list and broke if it was not
    // runnable, so a diamond graph stalled with no error at all.
    const wf = await run("promax");
    assert.equal(byProvider(wf, "flight-search").status, "fulfilled");
    assert.equal(byProvider(wf, "hotel-search").status, "fulfilled");
  });

  it("books the whole trip unattended and stops at the itinerary", async () => {
    // No insurance, so every booking provider is verified and promax has no
    // cap: the run should get all the way through search and booking with no
    // human in the loop, and only pause at the itinerary step — whose provider
    // (the laptop) is itself unverified, so it is gated on every tier.
    const wf = await run("promax", 40, "5 days in Goa for 2 people from Mumbai");

    for (const providerId of [
      "flight-search",
      "flight-booking",
      "hotel-search",
      "hotel-booking",
    ]) {
      assert.equal(byProvider(wf, providerId).status, "fulfilled", providerId);
    }
    assert.equal(byProvider(wf, "laptop-inference").status, "awaiting_approval");
  });

  it("stops before the itinerary when an extra needs approval", async () => {
    // The default goal asks for insurance, whose provider is unverified — so
    // the run blocks there rather than quietly finishing the trip without the
    // thing the user asked for.
    const wf = await run("promax");
    assert.equal(byProvider(wf, "travel-insurance").status, "awaiting_approval");
    assert.equal(byProvider(wf, "laptop-inference").status, "pending");
    assert.equal(wf.status, "running");
  });
});

describe("approvals", () => {
  it("approving a core step lets the trip carry on", async () => {
    const wf = await run("free");
    const approval = await pendingApproval(wf);
    assert.ok(approval);

    await decideApproval(approval, "approved");
    const updated = await store.getWorkflow(wf.id);
    assert.ok(updated);
    await advanceWorkflow(updated);

    assert.notEqual(byProvider(updated, "flight-booking").status, "awaiting_approval");
    assert.notEqual(updated.status, "cancelled");
  });

  it("denying a core step cancels the workflow", async () => {
    const wf = await run("free");
    const approval = await pendingApproval(wf);
    assert.ok(approval);

    await decideApproval(approval, "denied");
    const updated = await store.getWorkflow(wf.id);
    assert.ok(updated);
    assert.equal(updated.status, "cancelled");
  });

  it("denying an optional step skips it and keeps the trip running", async () => {
    // Saying no to travel insurance must not cancel the flight and hotel.
    const wf = await run("promax", 40, "3 nights in Goa with travel insurance");
    const approval = await pendingApproval(wf);
    assert.ok(approval);
    assert.equal(approval.providerId, "travel-insurance");

    await decideApproval(approval, "denied");
    const updated = await store.getWorkflow(wf.id);
    assert.ok(updated);

    assert.equal(byProvider(updated, "travel-insurance").status, "skipped");
    assert.notEqual(updated.status, "cancelled");

    // And the rest of the plan still finishes.
    await advanceWorkflow(updated);
    assert.equal(byProvider(updated, "laptop-inference").status !== "pending", true);
  });
});

describe("skipped steps", () => {
  it("do not block the steps that depend on them", async () => {
    const wf = await run("promax", 40, "3 nights in Goa with travel insurance");
    const approval = await pendingApproval(wf);
    assert.ok(approval);
    await decideApproval(approval, "denied");

    const updated = await store.getWorkflow(wf.id);
    assert.ok(updated);
    await advanceWorkflow(updated);

    // The itinerary depends on every booking step, including the skipped one.
    // If "skipped" did not count as a met dependency this would sit at pending
    // forever.
    assert.notEqual(byProvider(updated, "laptop-inference").status, "pending");
  });

  it("are logged without inventing a new ledger event type", async () => {
    const wf = await run("promax", 40, "3 nights in Goa with travel insurance");
    const approval = await pendingApproval(wf);
    assert.ok(approval);
    await decideApproval(approval, "denied");

    const updated = await store.getWorkflow(wf.id);
    assert.ok(updated);
    await advanceWorkflow(updated);

    const KNOWN = new Set([
      "workflow_created",
      "offer_seen",
      "quote_received",
      "approval_requested",
      "approval_decided",
      "payment_verified",
      "payment_settled",
      "provider_called",
      "provider_result",
      "fulfillment_verified",
      "step_failed",
      "workflow_cancelled",
      "workflow_completed",
    ]);
    for (const event of await store.getTrace(wf.id)) {
      assert.ok(KNOWN.has(event.type), `unexpected event type ${event.type}`);
    }
  });
});

describe("budget", () => {
  it("stops rather than overspending when a step will not fit", async () => {
    // Enough for the searches, nowhere near enough for a 6 ALGO flight.
    const wf = await run("promax", 1);
    assert.notEqual(byProvider(wf, "flight-booking").status, "fulfilled");
    assert.ok(wf.spentAlgo <= 1);
  });

  it("never spends more than the budget", async () => {
    for (const budget of [1, 5, 12, 20, 40]) {
      const wf = await run("promax", budget);
      assert.ok(
        wf.spentAlgo <= budget,
        `spent ${wf.spentAlgo} of a ${budget} budget`,
      );
    }
  });
});

describe("determinism", () => {
  it("produces the same spend for the same goal and budget", async () => {
    const a = await run("promax", 40);
    const b = await run("promax", 40);
    assert.equal(a.spentAlgo, b.spentAlgo);
    assert.deepEqual(
      a.steps.map((s) => [s.providerId, s.status]),
      b.steps.map((s) => [s.providerId, s.status]),
    );
  });
});
