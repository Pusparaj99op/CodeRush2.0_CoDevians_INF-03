import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  ACTIVITIES_NIGHT_THRESHOLD,
  DEFAULT_NIGHTS,
  parseStartDate,
  parseTravelGoal,
  parseTravelers,
} from "./goal-parser";

// A fixed Wednesday, so every relative-date assertion is deterministic.
const NOW = new Date("2026-08-05T12:00:00Z"); // 2026-08-05 is a Wednesday

const parse = (goal: string) => parseTravelGoal(goal, { now: NOW });

describe("destination", () => {
  const cases: [string, string | null][] = [
    ["a weekend in Goa", "Goa"],
    ["trip to Tokyo next month", "Tokyo"],
    ["5 days in Jaipur for 2 people", "Jaipur"],
    ["I want to visit New Delhi", "New Delhi"],
    ["fly to Bali in March", "Bali"],
    ["holiday in Cape Town", "Cape Town"],
    ["going to Rio de Janeiro", "Rio De Janeiro"],
    ["translate this document", null],
  ];

  for (const [goal, expected] of cases) {
    it(`${JSON.stringify(goal)} -> ${expected}`, () => {
      assert.equal(parse(goal).destination, expected);
    });
  }

  it("stops at a following clause rather than swallowing it", () => {
    // Without the stop-word lookahead this yields "goa for 5 days under 12 algo".
    assert.equal(parse("Goa for 5 days under 12 ALGO").destination, null);
    assert.equal(parse("a trip to Goa for 5 days under 12 ALGO").destination, "Goa");
  });
});

describe("origin", () => {
  it("reads a departure city", () => {
    assert.equal(parse("trip to Goa from Mumbai").origin, "Mumbai");
    assert.equal(parse("departing Pune for Goa").origin, "Pune");
  });

  it("is null when unstated", () => {
    assert.equal(parse("a weekend in Goa").origin, null);
  });
});

describe("dates", () => {
  it("reads an ISO date", () => {
    assert.equal(parse("trip to Goa on 2026-09-12").startDate, "2026-09-12");
  });

  it("reads day-then-month", () => {
    assert.equal(parse("trip to Goa on 12th Sep").startDate, "2026-09-12");
    assert.equal(parse("trip to Goa on 3 Nov").startDate, "2026-11-03");
  });

  it("reads month-then-day", () => {
    assert.equal(parse("trip to Goa, Sep 12").startDate, "2026-09-12");
  });

  it("rolls a past month forward to its next occurrence", () => {
    // "in March" said in August means next March, not five months ago.
    assert.equal(parse("5 days in Goa in March").startDate, "2027-03-01");
  });

  it("keeps a month still ahead in the same year", () => {
    assert.equal(parse("5 days in Goa in December").startDate, "2026-12-01");
  });

  it("resolves relative dates against the injected clock", () => {
    assert.equal(parseStartDate("tomorrow", NOW), "2026-08-06");
    assert.equal(parseStartDate("next week", NOW), "2026-08-12");
    assert.equal(parseStartDate("next month", NOW), "2026-09-01");
    // Wednesday 5 Aug -> this Saturday is the 8th, next Saturday the 15th.
    assert.equal(parseStartDate("this weekend", NOW), "2026-08-08");
    assert.equal(parseStartDate("next weekend", NOW), "2026-08-15");
  });

  it("returns null when there is no date at all", () => {
    assert.equal(parse("a weekend in Goa").startDate, null);
  });

  it("derives an end date from the start plus nights", () => {
    const intent = parse("trip to Goa on 2026-09-12 for 4 nights");
    assert.equal(intent.nights, 4);
    assert.equal(intent.endDate, "2026-09-16");
  });

  it("lets an explicit date range override a duration phrase", () => {
    const intent = parse("trip to Goa from 2026-09-12 to 2026-09-20");
    assert.equal(intent.startDate, "2026-09-12");
    assert.equal(intent.endDate, "2026-09-20");
    assert.equal(intent.nights, 8);
  });
});

describe("nights", () => {
  it("defaults when nothing is said", () => {
    assert.equal(parse("a trip to Goa").nights, DEFAULT_NIGHTS);
  });

  it("counts nights directly", () => {
    assert.equal(parse("trip to Goa for 5 nights").nights, 5);
  });

  it("converts days to nights", () => {
    // 5 days is 4 nights. Getting this wrong shifts the hotel by a night,
    // which is a real charge.
    assert.equal(parse("trip to Goa for 5 days").nights, 4);
    assert.equal(parse("trip to Goa for 1 day").nights, 1);
  });

  it("converts weeks", () => {
    assert.equal(parse("trip to Goa for 2 weeks").nights, 14);
  });

  it("ignores an implausible duration", () => {
    assert.equal(parse("trip to Goa for 400 days").nights, DEFAULT_NIGHTS);
  });
});

describe("travellers", () => {
  const cases: [string, number][] = [
    ["for 3 people", 3],
    ["for 2 adults", 2],
    ["4 travellers", 4],
    ["2 travelers", 2],
    ["6 pax", 6],
    ["going solo", 1],
    ["just me", 1],
    ["a couple", 2],
    ["honeymoon", 2],
    ["me and my wife", 2],
    ["family trip", 4],
    ["", 1],
  ];

  for (const [text, expected] of cases) {
    it(`${JSON.stringify(text)} -> ${expected}`, () => {
      assert.equal(parseTravelers(text), expected);
    });
  }

  it("caps an implausible party size", () => {
    assert.equal(parseTravelers("for 400 people"), 1);
  });
});

describe("needs", () => {
  it("assumes flights and a hotel by default", () => {
    const intent = parse("a trip to Goa");
    assert.equal(intent.needsFlight, true);
    assert.equal(intent.needsHotel, true);
  });

  const noFlight = [
    "trip to Goa by train",
    "road trip to Goa",
    "driving to Goa",
    "trip to Goa, flights are booked",
    "trip to Goa, I already have my flights",
    "trip to Goa, no flights",
  ];
  for (const goal of noFlight) {
    it(`drops flights for ${JSON.stringify(goal)}`, () => {
      assert.equal(parse(goal).needsFlight, false);
    });
  }

  const noHotel = [
    "trip to Goa, staying with friends",
    "trip to Goa, no hotel",
    "trip to Goa, airbnb is booked",
    "trip to Goa, accommodation sorted",
  ];
  for (const goal of noHotel) {
    it(`drops the hotel for ${JSON.stringify(goal)}`, () => {
      assert.equal(parse(goal).needsHotel, false);
    });
  }

  it(`infers activities at ${ACTIVITIES_NIGHT_THRESHOLD}+ nights but not below`, () => {
    assert.equal(parse("trip to Goa for 2 nights").needsActivities, false);
    assert.equal(parse("trip to Goa for 3 nights").needsActivities, true);
  });

  it("infers activities from an explicit mention on a short stay", () => {
    assert.equal(
      parse("trip to Goa for 2 nights with a diving tour").needsActivities,
      true,
    );
  });

  it("only adds insurance when it is asked for", () => {
    // Never inferred: quietly adding a paid policy is the exact upsell this
    // product exists to make impossible.
    assert.equal(parse("trip to Goa for 10 nights for a family").needsInsurance, false);
    assert.equal(parse("trip to Goa with travel insurance").needsInsurance, true);
    assert.equal(parse("trip to Goa, make sure we are insured").needsInsurance, true);
  });

  it("adds a transfer when asked, or for a group flying and staying", () => {
    assert.equal(parse("trip to Goa with an airport transfer").needsTransfer, true);
    assert.equal(parse("trip to Goa for 2 people").needsTransfer, true);
    assert.equal(parse("trip to Goa going solo").needsTransfer, false);
  });
});

describe("confidence", () => {
  it("is none without a destination, so the caller can fall back", () => {
    assert.equal(parse("translate this document and fact-check it").confidence, "none");
    assert.equal(parse("run a market research pass").confidence, "none");
  });

  it("is low with a destination but no date or duration", () => {
    assert.equal(parse("a trip to Goa").confidence, "low");
  });

  it("is high with a destination and a date", () => {
    assert.equal(parse("trip to Goa on 2026-09-12").confidence, "high");
  });

  it("is high with a destination and a duration", () => {
    assert.equal(parse("trip to Goa for 5 nights").confidence, "high");
  });
});

describe("determinism", () => {
  it("returns an identical intent for an identical goal", () => {
    const goal = "5 days in Goa in March for 2 people from Mumbai, budget 12 ALGO";
    assert.deepEqual(parse(goal), parse(goal));
  });

  it("is case and whitespace insensitive", () => {
    const a = parse("Trip To GOA for 5 Nights");
    const b = parse("  trip   to goa   for 5 nights  ");
    assert.equal(a.destination, b.destination);
    assert.equal(a.nights, b.nights);
  });
});
