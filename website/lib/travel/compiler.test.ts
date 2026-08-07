import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { buildTravelPlan, DROP_ORDER, type StepKey } from "./compiler";
import { parseTravelGoal, type TravelIntent } from "./goal-parser";

const NOW = new Date("2026-08-05T12:00:00Z");

function intentFor(goal: string): TravelIntent {
  return parseTravelGoal(goal, { now: NOW });
}

function keys(goal: string, budget: number): StepKey[] {
  return buildTravelPlan(intentFor(goal), budget).steps.map((s) => s.key);
}

/** A budget comfortably above any full plan, so nothing is shed. */
const GENEROUS = 1000;

describe("a full trip", () => {
  const plan = buildTravelPlan(
    intentFor("5 days in Goa in March for 2 people from Mumbai with insurance"),
    GENEROUS,
  );

  it("plans search then booking for both flight and hotel", () => {
    // Grouped by mode rather than interleaved. List order carries no meaning —
    // advanceWorkflow selects on dependency readiness — but pinning it keeps
    // the trace stable for anyone reading it top to bottom.
    assert.deepEqual(plan.steps.map((s) => s.key), [
      "flight_search",
      "flight_booking",
      "hotel_search",
      "hotel_booking",
      "ground_transfer",
      "activity_booking",
      "travel_insurance",
      "itinerary_summary",
    ]);
  });

  it("runs the two searches in parallel", () => {
    const search = plan.steps.filter((s) => s.key.endsWith("_search"));
    assert.equal(search.length, 2);
    for (const s of search) assert.deepEqual(s.dependsOnKeys, []);
  });

  it("holds the hotel until the flight is booked", () => {
    // Paying for a room before the flight is confirmed risks buying a stay for
    // a trip that never happens.
    const hotel = plan.steps.find((s) => s.key === "hotel_booking")!;
    assert.ok(hotel.dependsOnKeys.includes("flight_booking"));
    assert.ok(hotel.dependsOnKeys.includes("hotel_search"));
  });

  it("marks exactly the extras optional", () => {
    const optional = plan.steps.filter((s) => s.optional).map((s) => s.key);
    assert.deepEqual(optional.sort(), [
      "activity_booking",
      "ground_transfer",
      "travel_insurance",
    ]);
  });

  it("ends on the itinerary, depending on everything before it", () => {
    const last = plan.steps.at(-1)!;
    assert.equal(last.key, "itinerary_summary");
    assert.equal(last.providerId, "laptop-inference");
    assert.equal(last.dependsOnKeys.length, plan.steps.length - 1);
  });

  it("projects the sum of the advertised prices", () => {
    // 0.25 + 0.25 + 6 + 4 + 0.75 + 1.5 + 0.4 + 3
    assert.equal(plan.projectedAlgo, 16.15);
  });
});

describe("a trip with no flight", () => {
  const plan = buildTravelPlan(
    intentFor("5 days in Goa by train for 2 people"),
    GENEROUS,
  );

  it("drops both flight steps together", () => {
    const k = plan.steps.map((s) => s.key);
    assert.ok(!k.includes("flight_search"));
    assert.ok(!k.includes("flight_booking"));
    assert.ok(k.includes("hotel_booking"));
  });

  it("rewires the hotel to depend only on its own search", () => {
    const hotel = plan.steps.find((s) => s.key === "hotel_booking")!;
    assert.deepEqual(hotel.dependsOnKeys, ["hotel_search"]);
  });

  it("records why they were dropped", () => {
    const reasons = plan.dropped.filter((d) => d.key.startsWith("flight_"));
    assert.equal(reasons.length, 2);
    for (const r of reasons) assert.equal(r.reason, "not_needed");
  });
});

describe("a trip with no hotel", () => {
  it("keeps the flight and drops both hotel steps", () => {
    const k = keys("5 days in Goa, staying with friends", GENEROUS);
    assert.ok(k.includes("flight_booking"));
    assert.ok(!k.includes("hotel_search"));
    assert.ok(!k.includes("hotel_booking"));
  });
});

describe("budget shaping", () => {
  const goal = "5 days in Goa in March for 2 people from Mumbai with insurance";

  it("sheds optional steps in exactly the documented order", () => {
    // Full plan is 16.15. Shedding insurance (0.4) -> 15.75, then activities
    // (1.5) -> 14.25, then the transfer (0.75) -> 13.5.
    assert.ok(!keys(goal, 15.8).includes("travel_insurance"));

    const at14 = keys(goal, 14.3);
    assert.ok(!at14.includes("travel_insurance"));
    assert.ok(!at14.includes("activity_booking"));
    assert.ok(at14.includes("ground_transfer"));

    const at13 = keys(goal, 13.6);
    for (const k of DROP_ORDER) assert.ok(!at13.includes(k), k);
  });

  it("labels budget drops distinctly from not-needed ones", () => {
    const plan = buildTravelPlan(intentFor(goal), 15.8);
    const insurance = plan.dropped.find((d) => d.key === "travel_insurance")!;
    assert.equal(insurance.reason, "budget");
  });

  it("never drops a core step, even on an impossible budget", () => {
    const k = keys(goal, 0.1);
    // The plan still compiles; quoteStep's budget gate is what stops it, so
    // the user sees exactly which step they could not afford.
    assert.deepEqual(k, [
      "flight_search",
      "flight_booking",
      "hotel_search",
      "hotel_booking",
      "itinerary_summary",
    ]);
  });

  it("leaves no dependency pointing at a dropped step", () => {
    // A dangling dependency never becomes fulfilled or skipped, so
    // dependenciesMet would block the rest of the trip forever.
    for (const budget of [0.1, 5, 13.6, 14.3, 15.8, GENEROUS]) {
      const plan = buildTravelPlan(intentFor(goal), budget);
      const present = new Set(plan.steps.map((s) => s.key));
      for (const step of plan.steps) {
        for (const dep of step.dependsOnKeys) {
          assert.ok(present.has(dep), `${step.key} -> ${dep} at budget ${budget}`);
        }
      }
    }
  });
});

describe("non-travel goals", () => {
  it("produce an empty plan so the caller falls back", () => {
    const plan = buildTravelPlan(
      intentFor("translate this document and fact-check it"),
      GENEROUS,
    );
    assert.deepEqual(plan.steps, []);
    assert.equal(plan.projectedAlgo, 0);
  });
});

describe("determinism", () => {
  it("returns an identical plan for identical inputs", () => {
    const goal = "5 days in Goa in March for 2 people from Mumbai";
    assert.deepEqual(
      buildTravelPlan(intentFor(goal), 12),
      buildTravelPlan(intentFor(goal), 12),
    );
  });

  it("has no duplicate step keys", () => {
    const k = keys("5 days in Goa for a family with insurance and a tour", GENEROUS);
    assert.equal(new Set(k).size, k.length);
  });
});
