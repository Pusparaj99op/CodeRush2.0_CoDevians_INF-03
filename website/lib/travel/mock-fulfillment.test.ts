import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { getProvider } from "../providers";
import { META_PREFIX, mockFulfillment, readMeta } from "./mock-fulfillment";
import type { ProviderCallRequest } from "../provider-client";

function req(input: string): ProviderCallRequest {
  return { workflowId: "wf_1", stepId: "step_1", task: "t", input };
}

function call(providerId: string, input: string, budget?: number): string {
  const provider = getProvider(providerId);
  assert.ok(provider, providerId);
  const out = mockFulfillment(provider, req(input), budget);
  assert.ok(out, `${providerId} produced no fixture`);
  return out;
}

const TRAVEL_PROVIDERS = [
  "flight-search",
  "flight-booking",
  "hotel-search",
  "hotel-booking",
  "activity-booking",
  "ground-transfer",
  "travel-insurance",
];

describe("determinism", () => {
  it("is byte-identical for the same provider and input", () => {
    // The whole point: a user re-running a goal must not be quoted a different
    // fare for no reason, and the trace has to be stable enough to screenshot.
    for (const id of TRAVEL_PROVIDERS) {
      assert.equal(call(id, "a trip to Goa"), call(id, "a trip to Goa"), id);
    }
  });

  it("differs across inputs", () => {
    assert.notEqual(
      call("flight-search", "a trip to Goa"),
      call("flight-search", "a trip to Tokyo"),
    );
  });

  it("differs across providers for the same input", () => {
    assert.notEqual(
      call("flight-search", "a trip to Goa"),
      call("hotel-search", "a trip to Goa"),
    );
  });
});

describe("format", () => {
  it("leads with a parseable meta header and a human line", () => {
    for (const id of TRAVEL_PROVIDERS) {
      const out = call(id, "a trip to Goa");
      assert.ok(out.startsWith(META_PREFIX), id);

      const meta = readMeta(out);
      assert.ok(meta, id);
      assert.equal(typeof meta.kind, "string");
      assert.equal(typeof meta.found, "boolean");

      const human = out.split("\n").slice(1).join("\n");
      assert.ok(human.trim().length > 0, `${id} has no human line`);
    }
  });

  it("quotes a price on every result", () => {
    for (const id of TRAVEL_PROVIDERS) {
      const meta = readMeta(call(id, "a trip to Goa"));
      assert.equal(typeof meta?.priceAlgo, "number", id);
    }
  });

  it("never quotes above the ceiling of the provider that will charge it", () => {
    // A search's priceAlgo is the fare it *found*, which the booking provider
    // will later charge — so the ceiling to check is the booking provider's,
    // not the search's own fee. A fixture quoting above it would let the agent
    // overspend behind the budget manager's back.
    const chargedBy: Record<string, string> = {
      "flight-search": "flight-booking",
      "hotel-search": "hotel-booking",
    };

    for (const id of TRAVEL_PROVIDERS) {
      const ceiling = getProvider(chargedBy[id] ?? id)!.priceAlgo;
      for (const goal of ["Goa", "Tokyo", "Jaipur", "Bali", "Lisbon", "Oslo"]) {
        const meta = readMeta(call(id, goal, 1000));
        assert.ok(
          (meta?.priceAlgo as number) <= ceiling,
          `${id} quoted ${meta?.priceAlgo} above ${ceiling} for ${goal}`,
        );
      }
    }
  });
});

describe("budget awareness", () => {
  it("reports nothing found when the cheapest fare is out of range", () => {
    const meta = readMeta(call("flight-search", "a trip to Goa", 0.01));
    assert.equal(meta?.found, false);
    assert.equal(meta?.reason, "over_budget");
  });

  it("reports a find when the budget is ample", () => {
    const meta = readMeta(call("flight-search", "a trip to Goa", 1000));
    assert.equal(meta?.found, true);
  });

  it("says so in the human line too, not just the header", () => {
    const out = call("hotel-search", "a trip to Goa", 0.01);
    assert.match(out.split("\n")[1] ?? "", /within the remaining budget/);
  });
});

describe("chaining", () => {
  it("carries the searched fare through to the booking", () => {
    const search = call("flight-search", "a trip to Goa", 1000);
    const booking = call("flight-booking", search);
    assert.equal(readMeta(booking)?.priceAlgo, readMeta(search)?.priceAlgo);
    assert.equal(readMeta(booking)?.carrier, readMeta(search)?.carrier);
  });

  it("carries the searched hotel through to the booking", () => {
    const search = call("hotel-search", "a trip to Goa", 1000);
    const booking = call("hotel-booking", search);
    assert.equal(readMeta(booking)?.hotel, readMeta(search)?.hotel);
  });
});

describe("readMeta", () => {
  it("returns null for anything without a header", () => {
    assert.equal(readMeta(null), null);
    assert.equal(readMeta(undefined), null);
    assert.equal(readMeta(""), null);
    assert.equal(readMeta("just some provider output"), null);
  });

  it("returns null rather than throwing on a malformed header", () => {
    // A provider returning junk must not take the workflow down; the condition
    // evaluator treats null as "no signal" and lets the step run.
    assert.equal(readMeta(`${META_PREFIX}{not json`), null);
    assert.equal(readMeta(`${META_PREFIX}"a string"`), null);
    assert.equal(readMeta(`${META_PREFIX}null`), null);
  });

  it("reads only the first line", () => {
    const out = `${META_PREFIX}{"kind":"x","found":true}\nVELDAR-META {"kind":"y"}`;
    assert.equal(readMeta(out)?.kind, "x");
  });
});

describe("non-travel providers", () => {
  it("get no fixture, so the caller keeps its own behaviour", () => {
    for (const id of ["translate-api", "fact-check-api", "laptop-inference"]) {
      const provider = getProvider(id)!;
      assert.equal(mockFulfillment(provider, req("anything")), null, id);
    }
  });
});
