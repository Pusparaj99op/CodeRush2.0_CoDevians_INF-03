import { ArrowRight, ChatCircleText, HandCoins, ShieldCheck } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { Reveal } from "./reveal";

const STEPS = [
  {
    icon: ChatCircleText,
    tone: "outline",
    title: "Say what you need",
    body: "A plain-language goal and a budget. Veldar compiles it into a step graph, with conditions for what can be skipped.",
  },
  {
    icon: HandCoins,
    tone: "featured",
    title: "It shops and pays",
    body: "Providers quote in ALGO. Veldar pays through the Algorand x402 facilitator as each step clears, never before.",
  },
  {
    icon: ShieldCheck,
    tone: "outline",
    title: "You stay in control",
    body: "Anything above your cap pauses for approval. Cancel any time and see exactly what was and wasn't purchased.",
  },
] as const;

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <Reveal className="flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="max-w-xl font-display text-3xl font-medium leading-tight text-[var(--color-headline)] md:text-4xl">
            Three steps, one visible trace.
          </h2>
          <Link
            href="/product"
            className="veldar-link-arrow shrink-0 text-sm font-medium"
          >
            <span>See the full workflow</span>
            <ArrowRight size={16} />
          </Link>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {STEPS.map(({ icon: Icon, tone, title, body }, i) => (
            <Reveal key={title} delay={i * 0.1}>
              <div
                className={`flex h-full flex-col justify-between ${
                  tone === "featured" ? "veldar-card-featured" : "veldar-card-outline"
                }`}
              >
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-[#ff5228]/30 bg-[#ff5228]/15 text-[#ff5228]">
                  <Icon size={24} weight="duotone" />
                </div>
                <div className="mt-8">
                  <h3 className="text-xl font-semibold text-[var(--color-headline)]">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--color-body)]">
                    {body}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
