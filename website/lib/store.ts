// In-memory ledger store for the hackathon build.
//
// Doc/specs/02-website.md calls for Firestore as the persistence layer
// (`ledger/{workflowId}/events`). This module keeps the same shape —
// workflows, approvals, receipts, append-only ledger events — behind a
// small interface so it's a drop-in swap for a Firestore-backed
// implementation later without touching the route handlers.

import type { Approval, LedgerEvent, Receipt, Workflow } from "./types";

class VeldarStore {
  workflows = new Map<string, Workflow>();
  approvals = new Map<string, Approval>();
  receipts = new Map<string, Receipt>();
  ledger = new Map<string, LedgerEvent[]>(); // workflowId -> events, append-only

  appendLedgerEvent(event: LedgerEvent): void {
    const events = this.ledger.get(event.workflowId) ?? [];
    events.push(event);
    this.ledger.set(event.workflowId, events);
  }

  getTrace(workflowId: string): LedgerEvent[] {
    return this.ledger.get(workflowId) ?? [];
  }
}

// A hot-reloaded dev server would otherwise create a fresh store per
// request; stash the singleton on globalThis to survive Next.js dev reloads.
const globalForStore = globalThis as unknown as { veldarStore?: VeldarStore };

export const store = globalForStore.veldarStore ?? new VeldarStore();
globalForStore.veldarStore = store;
