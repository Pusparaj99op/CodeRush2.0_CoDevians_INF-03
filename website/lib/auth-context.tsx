"use client";

// Google Sign-In via Firebase Auth, shared across the website. Matches the
// App's Google OAuth flow (Doc/specs/01-app.md) so a user's session maps
// to the same Firebase user record regardless of client.
//
// Popup sign-in fails in a few common, non-code situations: the deployed
// domain isn't in Firebase's Authorized domains list (auth/unauthorized-domain),
// the browser blocks the popup, or third-party cookies are disabled (common
// on iOS Safari / in-app browsers). We surface the real error message and
// fall back to a full-page redirect when the popup itself is the problem.

import {
  GoogleAuthProvider,
  getRedirectResult,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import { createContext, useContext, useEffect, useState } from "react";
import { getFirebaseAuth, isFirebaseConfigured } from "./firebase";

const POPUP_FALLBACK_CODES = new Set([
  "auth/popup-blocked",
  "auth/popup-closed-by-user",
  "auth/cancelled-popup-request",
  "auth/operation-not-supported-in-this-environment",
]);

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  configured: boolean;
  authError: string | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function describeAuthError(code: string): string {
  switch (code) {
    case "auth/unauthorized-domain":
      return "This domain isn't authorized for sign-in yet. Add it under Firebase console > Authentication > Settings > Authorized domains.";
    case "auth/popup-closed-by-user":
      return "Sign-in window was closed before finishing.";
    case "auth/network-request-failed":
      return "Network error while signing in. Check your connection and try again.";
    default:
      return `Sign-in failed (${code}). Try again.`;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) {
      setLoading(false);
      return;
    }

    getRedirectResult(auth).catch((err) => {
      const code = (err as { code?: string }).code ?? "auth/unknown-error";
      setAuthError(describeAuthError(code));
    });

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  async function signInWithGoogle() {
    const auth = getFirebaseAuth();
    if (!auth) {
      setAuthError("Firebase isn't configured. Set the NEXT_PUBLIC_FIREBASE_* env vars.");
      return;
    }
    setAuthError(null);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      const code = (err as { code?: string }).code ?? "auth/unknown-error";
      if (POPUP_FALLBACK_CODES.has(code)) {
        await signInWithRedirect(auth, provider);
        return;
      }
      setAuthError(describeAuthError(code));
    }
  }

  async function signOut() {
    const auth = getFirebaseAuth();
    if (!auth) return;
    await firebaseSignOut(auth);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        configured: isFirebaseConfigured,
        authError,
        signInWithGoogle,
        signOut,
        clearAuthError: () => setAuthError(null),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
