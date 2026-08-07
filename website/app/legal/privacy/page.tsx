import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";

export const metadata: Metadata = {
  title: "Privacy — Veldar",
  description: "What Veldar collects and stores, honestly, at its current hackathon stage.",
};

export default function PrivacyPage() {
  return (
    <>
      <Nav />
      <main className="mx-auto max-w-2xl px-6 py-20 lg:px-8">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-medium text-[var(--color-headline)] md:text-4xl">
          Privacy
        </h1>
        <p className="mt-4 text-sm text-[var(--color-muted)]">Last updated 2026.</p>

        <div className="mt-10 flex flex-col gap-8 text-sm leading-relaxed text-[var(--color-body)]">
          <p>
            Veldar is a hackathon project built for the YCCE Nagpur event, sponsored in part by
            Algorand. This page describes what the current build actually does, not a
            production privacy policy for a live company.
          </p>

          <section>
            <h2 className="text-base font-semibold text-[var(--color-headline)]">What we collect</h2>
            <p className="mt-2">
              Google Sign-In through Firebase Authentication gives us your name, email address,
              and profile photo, used only to identify your session in the dashboard. Workflow
              data you submit (goals, budgets, tier selection) is stored so the orchestrator can
              run and replay it.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[var(--color-headline)]">What we don&apos;t do</h2>
            <p className="mt-2">
              We don&apos;t sell or share your data with third parties, don&apos;t run analytics
              trackers, and don&apos;t process real payments, every settlement in this build runs
              on Algorand TestNet with simulated funds.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[var(--color-headline)]">Data storage</h2>
            <p className="mt-2">
              Workflow and ledger data currently live in the orchestrator&apos;s in-memory store
              for this hackathon build, meaning it can reset on a server restart. It is not yet
              backed by durable storage.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[var(--color-headline)]">Contact</h2>
            <p className="mt-2">
              Questions about this policy can go to the address on the{" "}
              <a href="/contact" className="text-[var(--color-accent)] hover:text-[var(--color-accent-hover)]">
                contact page
              </a>
              .
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
