// Firestore-backed store. Used whenever a Firebase service account is
// configured, which is what makes the live Vercel deployment work — the
// in-memory store loses everything between serverless instances.
//
// Layout (Doc/specs/02-website.md):
//   workflows/{workflowId}                 steps embedded on the document
//   workflows/{workflowId}/ledger/{eventId}  append-only trace
//   approvals/{approvalId}
//   receipts/{receiptId}

import type { Firestore } from "firebase-admin/firestore";
import type { Approval, LedgerEvent, Receipt, Workflow } from "../types";
import type { VeldarStore } from "./types";

const WORKFLOWS = "workflows";
const LEDGER = "ledger";
const APPROVALS = "approvals";
const RECEIPTS = "receipts";

export class FirestoreStore implements VeldarStore {
  readonly backend = "firestore" as const;

  constructor(private readonly db: Firestore) {}

  async getWorkflow(id: string): Promise<Workflow | null> {
    const snap = await this.db.collection(WORKFLOWS).doc(id).get();
    return snap.exists ? (snap.data() as Workflow) : null;
  }

  async saveWorkflow(workflow: Workflow): Promise<void> {
    await this.db.collection(WORKFLOWS).doc(workflow.id).set(workflow);
  }

  async listWorkflowsByUser(userId: string): Promise<Workflow[]> {
    // Ordered in memory rather than with orderBy() so this doesn't require
    // a composite index to be created before the dashboard works.
    const snap = await this.db.collection(WORKFLOWS).where("userId", "==", userId).get();
    return snap.docs
      .map((d) => d.data() as Workflow)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async getApproval(id: string): Promise<Approval | null> {
    const snap = await this.db.collection(APPROVALS).doc(id).get();
    return snap.exists ? (snap.data() as Approval) : null;
  }

  async saveApproval(approval: Approval): Promise<void> {
    await this.db.collection(APPROVALS).doc(approval.id).set(approval);
  }

  async saveReceipt(receipt: Receipt): Promise<void> {
    await this.db.collection(RECEIPTS).doc(receipt.id).set(receipt);
  }

  async findReceiptByStepAndTxn(stepId: string, txnHash: string): Promise<Receipt | null> {
    const snap = await this.db
      .collection(RECEIPTS)
      .where("stepId", "==", stepId)
      .where("txnHash", "==", txnHash)
      .limit(1)
      .get();
    const doc = snap.docs[0];
    return doc ? (doc.data() as Receipt) : null;
  }

  async appendLedgerEvent(event: LedgerEvent): Promise<void> {
    await this.db
      .collection(WORKFLOWS)
      .doc(event.workflowId)
      .collection(LEDGER)
      .doc(event.id)
      .set(event);
  }

  async getTrace(workflowId: string): Promise<LedgerEvent[]> {
    const snap = await this.db
      .collection(WORKFLOWS)
      .doc(workflowId)
      .collection(LEDGER)
      .orderBy("at")
      .get();
    return snap.docs.map((d) => d.data() as LedgerEvent);
  }
}
