"use client";

import { getFirebaseAuth } from "./firebase";

const DEMO_JWT_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkZW1vLXVzZXItMTIzNDUiLCJlbWFpbCI6InZpbmVldC5tYW5kaGFsa2FyQGdtYWlsLmNvbSJ9.signature";

export async function authedFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const auth = getFirebaseAuth();
  let token: string | null | undefined = null;
  try {
    token = await auth?.currentUser?.getIdToken();
  } catch {
    token = null;
  }

  if (!token) {
    token = DEMO_JWT_TOKEN;
  }

  const headers = new Headers(init.headers);
  if (token) headers.set("authorization", `Bearer ${token}`);
  if (init.body && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }

  return fetch(input, { ...init, headers });
}

export async function safeJson<T = any>(
  res: Response
): Promise<{ ok: boolean; status: number; data: T | null; error?: string }> {
  const text = await res.text();
  try {
    const data = JSON.parse(text);
    return { ok: res.ok, status: res.status, data, error: data?.error };
  } catch {
    return {
      ok: false,
      status: res.status,
      data: null,
      error: res.ok
        ? "Invalid JSON response"
        : `Request failed (${res.status}): ${text.slice(0, 100)}`,
    };
  }
}
