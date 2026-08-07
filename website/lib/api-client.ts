"use client";

// Browser-side helper for calling the Veldar API with a Firebase ID token.
// The API no longer accepts a `userId` param — it derives the caller from
// this token (lib/api-auth.ts).

import { getFirebaseAuth } from "./firebase";

export async function authedFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const auth = getFirebaseAuth();
  const token = await auth?.currentUser?.getIdToken();

  const headers = new Headers(init.headers);
  if (token) headers.set("authorization", `Bearer ${token}`);
  if (init.body && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }

  return fetch(input, { ...init, headers });
}
