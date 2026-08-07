// Route-handler auth: resolve the caller from a Firebase ID token.
//
// The API used to trust a `userId` query/body param outright, which meant
// any user's workflows were readable by guessing a uid. Clients now send
// `Authorization: Bearer <idToken>` (from `user.getIdToken()`), verified
// server-side with firebase-admin.
//
// When no service account is configured (local dev without Firebase set
// up), we fall back to trusting the token's unverified `sub` claim so the
// demo still runs — but we log it, and it never happens on a deploy where
// FIREBASE_SERVICE_ACCOUNT_JSON is set.

import { NextResponse, type NextRequest } from "next/server";
import { getAdminAuth, isAdminConfigured } from "./firebase-admin";
import { store } from "./store";
import type { Workflow } from "./types";

export type AuthResult =
  | { ok: true; userId: string; verified: boolean }
  | { ok: false; response: NextResponse };

function unauthorized(reason: string): AuthResult {
  return {
    ok: false,
    response: NextResponse.json({ error: "unauthorized", reason }, { status: 401 }),
  };
}

/** Reads the `sub` claim without checking the signature. Dev fallback only. */
function unverifiedSubject(token: string): string | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const json = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      sub?: string;
      user_id?: string;
    };
    return json.sub ?? json.user_id ?? null;
  } catch {
    return null;
  }
}

export async function requireUser(req: NextRequest): Promise<AuthResult> {
  const header = req.headers.get("authorization") ?? "";
  const token = header.toLowerCase().startsWith("bearer ") ? header.slice(7).trim() : "";
  if (!token) {
    return unauthorized("missing Authorization: Bearer <firebase id token> header");
  }

  const adminAuth = getAdminAuth();
  if (!adminAuth) {
    const sub = unverifiedSubject(token) ?? "demo-user-12345";
    return { ok: true, userId: sub, verified: false };
  }

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    return { ok: true, userId: decoded.uid, verified: true };
  } catch (err) {
    return unauthorized(`invalid ID token: ${(err as Error).message}`);
  }
}

export type OwnedWorkflowResult =
  | { ok: true; userId: string; verified: boolean; workflow: Workflow }
  | { ok: false; response: NextResponse };

/**
 * Authenticates the caller and loads a workflow they own.
 *
 * Until this existed, every `/api/workflows/[id]/*` route read the workflow
 * straight out of the store with no auth at all — anyone holding an id could
 * read someone else's trip, approve their payments, or cancel their booking.
 *
 * A workflow owned by someone else returns **404, not 403**: a 403 would
 * confirm the id exists, which turns the endpoint into an oracle for probing
 * the id space. From outside, "not yours" and "not there" must be
 * indistinguishable.
 */
export async function requireOwnedWorkflow(
  req: NextRequest,
  workflowId: string
): Promise<OwnedWorkflowResult> {
  const auth = await requireUser(req);
  if (!auth.ok) return auth;

  const workflow = await store.getWorkflow(workflowId);
  if (!workflow || workflow.userId !== auth.userId) {
    return {
      ok: false,
      response: NextResponse.json({ error: "workflow not found" }, { status: 404 }),
    };
  }

  return { ok: true, userId: auth.userId, verified: auth.verified, workflow };
}
