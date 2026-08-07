import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";

export const metadata: Metadata = {
  title: "Create an account — Veldar",
  description: "Create a Veldar account with Google or email and start running agent workflows.",
};

export default function SignUpPage() {
  return (
    <>
      <Nav />
      <main className="grid min-h-[75dvh] place-items-center px-6 py-16">
        <Suspense fallback={null}>
          <AuthForm mode="signup" />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
