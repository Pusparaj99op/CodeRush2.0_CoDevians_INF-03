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

export const PROVIDERS: Provider[] = [
  {
    id: "translate-api",
    name: "translate-api.example",
    endpoint: "https://translate-api.example/v1/translate",
    capability: "translation",
    scheme: "exact",
    priceAlgo: 2.5,
    verified: true,
    mock: true,
  },
  {
    id: "fact-check-api",
    name: "fact-check-api.example",
    endpoint: "https://fact-check-api.example/v1/verify",
    capability: "verification",
    scheme: "exact",
    priceAlgo: 1.0,
    verified: true,
    mock: true,
  },
  {
    id: "laptop-inference",
    name: "veldar-laptop-rtx4050",
    // Overridden at runtime by the LAPTOP_SERVER_URL env var once the
    // tunnel (ngrok/Cloudflare Tunnel) to the laptop is live. The path is
    // the laptop-server's paid endpoint; /health sits alongside it.
    endpoint: `${LAPTOP_BASE_URL}/infer`,
    healthEndpoint: `${LAPTOP_BASE_URL}/health`,
    capability: "local-inference",
    scheme: "upto",
    priceAlgo: 3.0,
    verified: false,
    mock: false,
  },
];

export function getProvider(id: string): Provider | undefined {
  return PROVIDERS.find((p) => p.id === id);
}
