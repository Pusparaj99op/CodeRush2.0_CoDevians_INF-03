// Picks the persistence backend once, at module load.
//
// Firestore when a service account is configured; otherwise the in-memory
// store, with a warning — running keyless on Vercel means workflows will
// appear to vanish between requests, and that should never be a surprise.

import { getAdminFirestore } from "../firebase-admin";
import { memoryStore } from "./memory";
import { FirestoreStore } from "./firestore";
import type { VeldarStore } from "./types";

function selectStore(): VeldarStore {
  const db = getAdminFirestore();
  if (db) return new FirestoreStore(db);

  if (process.env.VERCEL) {
    console.warn(
      "[veldar] FIREBASE_SERVICE_ACCOUNT_JSON is not set — falling back to the in-memory store. " +
        "On Vercel this means workflows will not survive between requests."
    );
  }
  return memoryStore;
}

export const store: VeldarStore = selectStore();
export type { VeldarStore } from "./types";
