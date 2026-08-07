import { ChatCircleText, HandCoins, ShieldCheck } from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "./reveal";

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <Reveal>
          <h2 className="max-w-xl font-[family-name:var(--font-display)] text-3xl font-medium leading-tight text-[var(--color-headline)] md:text-4xl">
            Three steps, one visible trace.
          </h2>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Reveal className="lg:col-span-2">
            <div className="flex h-full flex-col justify-between rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-8">
              <ChatCircleText size={28} weight="duotone" className="text-[var(--color-cta)]" />
              <div className="mt-8">
                <h3 className="text-xl font-semibold text-[var(--color-headline)]">Say what you need</h3>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-[var(--color-body)]">
                  A plain-language goal and a budget. Veldar compiles it into a step graph, with
                  conditions for what can be skipped.
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div
              className="flex h-full flex-col justify-between rounded-2xl p-8"
              style={{ background: "linear-gradient(160deg, var(--color-card-from), var(--color-card-to))" }}
            >
              <HandCoins size={28} weight="duotone" className="text-white" />
              <div className="mt-8">
                <h3 className="text-xl font-semibold text-white">It shops and pays</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/85">
                  Providers quote in ALGO. Veldar pays through the Algorand x402 facilitator as
                  each step clears.
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="flex h-full flex-col justify-between rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-8">
              <ShieldCheck size={28} weight="duotone" className="text-[var(--color-accent)]" />
              <div className="mt-8">
                <h3 className="text-xl font-semibold text-[var(--color-headline)]">You stay in control</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--color-body)]">
                  Anything above your cap pauses for approval. Cancel any time and see exactly
                  what was and wasn&apos;t purchased.
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.3} className="lg:col-span-2">
            <div className="flex h-full flex-col justify-between rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-8 lg:flex-row lg:items-center">
              <div>
                <h3 className="text-xl font-semibold text-[var(--color-headline)]">Every run replays</h3>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-[var(--color-body)]">
                  Offers, quotes, approvals, payments, and verification results are all written to
                  a ledger you can open and re-check later.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
