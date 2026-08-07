"use client";

import { useEffect } from "react";
import { AuthProvider } from "@/lib/auth-context";
import { initGSAP } from "@/lib/gsap-init";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initGSAP();
  }, []);

  return <AuthProvider>{children}</AuthProvider>;
}
