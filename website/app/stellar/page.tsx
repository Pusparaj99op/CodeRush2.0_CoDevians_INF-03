import type { Metadata } from "next";
import { Reveal } from "@/components/reveal";
import { Footer } from "@/components/footer";
import { GsapReveal } from "@/components/gsap-reveal";
import { Nav } from "@/components/nav";
import { ShieldCheck, Planet, Lightning, Wallet } from "@phosphor-icons/react/dist/ssr";

export const metadata: Metadata = {
  title: "Stellar & Freight Wallet — Veldar",
  description: "Multi-chain agentic commerce on Stellar with Freight (Freighter) Wallet x402 payment settlement.",
};

const STELLAR_FEATURES = [
  {
    id: "freighter-integration",
    icon: Wallet,
    title: "Native Freight (Freighter) Wallet Integration",
    detail:
      "Veldar seamlessly connects with Freight Wallet for Stellar. Users can approve agentic payment step requests, sign transactions directly in their browser extension, and settle x402 micropayments effortlessly.",
  },
  {
    id: "fast-settlement",
    icon: Lightning,
    title: "Sub-Second Finality & Micro-Fees",
    detail:
      "Stellar's 3-5 second ledger confirmation times and fraction-of-a-cent transaction fees make it an ideal settlement layer for autonomous AI multi-agent marketplace workflows.",
  },
  {
    id: "soroban-ready",
    icon: Planet,
    title: "Soroban Smart Contract Compatibility",
    detail:
      "Veldar's x402 facilitator supports both native XLM token payments and Soroban smart contract escrow verification, ensuring flexible multi-chain payment rails.",
  },
];

const SAFETY_NOTES = [
  "All Stellar payments in Veldar settle on Stellar TestNet Horizon API. No production funds required.",
  "Freight Wallet user keys remain secure within the extension. Veldar requests transaction signatures without storing raw secret keys.",
  "Budget caps and human approval rules are enforced by Veldar's server-side orchestrator before any transaction payload is constructed.",
  "Every transaction generates a verifiable receipt cross-referenced with Horizon ledger history.",
];

export default function StellarPage() {
  return (
    <>
      <Nav />
      <main>
        <section className="pt-16 pb-20 lg:pb-28">
          <div className="mx-auto max-w-4xl px-6 text-center lg:px-8">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-400">
              <Planet size={36} />
            </div>
            <h1 className="mt-6 font-[family-name:var(--font-display)] text-4xl font-medium leading-[1.05] tracking-tight text-[var(--color-headline)] md:text-5xl">
              Agentic Commerce on Stellar with Freight Wallet.
            </h1>
            <p className="mx-auto mt-6 max-w-[52ch] text-lg leading-relaxed text-[var(--color-body)]">
              Veldar brings multi-chain x402 payment settlement to Stellar. Harness sub-second transactions, sub-cent fees, and seamless browser extension signing with Freight Wallet.
            </p>
          </div>
        </section>

        <section className="pb-24 lg:pb-32">
          <div className="mx-auto max-w-4xl px-6 lg:px-8">
            <div className="flex flex-col gap-16">
              {STELLAR_FEATURES.map(({ id, icon: Icon, title, detail }, i) => (
                <GsapReveal key={id} delay={i * 0.05}>
                  <div className="flex flex-col gap-5 border-t border-[var(--color-border)] pt-10">
                    <Icon size={28} weight="duotone" className="text-sky-400" />
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
                Safety & Multi-Chain Standard.
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
