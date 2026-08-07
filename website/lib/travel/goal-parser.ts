// Turns a plain-language travel goal into a structured intent.
//
// Deliberately rule-based rather than LLM-backed. The orchestrator is the
// audit surface for money the agent is about to spend, so the step it compiles
// has to be reproducible: the same goal must always produce the same plan, and
// a reviewer must be able to point at the rule that produced each field. An LLM
// planner would also add a network dependency and a cost to the one path that
// must never stall.
//
// Every rule is an exported constant so the tests target it by name rather than
// re-encoding the regex.

export interface TravelIntent {
  rawGoal: string;
  destination: string | null;
  origin: string | null;
  /** YYYY-MM-DD, UTC. */
  startDate: string | null;
  endDate: string | null;
  nights: number;
  travelers: number;
  needsFlight: boolean;
  needsHotel: boolean;
  needsActivities: boolean;
  needsTransfer: boolean;
  needsInsurance: boolean;
  /**
   * `none` means this does not read as a travel goal at all, and the caller
   * should fall back to the generic pipeline rather than compile a trip.
   */
  confidence: "high" | "low" | "none";
}

export interface ParseOptions {
  /** Injected clock. Relative dates ("next weekend") resolve against this. */
  now?: Date;
}

/** Nights assumed when the goal gives no duration and no date range. */
export const DEFAULT_NIGHTS = 3;

/** A stay this long or longer is assumed to want something to do. */
export const ACTIVITIES_NIGHT_THRESHOLD = 3;

// Stop words that end a place name. Without these, "Goa for 5 days" yields a
// destination of "goa for 5 days".
const PLACE_STOP =
  "(?=\\s+(?:from|for|on|with|under|next|this|in|between|and|budget|around|about|over|by|during|starting|leaving|departing|to)\\b|[,.!?]|$)";

// The negative lookahead stops the bare `to` in "I want to visit New Delhi"
// from capturing "visit new delhi" — regex alternation matches at the earliest
// position, so the `to` inside "want to" wins over the later `visit`.
const NOT_A_PLACE = "(?!(?:visit|see|go|fly|travel|book|get|find|plan|spend)\\b)";

export const DESTINATION_RE = new RegExp(
  `\\b(?:trip to|travel to|holiday in|vacation in|visiting|visit|going to|fly to|to|in)\\s+${NOT_A_PLACE}([a-z][a-z .'-]{1,40}?)${PLACE_STOP}`,
);

export const ORIGIN_RE = new RegExp(
  `\\b(?:from|departing|leaving)\\s+([a-z][a-z .'-]{1,40}?)${PLACE_STOP}`,
);

export const ISO_DATE_RE = /\b(\d{4})-(\d{2})-(\d{2})\b/;
export const DAY_MONTH_RE =
  /\b(\d{1,2})(?:st|nd|rd|th)?\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\b/;
export const MONTH_DAY_RE =
  /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{1,2})(?:st|nd|rd|th)?\b/;
export const MONTH_ONLY_RE =
  /\b(?:in|during|for)\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\b/;

export const DURATION_RE = /\b(\d+)\s*(night|day|week)s?\b/;
export const TRAVELERS_RE =
  /\b(\d+)\s*(?:people|persons?|adults?|travell?ers?|pax|guests?|of us)\b/;

export const NO_FLIGHT_RE =
  /\b(?:by (?:train|car|road|bus)|road ?trip|driving|already (?:have|booked) (?:my |our )?flights?|flights? (?:are )?(?:booked|sorted)|no flights?)\b/;
export const NO_HOTEL_RE =
  /\b(?:staying with|no hotel|airbnb (?:is )?booked|accommodation (?:is )?(?:sorted|booked)|hostel booked|stay(?:ing)? at (?:my|a) friend)\b/;
export const ACTIVITIES_RE =
  /\b(?:activit\w*|tours?|sightsee\w*|museums?|excursions?|things to do|diving|hiking|trek\w*|safari|shows?|tickets?|experiences?)\b/;
export const TRANSFER_RE =
  /\b(?:airport transfers?|pick ?ups?|cabs?|taxis?|car service|transfers?|chauffeur)\b/;
export const INSURANCE_RE = /\b(?:insurance|insured|coverage|cover)\b/;

const MONTHS = [
  "jan",
  "feb",
  "mar",
  "apr",
  "may",
  "jun",
  "jul",
  "aug",
  "sep",
  "oct",
  "nov",
  "dec",
];

const MS_PER_DAY = 86_400_000;

function normalize(goal: string): string {
  return goal.toLowerCase().replace(/\s+/g, " ").trim();
}

function toIso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function utc(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month, day));
}

function titleCase(raw: string): string {
  return raw
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/**
 * Resolves a bare month/day to a date. If that date has already passed this
 * year the next occurrence is assumed — "5 days in March" said in June means
 * next March, not a trip four months into the past.
 */
function nextOccurrence(now: Date, month: number, day: number): Date {
  const thisYear = utc(now.getUTCFullYear(), month, day);
  if (thisYear.getTime() >= startOfDay(now).getTime()) return thisYear;
  return utc(now.getUTCFullYear() + 1, month, day);
}

function startOfDay(d: Date): Date {
  return utc(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

/** Extracts a start date, or null. Exported for direct testing. */
export function parseStartDate(text: string, now: Date): string | null {
  const iso = ISO_DATE_RE.exec(text);
  if (iso) {
    return toIso(utc(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3])));
  }

  const dayMonth = DAY_MONTH_RE.exec(text);
  if (dayMonth) {
    const day = Number(dayMonth[1]);
    const month = MONTHS.indexOf(dayMonth[2] ?? "");
    if (month >= 0 && day >= 1 && day <= 31) {
      return toIso(nextOccurrence(now, month, day));
    }
  }

  const monthDay = MONTH_DAY_RE.exec(text);
  if (monthDay) {
    const month = MONTHS.indexOf(monthDay[1] ?? "");
    const day = Number(monthDay[2]);
    if (month >= 0 && day >= 1 && day <= 31) {
      return toIso(nextOccurrence(now, month, day));
    }
  }

  const today = startOfDay(now);

  if (/\btomorrow\b/.test(text)) {
    return toIso(new Date(today.getTime() + MS_PER_DAY));
  }
  if (/\bnext weekend\b/.test(text)) {
    // The Saturday of next week. getUTCDay(): 0 = Sunday, 6 = Saturday.
    const daysUntilSaturday = (6 - today.getUTCDay() + 7) % 7 || 7;
    return toIso(new Date(today.getTime() + (daysUntilSaturday + 7) * MS_PER_DAY));
  }
  if (/\bthis weekend\b/.test(text)) {
    const daysUntilSaturday = (6 - today.getUTCDay() + 7) % 7;
    return toIso(new Date(today.getTime() + daysUntilSaturday * MS_PER_DAY));
  }
  if (/\bnext week\b/.test(text)) {
    return toIso(new Date(today.getTime() + 7 * MS_PER_DAY));
  }
  if (/\bnext month\b/.test(text)) {
    return toIso(utc(today.getUTCFullYear(), today.getUTCMonth() + 1, 1));
  }

  // "in March" with no day — assume the first of that month.
  const monthOnly = MONTH_ONLY_RE.exec(text);
  if (monthOnly) {
    const month = MONTHS.indexOf(monthOnly[1] ?? "");
    if (month >= 0) return toIso(nextOccurrence(now, month, 1));
  }

  return null;
}

/** Number of travellers. Exported for direct testing. */
export function parseTravelers(text: string): number {
  const explicit = TRAVELERS_RE.exec(text);
  if (explicit) {
    const n = Number(explicit[1]);
    // Above ~12 this stops being a trip and starts being a charter; cap it so
    // a typo cannot inflate the plan.
    if (n >= 1 && n <= 12) return n;
  }
  if (/\b(?:solo|alone|by myself|just me)\b/.test(text)) return 1;
  if (
    /\b(?:couple|honeymoon|romantic|me and my (?:wife|husband|partner|girlfriend|boyfriend)|two of us)\b/.test(
      text,
    )
  ) {
    return 2;
  }
  if (/\bfamily\b/.test(text)) return 4;
  return 1;
}

export function parseTravelGoal(goal: string, opts: ParseOptions = {}): TravelIntent {
  const now = opts.now ?? new Date();
  const text = normalize(goal);

  const destinationMatch = DESTINATION_RE.exec(text);
  const destination = destinationMatch?.[1] ? titleCase(destinationMatch[1]) : null;

  const originMatch = ORIGIN_RE.exec(text);
  const origin = originMatch?.[1] ? titleCase(originMatch[1]) : null;

  const startDate = parseStartDate(text, now);

  const duration = DURATION_RE.exec(text);
  let nights = DEFAULT_NIGHTS;
  let hasExplicitDuration = false;
  if (duration) {
    const value = Number(duration[1]);
    const unit = duration[2];
    if (value >= 1 && value <= 90) {
      hasExplicitDuration = true;
      // "5 days" is 4 nights; "5 nights" is 5. Getting this wrong shifts the
      // hotel booking by a night, which is a real cost.
      nights =
        unit === "week" ? value * 7 : unit === "day" ? Math.max(1, value - 1) : value;
    }
  }

  // A second date in the goal is the return; the range wins over any duration
  // phrase, since it is the more specific statement.
  let endDate: string | null = null;
  if (startDate) {
    const remainder = text.slice(text.indexOf(startDate.slice(5)) + 1);
    const second = parseStartDate(remainder, now);
    if (second && second > startDate) {
      endDate = second;
      nights = Math.round(
        (Date.parse(second) - Date.parse(startDate)) / MS_PER_DAY,
      );
      hasExplicitDuration = true;
    } else {
      endDate = toIso(new Date(Date.parse(startDate) + nights * MS_PER_DAY));
    }
  }

  const travelers = parseTravelers(text);

  // Flights and a hotel are the default assumption for a trip; the negations
  // are what remove them. Erring the other way would mean a goal that just
  // says "a week in Bali" compiles to nothing bookable.
  const needsFlight = !NO_FLIGHT_RE.test(text);
  const needsHotel = !NO_HOTEL_RE.test(text);
  const needsActivities =
    ACTIVITIES_RE.test(text) || nights >= ACTIVITIES_NIGHT_THRESHOLD;
  const needsTransfer =
    TRANSFER_RE.test(text) || (needsFlight && needsHotel && travelers >= 2);
  // Never inferred. Adding paid insurance nobody asked for is the kind of
  // quiet upsell this product exists to make impossible.
  const needsInsurance = INSURANCE_RE.test(text);

  const confidence: TravelIntent["confidence"] = !destination
    ? "none"
    : !startDate && !hasExplicitDuration
      ? "low"
      : "high";

  return {
    rawGoal: goal,
    destination,
    origin,
    startDate,
    endDate,
    nights,
    travelers,
    needsFlight,
    needsHotel,
    needsActivities,
    needsTransfer,
    needsInsurance,
    confidence,
  };
}

/** Short human summary, used in step descriptions and the trace. */
export function describeIntent(intent: TravelIntent): string {
  const parts: string[] = [];
  if (intent.destination) parts.push(intent.destination);
  if (intent.origin) parts.push(`from ${intent.origin}`);
  if (intent.startDate) parts.push(`on ${intent.startDate}`);
  parts.push(`${intent.nights} night${intent.nights === 1 ? "" : "s"}`);
  parts.push(`${intent.travelers} traveller${intent.travelers === 1 ? "" : "s"}`);
  return parts.join(", ");
}
