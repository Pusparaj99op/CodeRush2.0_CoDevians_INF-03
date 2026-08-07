// Server-side Firebase Admin: Firestore persistence + ID token verification.
//
// Client-side Firebase (lib/firebase.ts) can't do either of these — it has
// no privileged credentials and can't verify a token's signature. Admin
// needs a service account, supplied as JSON in FIREBASE_SERVICE_ACCOUNT_JSON
// (paste the whole downloaded key; on Vercel, set it as a single-line env
// var). Without it, the app degrades to the in-memory store and to
// unverified auth — both loudly flagged rather than silently assumed.

import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

interface ServiceAccount {
  project_id: string;
  client_email: string;
  private_key: string;
}

function readServiceAccount(): ServiceAccount | null {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as ServiceAccount;
    if (!parsed.project_id || !parsed.client_email || !parsed.private_key) return null;
    return {
      ...parsed,
      // Env vars flatten newlines; the PEM body needs them back.
      private_key: parsed.private_key.replace(/\\n/g, "\n"),
    };
  } catch {
    console.warn("FIREBASE_SERVICE_ACCOUNT_JSON is set but is not valid JSON — ignoring it.");
    return null;
  }
}

const serviceAccount = readServiceAccount();

export const isAdminConfigured = serviceAccount !== null;

let app: App | null = null;

function getAdminApp(): App | null {
  if (!serviceAccount) return null;
  if (!app) {
    app =
      getApps()[0] ??
      initializeApp({
        credential: cert({
          projectId: serviceAccount.project_id,
          clientEmail: serviceAccount.client_email,
          privateKey: serviceAccount.private_key,
        }),
      });
  }
  return app;
}

let firestore: Firestore | null = null;

export function getAdminFirestore(): Firestore | null {
  const adminApp = getAdminApp();
  if (!adminApp) return null;
  if (!firestore) {
    firestore = getFirestore(adminApp);
    // Workflow steps are plain objects; undefined fields would otherwise throw.
    firestore.settings({ ignoreUndefinedProperties: true });
  }
  return firestore;
}

let adminAuth: Auth | null = null;

export function getAdminAuth(): Auth | null {
  const adminApp = getAdminApp();
  if (!adminApp) return null;
  if (!adminAuth) {
    adminAuth = getAuth(adminApp);
  }
  return adminAuth;
}
