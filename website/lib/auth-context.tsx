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
    const code = (err as { code?: string }).code ?? "auth/unknown-error";
    setAuthError(describeAuthError(code));
    return false;
  }

  async function signInWithGoogle() {
    const auth = requireAuth();
    if (!auth) return;

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
        // onAuthStateChanged already fired with the pre-update user, so push
        // the profile change into state ourselves.
        setUser({ ...credential.user, displayName: displayName.trim() } as User);
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
