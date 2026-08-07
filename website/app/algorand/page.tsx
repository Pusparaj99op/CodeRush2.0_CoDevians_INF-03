import type { Metadata } from "next";
import { Reveal } from "@/components/reveal";
import { Footer } from "@/components/footer";
import { GsapReveal } from "@/components/gsap-reveal";
import { Nav } from "@/components/nav";
import { GAPS } from "@/lib/content";

export const metadata: Metadata = {
  title: "Algorand — Veldar",
  description: "The three gaps in Algorand's agentic-commerce stack that Veldar was built to fill.",
};

const SAFETY_NOTES = [
  "Every payment in this build settles on Algorand TestNet. No production wallets, no real funds.",
  "The facilitator's Algorand account is scoped to settlement only; it never holds custody of user funds beyond a single verification step.",
  "Budget caps are enforced by the orchestrator's policy engine, server-side, regardless of what a client displays.",
  "A workflow can be cancelled mid-run at any point; the ledger records exactly what was delivered and what wasn't purchased.",
];

export default function AlgorandPage() {
  return (
    <>
      <Nav />
      <main>
        <section className="pt-16 pb-20 lg:pb-28">
          <div className="mx-auto max-w-4xl px-6 text-center lg:px-8">
            <img
              src="https://cdn.simpleicons.org/algorand/F5F3F0"
              alt="Algorand"
              className="mx-auto h-9 w-auto opacity-90"
            />
            <h1 className="mt-6 font-[family-name:var(--font-display)] text-4xl font-medium leading-[1.05] tracking-tight text-[var(--color-headline)] md:text-5xl">
              Built for what Algorand doesn&apos;t have yet.
            </h1>
            <p className="mx-auto mt-6 max-w-[52ch] text-lg leading-relaxed text-[var(--color-body)]">
              Fast finality and low fixed fees make Algorand a good settlement layer for agentic
              micropayments. Three things a real product still needed didn&apos;t exist, so Veldar
              built them.
            </p>
          </div>
        </section>

        <section className="pb-24 lg:pb-32">
          <div className="mx-auto max-w-4xl px-6 lg:px-8">
            <div className="flex flex-col gap-16">
              {GAPS.map(({ id, icon: Icon, title, detail }, i) => (
                <GsapReveal key={id} delay={i * 0.05}>
                  <div className="flex flex-col gap-5 border-t border-[var(--color-border)] pt-10">
                    <Icon size={28} weight="duotone" className="text-[var(--color-cta)]" />
                    <h2 className="text-2xl font-semibold text-[var(--color-headline)]">{title}</h2>
                    <p className="max-w-[70ch] text-base leading-relaxed text-[var(--color-body)]">
                      {detail}
                    </p>
                  </div>
                </GsapReveal>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 lg:py-32">
          <div className="mx-auto max-w-4xl px-6 lg:px-8">
            <Reveal>
              <h2 className="max-w-xl font-[family-name:var(--font-display)] text-3xl font-medium leading-tight text-[var(--color-headline)] md:text-4xl">
                Safety boundaries, not an afterthought.
              </h2>
            </Reveal>
            <ul className="mt-10 flex flex-col gap-4">
              {SAFETY_NOTES.map((note, i) => (
                <Reveal key={note} delay={i * 0.06}>
                  <li className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6 text-sm leading-relaxed text-[var(--color-body)]">
                    {note}
                  </li>
                </Reveal>
              ))}
            </ul>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
