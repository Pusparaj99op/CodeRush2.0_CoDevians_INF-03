// Shared marketing content. Single source of truth so the homepage
// teasers and the dedicated pages (/product, /algorand, /pricing, /docs)
// never drift out of sync with each other.

import { CreditCard, GitBranch, UsersThree } from "@phosphor-icons/react/dist/ssr";
import type { Tier } from "./types";
import { TIER_CAPS } from "./types";

export interface Gap {
  id: string;
  icon: typeof CreditCard;
  title: string;
  teaser: string;
  detail: string;
}

export const GAPS: Gap[] = [
  {
    id: "facilitator",
    icon: CreditCard,
    title: "No native pay-per-call HTTP payments",
    teaser:
      "Algorand has no standard x402 facilitator. Veldar built one, so any Algorand contract can serve pay-per-call requests.",
    detail:
      "x402 (docs.x402.org) defines an HTTP-native flow: a client requests a resource, the server replies 402 Payment Required with payment terms, the client pays, and the server verifies and serves the resource once settlement is confirmed. It's a clean fit for Algorand's low fixed fees and fast finality, but no standard implementation exists for the network. Veldar's facilitator (website/lib/facilitator.ts) fills that gap: it verifies a submitted payment payload against a confirmed Algorand TestNet transaction via algosdk, supports both the exact scheme (fixed price per call) and the upto scheme (usage-based, settle actual amount used), and issues an idempotent receipt so a retried request can't double-settle. Any HTTP API, including Veldar's own marketplace providers, can sit behind it and become pay-per-call.",
  },
  {
    id: "orchestrator",
    icon: GitBranch,
    title: "No orchestration layer for agents",
    teaser:
      "Fast contracts alone don't make a workflow trustworthy. Veldar's orchestrator adds budgets, conditions, and approval gates on top.",
    detail:
      "A smart contract can settle a payment instantly, but it has no opinion about whether that payment should happen yet, whether the result it's paying for was actually delivered, or what to do when a step fails halfway through a multi-provider workflow. Veldar's orchestrator (website/lib/orchestrator.ts) is that missing layer: it compiles a goal into a step graph with dependencies and conditions, quotes each step against the live marketplace, checks it against the user's subscription-tier budget cap before ever reserving spend, and opens a human-in-the-loop approval whenever a step exceeds that cap or targets an unverified provider. Every offer, quote, approval, payment, and verification result is written to an append-only ledger, so a workflow can be replayed and audited after the fact, not just trusted in the moment.",
  },
  {
    id: "ux",
    icon: UsersThree,
    title: "No consumer-facing agent UX",
    teaser:
      "algosdk and AlgoKit are built for developers. Veldar is the plain-language layer a non-technical user can actually trust.",
    detail:
      "algosdk and AlgoKit are excellent developer tools, but neither one answers the question a normal user actually has: \"is it safe to let this thing spend my money while I'm not watching?\" Veldar's app and dashboard translate every technical event into something a non-technical person can act on: a plain-language approval card instead of a raw transaction payload, a running spend total against a visible budget instead of a wallet balance, and a full replayable trace instead of a block explorer link. The wallet and the contract stay exactly where they belong, underneath the interface, not in front of it.",
  },
];

export interface TierContent {
  tier: Tier;
  name: string;
  price: string;
  features: string[];
  featured: boolean;
}

export const TIERS: TierContent[] = [
  {
    tier: "free",
    name: "Free",
    price: "$0",
    features: ["Every payment needs approval", "Full trace and history", "Cancel anytime"],
    featured: false,
  },
  {
    tier: "pro",
    name: "Pro",
    price: "$12/mo",
    features: ["Approval only above cap", "New-provider approvals", "Priority workflow queue"],
    featured: true,
  },
  {
    tier: "promax",
    name: "ProMax",
    price: "$39/mo",
    features: ["Approval only on policy exceptions", "Unlimited concurrent workflows", "Flat monthly fee"],
    featured: false,
  },
];

export function tierCapLabel(tier: Tier): string {
  const cap = TIER_CAPS[tier].perTxnCapAlgo;
  return cap === null ? "No per-step cap" : `${cap} ALGO cap per step`;
}

export function tierCutLabel(tier: Tier): string {
  const bps = TIER_CAPS[tier].platformCutBps;
  return bps === 0 ? "No platform cut" : `${(bps / 100).toFixed(1)}% cut per transaction`;
}

export interface ComparisonRow {
  label: string;
  free: string;
  pro: string;
  promax: string;
}

export const COMPARISON_ROWS: ComparisonRow[] = [
  { label: "Per-step spend cap", free: "0.5 ALGO", pro: "5 ALGO", promax: "Unlimited" },
  { label: "Platform cut per transaction", free: "2.5%", pro: "1%", promax: "0%" },
  { label: "Approval required", free: "Every payment", pro: "Above cap or new provider", promax: "Policy exceptions only" },
  { label: "Concurrent workflows", free: "1", pro: "5", promax: "Unlimited" },
  { label: "Full trace and history", free: "Yes", pro: "Yes", promax: "Yes" },
  { label: "Priority workflow queue", free: "No", pro: "Yes", promax: "Yes" },
];

export interface FaqItem {
  question: string;
  answer: string;
}

export const PRICING_FAQ: FaqItem[] = [
  {
    question: "What happens when a step goes over budget?",
    answer:
      "The workflow pauses and opens an approval request instead of paying. Nothing is spent until you approve it, on any tier.",
  },
  {
    question: "Is this real money?",
    answer:
      "No. Every payment in this build settles on Algorand TestNet, per the hackathon's safety boundaries. No real funds, no production wallets.",
  },
  {
    question: "Can I cancel a workflow midway?",
    answer:
      "Yes, from the dashboard or the app, at any point. The ledger records exactly what was delivered and what wasn't purchased when you cancel.",
  },
  {
    question: "What's the difference between the free tier's cut and Pro's flat fee?",
    answer:
      "Free takes a small percentage of each settled payment. Pro reduces that cut. ProMax replaces it entirely with a flat monthly fee and no per-transaction cut.",
  },
];

export interface WorkflowStep {
  title: string;
  body: string;
}

export const WORKFLOW_LIFECYCLE: WorkflowStep[] = [
  {
    title: "Compile",
    body: "A goal and budget become a step graph: providers, dependencies, and conditions for what can be skipped.",
  },
  {
    title: "Quote",
    body: "Each runnable step is quoted against the live marketplace and checked against the workflow's remaining budget.",
  },
  {
    title: "Approve",
    body: "Steps within the tier's cap proceed automatically. Anything above it, or any unverified provider, opens a human approval.",
  },
  {
    title: "Pay",
    body: "Once cleared, the client submits an Algorand TestNet transaction and the payment payload goes to the facilitator.",
  },
  {
    title: "Verify",
    body: "The facilitator confirms the transaction on-chain via algosdk before the step is allowed to count as paid.",
  },
  {
    title: "Settle",
    body: "An idempotent receipt is issued and written to the ledger, alongside every offer, quote, and approval that led to it.",
  },
];

export interface ApiEndpoint {
  method: string;
  path: string;
  purpose: string;
}

export const API_ENDPOINTS: ApiEndpoint[] = [
  { method: "POST", path: "/api/workflows", purpose: "Submit a goal and budget, get back a compiled workflow." },
  { method: "GET", path: "/api/workflows?userId=", purpose: "List a user's workflows, newest first." },
  { method: "GET", path: "/api/workflows/:id", purpose: "Workflow status, step graph, recent ledger events." },
  { method: "GET", path: "/api/workflows/:id/trace", purpose: "Full replayable trace for the workflow." },
  { method: "POST", path: "/api/workflows/:id/approve", purpose: "Approve or deny a pending step." },
  { method: "POST", path: "/api/workflows/:id/cancel", purpose: "Cancel a running workflow." },
  { method: "POST", path: "/api/facilitator/verify", purpose: "Verify a payment payload against declared terms." },
  { method: "POST", path: "/api/facilitator/settle", purpose: "Confirm settlement and issue a receipt." },
  { method: "GET", path: "/api/providers", purpose: "List marketplace providers and their pricing scheme." },
];
