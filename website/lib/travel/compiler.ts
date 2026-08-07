// Turns a TravelIntent into a step graph.
//
// Pure and synchronous: no store, no clock, no ids. `compileWorkflow` allocates
// the real step ids afterwards and resolves the key references below. Keeping
// this separable is what makes the whole plan assertable in a unit test.

import { getProvider } from "../providers";
import type { TravelIntent } from "./goal-parser";

export type StepKey =
  | "flight_search"
  | "hotel_search"
  | "flight_booking"
  | "hotel_booking"
  | "ground_transfer"
  | "activity_booking"
  | "travel_insurance"
  | "itinerary_summary";

export interface PlannedStep {
  key: StepKey;
  providerId: string;
  description: string;
  condition?: string;
  /** References other steps by [key]; resolved to ids by `compileWorkflow`. */
  dependsOnKeys: StepKey[];
  /**
   * Optional steps can be skipped — by budget here, by a false runtime
   * condition later, or by the user denying their approval — without failing
   * the trip. Core steps cannot.
   */
  optional: boolean;
}

export interface DroppedStep {
  key: StepKey;
  reason: "budget" | "not_needed";
}

export interface TravelPlan {
  steps: PlannedStep[];
  dropped: DroppedStep[];
  /** Sum of the advertised prices of the included steps. */
  projectedAlgo: number;
}

/**
 * The order optional steps are dropped in when the plan overruns the budget.
 * Fixed rather than computed, so the same goal and budget always shed the same
 * steps. Insurance goes first because it is the only step that buys nothing the
 * traveller experiences; the transfer survives longest because arriving with no
 * way to reach the hotel is the worst of the three failures.
 */
export const DROP_ORDER: StepKey[] = [
  "travel_insurance",
  "activity_booking",
  "ground_transfer",
];

function priceOf(providerId: string): number {
  return getProvider(providerId)?.priceAlgo ?? 0;
}

export function buildTravelPlan(
  intent: TravelIntent,
  budgetAlgo: number,
): TravelPlan {
  // Not a travel goal — the caller falls back to the generic pipeline.
  if (intent.confidence === "none") {
    return { steps: [], dropped: [], projectedAlgo: 0 };
  }

  const where = intent.destination ?? "your destination";
  const dropped: DroppedStep[] = [];
  const steps: PlannedStep[] = [];

  const flightLeg = intent.origin ? `${intent.origin} to ${where}` : `to ${where}`;

  if (intent.needsFlight) {
    steps.push({
      key: "flight_search",
      providerId: "flight-search",
      description: `Search flights ${flightLeg}`,
      dependsOnKeys: [],
      optional: false,
    });
    steps.push({
      key: "flight_booking",
      providerId: "flight-booking",
      description: `Book flights ${flightLeg} for ${intent.travelers} traveller${
        intent.travelers === 1 ? "" : "s"
      }`,
      condition: "runs only if a fare within the remaining budget was found",
      dependsOnKeys: ["flight_search"],
      optional: false,
    });
  } else {
    dropped.push({ key: "flight_search", reason: "not_needed" });
    dropped.push({ key: "flight_booking", reason: "not_needed" });
  }

  if (intent.needsHotel) {
    steps.push({
      key: "hotel_search",
      providerId: "hotel-search",
      description: `Search stays in ${where} for ${intent.nights} night${
        intent.nights === 1 ? "" : "s"
      }`,
      dependsOnKeys: [],
      optional: false,
    });
    steps.push({
      key: "hotel_booking",
      providerId: "hotel-booking",
      description: `Book a stay in ${where}`,
      condition: intent.needsFlight
        ? "runs only if the flight was booked and a room is free for those dates"
        : "runs only if a room is free for those dates",
      // Booking a hotel before the flight is confirmed risks paying for a room
      // for a trip that never happens, so the hotel waits on the flight
      // whenever there is one.
      dependsOnKeys: intent.needsFlight
        ? ["hotel_search", "flight_booking"]
        : ["hotel_search"],
      optional: false,
    });
  } else {
    dropped.push({ key: "hotel_search", reason: "not_needed" });
    dropped.push({ key: "hotel_booking", reason: "not_needed" });
  }

  const bookingKeys = steps
    .filter((s) => s.key === "flight_booking" || s.key === "hotel_booking")
    .map((s) => s.key);

  if (intent.needsTransfer) {
    steps.push({
      key: "ground_transfer",
      providerId: "ground-transfer",
      description: `Airport transfer in ${where}`,
      condition: "runs only if the arrival falls outside airport transit hours",
      dependsOnKeys: bookingKeys,
      optional: true,
    });
  } else {
    dropped.push({ key: "ground_transfer", reason: "not_needed" });
  }

  if (intent.needsActivities) {
    steps.push({
      key: "activity_booking",
      providerId: "activity-booking",
      description: `Book things to do in ${where}`,
      condition: `runs only if the stay is ${3}+ nights`,
      dependsOnKeys: bookingKeys.includes("hotel_booking")
        ? ["hotel_booking"]
        : bookingKeys,
      optional: true,
    });
  } else {
    dropped.push({ key: "activity_booking", reason: "not_needed" });
  }

  if (intent.needsInsurance) {
    steps.push({
      key: "travel_insurance",
      providerId: "travel-insurance",
      description: `Travel insurance for ${intent.travelers} traveller${
        intent.travelers === 1 ? "" : "s"
      }`,
      dependsOnKeys: bookingKeys.includes("flight_booking")
        ? ["flight_booking"]
        : bookingKeys,
      optional: true,
    });
  } else {
    dropped.push({ key: "travel_insurance", reason: "not_needed" });
  }

  // The deliverable: the confirmed itinerary, compiled on the laptop provider —
  // the one real network hop in the marketplace.
  steps.push({
    key: "itinerary_summary",
    providerId: "laptop-inference",
    description: `Compile the ${where} itinerary`,
    dependsOnKeys: steps.filter((s) => s.key !== "itinerary_summary").map((s) => s.key),
    optional: false,
  });

  const shaped = shapeToBudget(steps, budgetAlgo, dropped);

  return {
    steps: shaped,
    dropped,
    projectedAlgo: total(shaped),
  };
}

function total(steps: PlannedStep[]): number {
  // Rounded because summing 0.25 + 0.25 + 6 + 4 + 1.5 in binary floating point
  // otherwise produces a trailing 0.0000000000000004 in the trace.
  return Math.round(steps.reduce((sum, s) => sum + priceOf(s.providerId), 0) * 1e6) / 1e6;
}

/**
 * Sheds optional steps, in [DROP_ORDER], until the projected spend fits.
 *
 * Core steps are never dropped. If the core plan alone exceeds the budget the
 * plan still compiles and `quoteStep`'s budget gate stops it mid-flight — which
 * is the honest outcome: the user sees exactly which step it could not afford,
 * rather than a silently truncated trip.
 */
function shapeToBudget(
  steps: PlannedStep[],
  budgetAlgo: number,
  dropped: DroppedStep[],
): PlannedStep[] {
  let kept = [...steps];

  for (const key of DROP_ORDER) {
    if (total(kept) <= budgetAlgo) break;
    if (!kept.some((s) => s.key === key)) continue;
    kept = kept.filter((s) => s.key !== key);
    dropped.push({ key, reason: "budget" });
  }

  // Rewire: nothing may depend on a step that is no longer in the plan, or
  // `dependenciesMet` would wait forever on a step that will never run.
  const present = new Set(kept.map((s) => s.key));
  return kept.map((s) => ({
    ...s,
    dependsOnKeys: s.dependsOnKeys.filter((k) => present.has(k)),
  }));
}
