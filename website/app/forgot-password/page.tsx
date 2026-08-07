import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { ForgotPasswordForm } from "@/components/forgot-password-form";
import { Nav } from "@/components/nav";

export const metadata: Metadata = {
  title: "Reset your password — Veldar",
  description: "Send yourself a password reset link for your Veldar account.",
};

export default function ForgotPasswordPage() {
  return (
    <>
      <Nav />
      <main className="grid min-h-[75dvh] place-items-center px-6 py-16">
        <ForgotPasswordForm />
      </main>
      <Footer />
    </>
  );
}
