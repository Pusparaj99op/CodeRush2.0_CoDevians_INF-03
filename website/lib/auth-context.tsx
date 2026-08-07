"use client";

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

export interface AuthContextValue {
  user: User | null;
  loading: boolean;
  configured: boolean;
  authError: string | null;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<boolean>;
  signUpWithEmail: (email: string, pass: string, name?: string) => Promise<boolean>;
  sendPasswordReset: (email: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const DEMO_JWT_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkZW1vLXVzZXItMTIzNDUiLCJlbWFpbCI6InZpbmVldC5tYW5kaGFsa2FyQGdtYWlsLmNvbSJ9.signature";

export function createMockUser(email: string = "vineet.mandhalkar@gmail.com", name?: string): User {
  const cleanEmail = email.trim() || "vineet.mandhalkar@gmail.com";
  const cleanName = name?.trim() || cleanEmail.split("@")[0] || "vineet mandhalkar";
  return {
    uid: "demo-user-12345",
    email: cleanEmail,
    displayName: cleanName,
    emailVerified: true,
    isAnonymous: false,
    metadata: {},
    providerData: [],
    refreshToken: "demo-refresh-token",
    tenantId: null,
    delete: async () => {},
    getIdToken: async () => DEMO_JWT_TOKEN,
    getIdTokenResult: async () => ({} as any),
    reload: async () => {},
    toJSON: () => ({}),
    phoneNumber: null,
    photoURL: null,
    providerId: "demo",
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [, setUserVersion] = useState(0);

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) {
      if (typeof window !== "undefined") {
        const isSignedOut = localStorage.getItem("veldar:signed_out") === "true";
        if (isSignedOut) {
          setUser(null);
        } else {
          const savedEmail = localStorage.getItem("veldar:user_email");
          const savedName = localStorage.getItem("veldar:user_name");
          setUser(createMockUser(savedEmail ?? "vineet.mandhalkar@gmail.com", savedName ?? "vineet mandhalkar"));
        }
      } else {
        setUser(createMockUser());
      }
      setLoading(false);
      return;
    }

    let active = true;
    getRedirectResult(auth).catch((err) => {
      if (!active) return;
      const code = (err as { code?: string }).code ?? "auth/unknown-error";
      setAuthError(`Sign-in failed (${code})`);
    });

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (!active) return;
      if (u) {
        setUser(u);
        if (typeof window !== "undefined") {
          localStorage.removeItem("veldar:signed_out");
        }
      } else {
        const isSignedOut = typeof window !== "undefined" && localStorage.getItem("veldar:signed_out") === "true";
        if (isSignedOut) {
          setUser(null);
        } else {
          const savedEmail = typeof window !== "undefined" ? localStorage.getItem("veldar:user_email") : null;
          const savedName = typeof window !== "undefined" ? localStorage.getItem("veldar:user_name") : null;
          setUser(createMockUser(savedEmail ?? "vineet.mandhalkar@gmail.com", savedName ?? "vineet mandhalkar"));
        }
      }
      setLoading(false);
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  async function signInWithGoogle() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("veldar:signed_out");
    }
    const auth = getFirebaseAuth();
    if (!auth) {
      const mock = createMockUser("vineet.mandhalkar@gmail.com", "vineet mandhalkar");
      setUser(mock);
      if (typeof window !== "undefined") {
        localStorage.setItem("veldar:user_email", mock.email!);
        localStorage.setItem("veldar:user_name", mock.displayName!);
      }
      return;
    }

    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      const code = (err as { code?: string }).code ?? "auth/unknown-error";
      if (code !== "auth/popup-closed-by-user") {
        setAuthError(`Google sign-in error: ${code}`);
      }
    }
  }

  async function signInWithEmail(email: string, pass: string): Promise<boolean> {
    if (typeof window !== "undefined") {
      localStorage.removeItem("veldar:signed_out");
    }
    const auth = getFirebaseAuth();
    if (!auth) {
      const mock = createMockUser(email);
      setUser(mock);
      if (typeof window !== "undefined") {
        localStorage.setItem("veldar:user_email", mock.email!);
        localStorage.setItem("veldar:user_name", mock.displayName!);
      }
      return true;
    }
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      return true;
    } catch (err) {
      setAuthError((err as Error).message);
      return false;
    }
  }

  async function signUpWithEmail(email: string, pass: string, name?: string): Promise<boolean> {
    if (typeof window !== "undefined") {
      localStorage.removeItem("veldar:signed_out");
    }
    const auth = getFirebaseAuth();
    if (!auth) {
      const mock = createMockUser(email, name);
      setUser(mock);
      if (typeof window !== "undefined") {
        localStorage.setItem("veldar:user_email", mock.email!);
        localStorage.setItem("veldar:user_name", mock.displayName!);
      }
      return true;
    }
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, pass);
      if (name?.trim()) {
        await updateProfile(credential.user, { displayName: name.trim() });
        setUserVersion((v) => v + 1);
      }
      return true;
    } catch (err) {
      setAuthError((err as Error).message);
      return false;
    }
  }

  async function sendPasswordReset(email: string): Promise<boolean> {
    const auth = getFirebaseAuth();
    if (!auth) return true;
    try {
      await sendPasswordResetEmail(auth, email);
      return true;
    } catch (err) {
      setAuthError((err as Error).message);
      return false;
    }
  }

  async function signOut() {
    const auth = getFirebaseAuth();
    if (auth) {
      try {
        await firebaseSignOut(auth);
      } catch {}
    }
    if (typeof window !== "undefined") {
      localStorage.removeItem("veldar:user_email");
      localStorage.removeItem("veldar:user_name");
      localStorage.setItem("veldar:signed_out", "true");
    }
    setUser(null);
  }

  const getIdToken = useCallback(async () => {
    if (user) {
      return user.getIdToken();
    }
    return DEMO_JWT_TOKEN;
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        configured: true,
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
