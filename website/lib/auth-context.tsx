"use client";

// Firebase Auth for the website: Google Sign-In plus email/password.
// The Google flow matches the App's (Doc/specs/01-app.md) so a user's
// session maps to the same Firebase user record regardless of client.
//
// Popup sign-in fails in a few common, non-code situations: the deployed
// domain isn't in Firebase's Authorized domains list (auth/unauthorized-domain),
// the browser blocks the popup, or third-party cookies are disabled (common
// on iOS Safari / in-app browsers). We surface the real error message and
// fall back to a full-page redirect when the popup itself is the problem.

import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  getRedirectResult,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut as firebaseSignOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getFirebaseAuth, isFirebaseConfigured } from "./firebase";

// Codes where the popup transport itself is at fault, so retrying the same
// sign-in as a full-page redirect is worth doing.
//
// auth/internal-error belongs here: it's the SDK's catch-all when the popup or
// its cross-origin __/auth/iframe can't complete the handshake — most often
// because the browser partitions or blocks third-party storage for
// firebaseapp.com (Chrome's third-party-cookie phase-out, Safari ITP, in-app
// webviews). The redirect flow is same-tab and doesn't need that iframe.
const POPUP_FALLBACK_CODES = new Set([
  "auth/popup-blocked",
  "auth/popup-closed-by-user",
  "auth/cancelled-popup-request",
  "auth/operation-not-supported-in-this-environment",
  "auth/internal-error",
  "auth/web-storage-unsupported",
  "auth/timeout",
]);

/**
 * Firebase hides the real cause of opaque codes (`auth/internal-error` above
 * all) inside `message` and `customData`. Log the whole thing so a failure is
 * diagnosable from the browser console instead of just a code.
 */
function logAuthError(stage: string, err: unknown) {
  const e = err as {
    code?: string;
    message?: string;
    customData?: Record<string, unknown>;
  };
  console.error(`[auth] ${stage} failed`, {
    code: e.code,
    message: e.message,
    customData: e.customData,
    // Raw Identity Toolkit response, when there was one.
    tokenResponse: (e.customData as { _tokenResponse?: unknown } | undefined)?._tokenResponse,
    origin: typeof window !== "undefined" ? window.location.origin : null,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    cookiesEnabled: typeof navigator !== "undefined" ? navigator.cookieEnabled : null,
    raw: err,
  });
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  configured: boolean;
  authError: string | null;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<boolean>;
  signUpWithEmail: (email: string, password: string, displayName?: string) => Promise<boolean>;
  sendPasswordReset: (email: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  /** Firebase ID token for authenticating API calls, or null when signed out. */
  getIdToken: () => Promise<string | null>;
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
    case "auth/email-already-in-use":
      return "An account already exists with that email. Try signing in instead.";
    case "auth/weak-password":
      return "Password is too weak — use at least 6 characters.";
    case "auth/invalid-email":
      return "That doesn't look like a valid email address.";
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Email or password is incorrect.";
    case "auth/too-many-requests":
      return "Too many attempts. Wait a moment and try again.";
    case "auth/operation-not-allowed":
      return "Email/password sign-in isn't enabled for this Firebase project yet. Enable it under Authentication > Sign-in method.";
    case "auth/account-exists-with-different-credential":
      return "An account with this email already exists using a different sign-in method. Sign in that way first, then link Google.";
    case "auth/user-disabled":
      return "This account has been disabled.";
    case "auth/web-storage-unsupported":
    case "auth/internal-error":
      return "Your browser blocked the sign-in window (this usually means third-party cookies are off). Redirecting you to Google instead — if that also fails, try a different browser or allow third-party cookies for this site.";
    default:
      return `Sign-in failed (${code}). Try again.`;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  // Bumped when the current User object is mutated in place (see signUpWithEmail).
  const [, setUserVersion] = useState(0);

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) {
      setLoading(false);
      return;
    }

    let active = true;

    // Completes a signInWithRedirect started on a previous page load. Resolves
    // to null (not an error) when no redirect is pending, so this is safe to
    // run unconditionally on every mount.
    getRedirectResult(auth).catch((err) => {
      logAuthError("getRedirectResult", err);
      if (!active) return;
      const code = (err as { code?: string }).code ?? "auth/unknown-error";
      setAuthError(describeAuthError(code));
    });

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (!active) return;
      setUser(u);
      setLoading(false);
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  /** Shared guard: every entry point needs configured Firebase. */
  function requireAuth() {
    const auth = getFirebaseAuth();
    if (!auth) {
      setAuthError("Firebase isn't configured. Set the NEXT_PUBLIC_FIREBASE_* env vars.");
      return null;
    }
    setAuthError(null);
    return auth;
  }

  function reportError(err: unknown): false {
    logAuthError("email auth", err);
    const code = (err as { code?: string }).code ?? "auth/unknown-error";
    setAuthError(describeAuthError(code));
    return false;
  }

  async function signInWithGoogle() {
    const auth = requireAuth();
    if (!auth) return;

    const provider = new GoogleAuthProvider();
    // Always show the account chooser. Without this, Google reuses whatever
    // session the browser already has, which silently signs the user into the
    // wrong account and gives no way to switch.
    provider.setCustomParameters({ prompt: "select_account" });

    try {
      await signInWithPopup(auth, provider);
      return;
    } catch (err) {
      logAuthError("signInWithPopup", err);
      const code = (err as { code?: string }).code ?? "auth/unknown-error";

      // User-initiated cancellation: not worth a redirect or an error banner.
      if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
        return;
      }

      if (!POPUP_FALLBACK_CODES.has(code)) {
        setAuthError(describeAuthError(code));
        return;
      }

      // Popup transport failed. Tell the user why before we navigate away,
      // then retry the same sign-in as a full-page redirect.
      setAuthError(describeAuthError(code));
      try {
        await signInWithRedirect(auth, provider);
      } catch (redirectErr) {
        logAuthError("signInWithRedirect", redirectErr);
        const redirectCode = (redirectErr as { code?: string }).code ?? "auth/unknown-error";
        setAuthError(describeAuthError(redirectCode));
      }
    }
  }

  async function signInWithEmail(email: string, password: string): Promise<boolean> {
    const auth = requireAuth();
    if (!auth) return false;
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch (err) {
      return reportError(err);
    }
  }

  async function signUpWithEmail(
    email: string,
    password: string,
    displayName?: string
  ): Promise<boolean> {
    const auth = requireAuth();
    if (!auth) return false;
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName?.trim()) {
        await updateProfile(credential.user, { displayName: displayName.trim() });
        // updateProfile mutates the live User in place and onAuthStateChanged
        // already fired with the pre-update object, so React sees no new
        // reference. Bump a counter to re-render instead of copying the User —
        // a spread would drop its prototype methods (getIdToken, reload, ...).
        setUserVersion((v) => v + 1);
      }
      return true;
    } catch (err) {
      return reportError(err);
    }
  }

  async function sendPasswordReset(email: string): Promise<boolean> {
    const auth = requireAuth();
    if (!auth) return false;
    try {
      await sendPasswordResetEmail(auth, email);
      return true;
    } catch (err) {
      return reportError(err);
    }
  }

  async function signOut() {
    const auth = getFirebaseAuth();
    if (!auth) return;
    await firebaseSignOut(auth);
  }

  const getIdToken = useCallback(async () => {
    const auth = getFirebaseAuth();
    return auth?.currentUser ? auth.currentUser.getIdToken() : null;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        configured: isFirebaseConfigured,
        authError,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        sendPasswordReset,
        signOut,
        getIdToken,
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
