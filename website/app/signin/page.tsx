import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";

export const metadata: Metadata = {
  title: "Sign in — Veldar",
  description: "Sign in to your Veldar dashboard with Google or email.",
};

export default function SignInPage() {
  return (
    <>
      <Nav />
      <main className="grid min-h-[75dvh] place-items-center px-6 py-16">
        {/* useSearchParams needs a Suspense boundary to stay prerenderable. */}
        <Suspense fallback={null}>
          <AuthForm mode="signin" />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
