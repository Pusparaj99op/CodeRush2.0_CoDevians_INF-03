// Static marketplace seed for the hackathon demo.
//
// In production this would be a discovery service (Doc/specs/02-website.md
// "Service discovery and offer normalization"). For the demo, three
// providers give us both x402 payment schemes described in
// Doc/specs/03-laptop-server.md: two "exact"-priced providers and the
// laptop's local-inference provider on the "upto" scheme.
//
// Only the laptop is a real network hop. The other two point at
// non-resolvable placeholder domains, so they're flagged `mock: true` and
// their work is stubbed locally — better than a fake domain appearing to
// answer a payment request.

import type { Provider } from "./types";

/** Tunnel (ngrok/Cloudflare) to the laptop, or localhost during local dev. */
const LAPTOP_BASE_URL = (process.env.LAPTOP_SERVER_URL ?? "http://localhost:8787").replace(
  /\/$/,
  ""
);

// Travel marketplace. Prices are chosen against TIER_CAPS (free 0.5, pro 5,
// promax unlimited) so each tier produces a visibly different approval
// pattern rather than all three behaving the same:
//
//   - searching is cheap enough to never prompt on any tier
//   - hotel booking at 4.0 prompts on free but not on pro  -> the tier lever
//   - flight booking at 6.0 prompts on free and pro        -> the headline moment
//   - travel insurance is under every cap but `verified: false`, so it prompts
//     on every tier -> exercises the unverified-provider branch independently
//     of price
//
// All of these are `mock: true` placeholder domains, so `probeProvider`
// short-circuits and `callProvider` serves deterministic fixtures from
// lib/travel/mock-fulfillment.ts. Swapping any one for a real supplier is a
// matter of changing `endpoint` and clearing `mock`.
const TRAVEL_PROVIDERS: Provider[] = [
  {
    id: "flight-search",
    name: "skyline-search.example",
    endpoint: "https://skyline-search.example/v1/flights/search",
    capability: "flight-search",
    scheme: "exact",
    priceAlgo: 0.02,
    verified: true,
    mock: true,
  },
  {
    id: "hotel-search",
    name: "roomfinder.example",
    endpoint: "https://roomfinder.example/v1/hotels/search",
    capability: "hotel-search",
    scheme: "exact",
    priceAlgo: 0.02,
    verified: true,
    mock: true,
  },
  {
    id: "flight-booking",
    name: "skyline-booking.example",
    endpoint: "https://skyline-booking.example/v1/flights/book",
    capability: "flight-booking",
    scheme: "upto",
    priceAlgo: 0.2,
    verified: true,
    mock: true,
  },
  {
    id: "hotel-booking",
    name: "roomfinder-booking.example",
    endpoint: "https://roomfinder-booking.example/v1/hotels/book",
    capability: "hotel-booking",
    scheme: "upto",
    priceAlgo: 0.15,
    verified: true,
    mock: true,
  },
  {
    id: "activity-booking",
    name: "localguide.example",
    endpoint: "https://localguide.example/v1/activities/book",
    capability: "activity-booking",
    scheme: "exact",
    priceAlgo: 0.05,
    verified: true,
    mock: true,
  },
  {
    id: "ground-transfer",
    name: "citytransfer.example",
    endpoint: "https://citytransfer.example/v1/transfers/book",
    capability: "ground-transfer",
    scheme: "exact",
    priceAlgo: 0.03,
    verified: true,
    mock: true,
  },
  {
    id: "travel-insurance",
    name: "coverwise.example",
    endpoint: "https://coverwise.example/v1/policies",
    capability: "insurance",
    scheme: "exact",
    priceAlgo: 0.02,
    verified: false,
    mock: true,
  },
];

export const PROVIDERS: Provider[] = [
  ...TRAVEL_PROVIDERS,
  {
    id: "translate-api",
    name: "translate-api.example",
    endpoint: "https://translate-api.example/v1/translate",
    capability: "translation",
    scheme: "exact",
    priceAlgo: 0.1,
    verified: true,
    mock: true,
  },
  {
    id: "fact-check-api",
    name: "fact-check-api.example",
    endpoint: "https://fact-check-api.example/v1/verify",
    capability: "verification",
    scheme: "exact",
    priceAlgo: 0.05,
    verified: true,
    mock: true,
  },
  {
    id: "laptop-inference",
    name: "veldar-laptop-rtx4050",
    endpoint: `${LAPTOP_BASE_URL}/infer`,
    healthEndpoint: `${LAPTOP_BASE_URL}/health`,
    capability: "local-inference",
    scheme: "upto",
    priceAlgo: 0.08,
    verified: false,
    mock: false,
  },
];

export function getProvider(id: string): Provider | undefined {
  return PROVIDERS.find((p) => p.id === id);
}
