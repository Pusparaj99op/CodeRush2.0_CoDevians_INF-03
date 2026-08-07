"use client";

import { ArrowRight, ChartLineUp, ClockCounterClockwise, Lightning, LockKey, Wallet } from "@phosphor-icons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Footer } from "@/components/footer";
import { GsapReveal } from "@/components/gsap-reveal";
import { Nav } from "@/components/nav";
import SpecularButton from "@/components/SpecularButton";
import { StickyStack } from "@/components/sticky-stack";
import { TracePreview } from "@/components/trace-preview";
import { X402InspectorModal } from "@/components/x402-inspector-modal";
import { WORKFLOW_LIFECYCLE } from "@/lib/content";

const PRINCIPLES = [
  {
    icon: Wallet,
    title: "Budget enforced server-side",
    body: "The tier cap is checked in the orchestrator, not the client. A modified request can't bypass it.",
  },
  {
    icon: LockKey,
    title: "Approval before spend, not after",
    body: "A step that exceeds the cap pauses. Nothing settles until you decide, and the workflow can't silently proceed.",
  },
  {
    icon: ChartLineUp,
    title: "Idempotent settlement",
    body: "Every payment payload is keyed so a retried request can't double-settle the same step.",
  },
  {
    icon: ClockCounterClockwise,
    title: "Replayable by design",
    body: "Offers, quotes, approvals, payments, and verifications are all append-only events, not overwritten state.",
  },
];

export default function ProductPage() {
  const router = useRouter();
  const [showInspector, setShowInspector] = useState(false);

  return (
    <>
      <Nav />
      <main>
        <section className="pt-16 pb-20 lg:pb-28">
          <div className="mx-auto max-w-4xl px-6 text-center lg:px-8">
            <h1
              className="text-4xl font-light leading-[1.05] tracking-tight text-[var(--color-headline)] md:text-5xl lg:text-6xl"
              style={{ fontFamily: "var(--font-canela)", fontWeight: 300 }}
            >
              The orchestrator behind every workflow.
            </h1>
            <p className="mx-auto mt-6 max-w-[52ch] text-lg leading-relaxed text-[var(--color-body)]">
              Six stages turn a goal into a budgeted, approvable, and fully replayable sequence of
              Algorand payments. None of them are hidden from you.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <SpecularButton
                onClick={() => router.push("/dashboard")}
                size="lg"
                radius={9999}
                tint="#ff5228"
                tintOpacity={0.15}
                lineColor="#ff7a59"
                baseColor="#ff5228"
                autoAnimate={true}
              >
                <span>Run a workflow</span>
                <ArrowRight size={16} weight="bold" />
              </SpecularButton>

              <SpecularButton
                onClick={() => setShowInspector(true)}
                size="lg"
                radius={9999}
                tint="#ff5228"
                tintOpacity={0.12}
                lineColor="#ff7a59"
                baseColor="#ff5228"
                autoAnimate={true}
              >
                <Lightning size={16} weight="bold" />
                <span>Inspect x402 Engine (Live Demo)</span>
              </SpecularButton>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-6 lg:px-8">
          <StickyStack
            cards={WORKFLOW_LIFECYCLE.map(({ title, body }, i) => (
              <div
                key={title}
                className={
                  i % 2 === 1
                    ? "flex h-full flex-col justify-between rounded-3xl p-10 shadow-[0_30px_80px_rgb(255_82_40_/_0.2)]"
                    : "flex h-full flex-col justify-between rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-10"
                }
                style={
                  i % 2 === 1
                    ? { background: "linear-gradient(160deg, var(--color-card-from), var(--color-card-to))" }
                    : undefined
                }
              >
                <div
                  className={
                    i % 2 === 1
                      ? "h-1.5 w-10 rounded-full bg-white/50"
                      : "h-1.5 w-10 rounded-full bg-[var(--color-cta)]"
                  }
                />
                <div className="mt-8">
                  <h3
                    className={
                      i % 2 === 1
                        ? "text-2xl font-semibold text-white md:text-3xl"
                        : "text-2xl font-semibold text-[var(--color-headline)] md:text-3xl"
                    }
                  >
                    {title}
                  </h3>
                  <p
                    className={
                      i % 2 === 1
                        ? "mt-4 max-w-md text-base leading-relaxed text-white/85"
                        : "mt-4 max-w-md text-base leading-relaxed text-[var(--color-body)]"
                    }
                  >
                    {body}
                  </p>
                </div>
              </div>
            ))}
          />
        </section>

        <section className="py-24 lg:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
              <GsapReveal>
                <h2
                  className="max-w-md text-3xl font-light leading-tight text-[var(--color-headline)] md:text-4xl"
                  style={{ fontFamily: "var(--font-canela)", fontWeight: 300 }}
                >
                  See it live, not just described.
                </h2>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-[var(--color-body)]">
                  This is the same trace component rendered in your dashboard: real step
                  statuses, real provider names, real ALGO amounts, sourced from the orchestrator's
                  own types.
                </p>
                <div className="mt-8">
                  <SpecularButton
                    onClick={() => router.push("/dashboard")}
                    size="md"
                    radius={9999}
                    tint="#ff5228"
                    tintOpacity={0.15}
                    lineColor="#ff7a59"
                    baseColor="#ff5228"
                    autoAnimate={true}
                  >
                    <span>Run a workflow</span>
                    <ArrowRight size={16} weight="bold" />
                  </SpecularButton>
                </div>
              </GsapReveal>
              <GsapReveal delay={0.1}>
                <TracePreview />
              </GsapReveal>
            </div>
          </div>
        </section>

        <section className="py-24 lg:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <h2
              className="max-w-xl text-3xl font-light leading-tight text-[var(--color-headline)] md:text-4xl"
              style={{ fontFamily: "var(--font-canela)", fontWeight: 300 }}
            >
              Four rules the orchestrator never breaks.
            </h2>
            <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">
              {PRINCIPLES.map(({ icon: Icon, title, body }, i) => (
                <GsapReveal key={title} delay={i * 0.08}>
                  <div className="flex h-full items-start gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-7">
                    <Icon size={24} weight="duotone" className="mt-1 shrink-0 text-[var(--color-cta)]" />
                    <div>
                      <h3 className="text-base font-semibold text-[var(--color-headline)]">{title}</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-body)]">{body}</p>
                    </div>
                  </div>
                </GsapReveal>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />

      <X402InspectorModal
        isOpen={showInspector}
        onClose={() => setShowInspector(false)}
        workflowName="Product Orchestrator Demo"
        amountAlgo={1.2}
      />
    </>
  );
}
