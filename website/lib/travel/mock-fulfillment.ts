// Deterministic supplier fixtures for the mock travel providers.
//
// Seeded from the provider id and the request input, so the same goal always
// produces the same fare, the same flight number and the same confirmation
// code. That matters for three reasons: the trace is stable enough to
// screenshot, the tests can assert on exact values, and a user re-running a
// goal is not shown a different price for no reason.
//
// Each result leads with a machine-readable VELDAR-META line that the
// orchestrator's condition evaluator reads, followed by the human sentence that
// the app renders in the trace.

import type { Provider } from "../types";
import type { ProviderCallRequest } from "../provider-client";

export const META_PREFIX = "VELDAR-META ";

export interface StepMeta {
  kind: string;
  found: boolean;
  priceAlgo?: number;
  [key: string]: unknown;
}

/** FNV-1a 32-bit. Small, dependency-free, and good enough to spread seeds. */
function hash(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** xorshift32. Deterministic per seed. */
function rng(seed: number): () => number {
  let state = seed || 1;
  return () => {
    state ^= state << 13;
    state >>>= 0;
    state ^= state >> 17;
    state ^= state << 5;
    state >>>= 0;
    return state / 0x100000000;
  };
}

function pick<T>(next: () => number, items: readonly [T, ...T[]]): T {
  return items[Math.floor(next() * items.length) % items.length] ?? items[0];
}

const CARRIERS = ["IX", "AI", "6E", "UK", "QP", "SG"] as const;
const HOTELS = [
  "The Coral Rooms",
  "Marina Court",
  "Old Quarter House",
  "Lantern Bay Hotel",
  "Cedar & Pine",
] as const;
const ACTIVITIES = [
  "a half-day walking tour",
  "a sunset boat trip",
  "a cooking class",
  "a museum pass",
  "a guided hike",
] as const;

function code(next: () => number, length: number): string {
  // No 0/O/1/I: a confirmation code a human may read aloud or retype.
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < length; i++) {
    out += alphabet[Math.floor(next() * alphabet.length) % alphabet.length] ?? "X";
  }
  return out;
}

function render(meta: StepMeta, human: string): string {
  return `${META_PREFIX}${JSON.stringify(meta)}\n${human}`;
}

/** Reads the meta header off a step's output. Null if absent or malformed. */
export function readMeta(output: string | undefined | null): StepMeta | null {
  if (!output) return null;
  const line = output.split("\n", 1)[0];
  if (!line?.startsWith(META_PREFIX)) return null;
  try {
    const parsed = JSON.parse(line.slice(META_PREFIX.length)) as StepMeta;
    return typeof parsed === "object" && parsed !== null ? parsed : null;
  } catch {
    // A provider that returns something unparseable must not take the whole
    // workflow down; the condition evaluator treats null as "no signal".
    return null;
  }
}

/**
 * Produces one provider's result.
 *
 * `remainingBudgetAlgo` lets a search report `found: false` when nothing fits,
 * which is what makes the conditional edges in the plan actually fire rather
 * than every step always running.
 */
export function mockFulfillment(
  provider: Provider,
  req: ProviderCallRequest,
  remainingBudgetAlgo?: number,
): string | null {
  const next = rng(hash(`${provider.id}|${req.input}`));

  switch (provider.id) {
    case "flight-search": {
      // Fares spread across 60-100% of the booking provider's ceiling.
      const fare = round(3.6 + next() * 2.4);
      const carrier = `${pick(next, CARRIERS)}-${100 + Math.floor(next() * 800)}`;
      const departHour = Math.floor(next() * 24);
      const affordable =
        remainingBudgetAlgo === undefined || fare <= remainingBudgetAlgo;

      if (!affordable) {
        return render(
          { kind: "flight_search", found: false, reason: "over_budget", priceAlgo: fare },
          `No fare found within the remaining budget. Cheapest was ${fare} ALGO.`,
        );
      }
      return render(
        { kind: "flight_search", found: true, priceAlgo: fare, carrier, departHour },
        `Found ${carrier} departing ${pad(departHour)}:00 at ${fare} ALGO.`,
      );
    }

    case "flight-booking": {
      const priorFare = readMeta(req.input)?.priceAlgo;
      const fare = round(priorFare ?? 3.6 + next() * 2.4);
      const carrier = (readMeta(req.input)?.carrier as string) ?? `${pick(next, CARRIERS)}-214`;
      const departHour = (readMeta(req.input)?.departHour as number) ?? Math.floor(next() * 24);
      const pnr = `VLD-${code(next, 4)}`;
      return render(
        { kind: "flight_booking", found: true, priceAlgo: fare, pnr, carrier, departHour },
        `Booked ${carrier}, departing ${pad(departHour)}:00. Reference ${pnr}.`,
      );
    }

    case "hotel-search": {
      const nightly = round(0.6 + next() * 0.9);
      const hotel = pick(next, HOTELS);
      const rating = round(3.8 + next() * 1.2, 1);
      const affordable =
        remainingBudgetAlgo === undefined || nightly <= remainingBudgetAlgo;

      if (!affordable) {
        return render(
          { kind: "hotel_search", found: false, reason: "over_budget", priceAlgo: nightly },
          `No room found within the remaining budget. Cheapest was ${nightly} ALGO a night.`,
        );
      }
      return render(
        { kind: "hotel_search", found: true, priceAlgo: nightly, hotel, rating },
        `Found ${hotel}, rated ${rating}, at ${nightly} ALGO a night.`,
      );
    }

    case "hotel-booking": {
      const prior = readMeta(req.input);
      const hotel = (prior?.hotel as string) ?? pick(next, HOTELS);
      const total = round(2.4 + next() * 1.6);
      const ref = `HTL-${code(next, 5)}`;
      return render(
        { kind: "hotel_booking", found: true, priceAlgo: total, hotel, ref },
        `Booked ${hotel} for ${total} ALGO. Reference ${ref}.`,
      );
    }

    case "activity-booking": {
      const activity = pick(next, ACTIVITIES);
      const ref = `ACT-${code(next, 4)}`;
      return render(
        { kind: "activity_booking", found: true, priceAlgo: 1.5, activity, ref },
        `Booked ${activity}. Reference ${ref}.`,
      );
    }

    case "ground-transfer": {
      const ref = `TRF-${code(next, 4)}`;
      const prior = readMeta(req.input);
      const hour = typeof prior?.departHour === "number" ? prior.departHour : 9;
      return render(
        { kind: "ground_transfer", found: true, priceAlgo: 0.75, ref, pickupHour: hour },
        `Airport pickup arranged for ${pad(hour)}:00. Reference ${ref}.`,
      );
    }

    case "travel-insurance": {
      const policy = `POL-${code(next, 6)}`;
      return render(
        { kind: "travel_insurance", found: true, priceAlgo: 0.4, policy },
        `Policy ${policy} issued, covering cancellation and medical.`,
      );
    }

    default:
      // Not a travel provider — the caller keeps its existing behaviour.
      return null;
  }
}

function round(value: number, places = 2): number {
  const f = 10 ** places;
  return Math.round(value * f) / f;
}

function pad(hour: number): string {
  return String(hour).padStart(2, "0");
}
