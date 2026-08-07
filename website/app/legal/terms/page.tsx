import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";

export const metadata: Metadata = {
  title: "Terms — Veldar",
  description: "Terms of use for the Veldar hackathon build.",
};

export default function TermsPage() {
  return (
    <>
      <Nav />
      <main className="mx-auto max-w-2xl px-6 py-20 lg:px-8">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-medium text-[var(--color-headline)] md:text-4xl">
          Terms
        </h1>
        <p className="mt-4 text-sm text-[var(--color-muted)]">Last updated 2026.</p>

        <div className="mt-10 flex flex-col gap-8 text-sm leading-relaxed text-[var(--color-body)]">
          <p>
            Veldar is a hackathon project, not a commercial service. Using it means accepting
            that it&apos;s a working prototype, evaluated as such, and not a finished product
            with production guarantees.
          </p>

          <section>
            <h2 className="text-base font-semibold text-[var(--color-headline)]">TestNet only</h2>
            <p className="mt-2">
              Every payment settles on Algorand TestNet with simulated funds. Nothing on this
              site moves real money, and no feature should be relied on to do so.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[var(--color-headline)]">No warranty</h2>
            <p className="mt-2">
              The orchestrator, facilitator, and dashboard are provided as-is, for demonstration
              and evaluation. Workflow data can be lost on a server restart during this build
              phase; don&apos;t depend on it for anything you can&apos;t afford to lose.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[var(--color-headline)]">Pricing tiers</h2>
            <p className="mt-2">
              The Free, Pro, and ProMax tiers described on the{" "}
              <a href="/pricing" className="text-[var(--color-accent)] hover:text-[var(--color-accent-hover)]">
                pricing page
              </a>{" "}
              reflect the budget and approval policy implemented in this build. Displayed prices
              are illustrative for the hackathon demo, not an active billing system.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
