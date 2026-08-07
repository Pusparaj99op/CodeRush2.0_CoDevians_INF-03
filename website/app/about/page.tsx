import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { Reveal } from "@/components/reveal";

export const metadata: Metadata = {
  title: "About — Veldar",
  description: "Why Veldar exists: the YCCE Nagpur hackathon, the INF-03 problem statement, and the Algorand bet.",
};

export default function AboutPage() {
  return (
    <>
      <Nav />
      <main>
        <section className="pt-16 pb-16 lg:pb-20">
          <div className="mx-auto max-w-3xl px-6 lg:px-8">
            <h1 className="font-[family-name:var(--font-display)] text-4xl font-medium leading-[1.05] tracking-tight text-[var(--color-headline)] md:text-5xl">
              Built in a weekend, for a real gap.
            </h1>
            <p className="mt-6 max-w-[60ch] text-lg leading-relaxed text-[var(--color-body)]">
              Veldar started as an entry for a hackathon at YCCE, Nagpur, sponsored in part by
              Algorand. It's still that project, kept honest about what's real and what's
              simulated.
            </p>
          </div>
        </section>

        <section className="pb-24 lg:pb-32">
          <div className="mx-auto flex max-w-3xl flex-col gap-12 px-6 lg:px-8">
            <Reveal>
              <h2 className="text-2xl font-semibold text-[var(--color-headline)]">The problem statement</h2>
              <p className="mt-3 max-w-[65ch] text-base leading-relaxed text-[var(--color-body)]">
                The hackathon's INF-03 track asked for a &quot;Composite Agentic Commerce
                Orchestrator&quot;: a system that lets an agent negotiate and execute a
                multi-step, multi-provider paid workflow, discovery, quotes, payment, conditional
                fulfillment, verification, and settlement, while keeping budgets, business rules,
                and approvals visible the entire time. Veldar is a direct build of that brief.
              </p>
            </Reveal>

            <Reveal delay={0.05}>
              <h2 className="text-2xl font-semibold text-[var(--color-headline)]">Why Algorand</h2>
              <p className="mt-3 max-w-[65ch] text-base leading-relaxed text-[var(--color-body)]">
                Fast finality and low fixed fees make Algorand a reasonable settlement layer for
                the kind of high-frequency, small-value payments an autonomous agent generates.
                What it lacked was the layer above the chain: a pay-per-call HTTP standard, an
                orchestration framework for agents, and a consumer interface that makes any of
                this legible to someone who isn't a blockchain developer. That gap is the whole
                product; see the <a href="/algorand" className="text-[var(--color-accent)] hover:text-[var(--color-accent-hover)]">full technical story</a>.
              </p>
            </Reveal>

            <Reveal delay={0.1}>
              <h2 className="text-2xl font-semibold text-[var(--color-headline)]">What&apos;s real right now</h2>
              <p className="mt-3 max-w-[65ch] text-base leading-relaxed text-[var(--color-body)]">
                The orchestrator, the facilitator, the dashboard, and the trace viewer are all
                working code, not mockups, running against Algorand TestNet. What isn&apos;t real
                yet: production wallets, real funds, and a live marketplace of third-party
                providers beyond the demo set. Every payment on this site settles on TestNet, per
                the hackathon&apos;s own safety rules.
              </p>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
