// Static marketplace seed for the hackathon demo.
//
// In production this would be a discovery service (Doc/specs/02-website.md
// "Service discovery and offer normalization"). For the demo, three
// providers give us both x402 payment schemes described in
// Doc/specs/03-laptop-server.md: two "exact"-priced providers and the
// laptop's local-inference provider on the "upto" scheme.

import type { Provider } from "./types";

export const PROVIDERS: Provider[] = [
  {
    id: "translate-api",
    name: "translate-api.example",
    endpoint: "https://translate-api.example/v1/translate",
    capability: "translation",
    scheme: "exact",
    priceAlgo: 2.5,
    verified: true,
  },
  {
    id: "fact-check-api",
    name: "fact-check-api.example",
    endpoint: "https://fact-check-api.example/v1/verify",
    capability: "verification",
    scheme: "exact",
    priceAlgo: 1.0,
    verified: true,
  },
  {
    id: "laptop-inference",
    name: "veldar-laptop-rtx4050",
    // Overridden at runtime by the LAPTOP_SERVER_URL env var once the
    // tunnel (ngrok/Cloudflare Tunnel) to the laptop is live.
    endpoint: process.env.LAPTOP_SERVER_URL ?? "http://localhost:8787",
    capability: "local-inference",
    scheme: "upto",
    priceAlgo: 3.0,
    verified: false,
  },
];

export function getProvider(id: string): Provider | undefined {
  return PROVIDERS.find((p) => p.id === id);
}
