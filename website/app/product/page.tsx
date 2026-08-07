"use client";

import { ArrowRight, Lightning } from "@phosphor-icons/react";
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

export default function ProductPage() {
  const router = useRouter();
  const [showInspector, setShowInspector] = useState(false);

  return (
    <>
      <Nav />
      <main>
        {/* Header Section */}
        <section className="pt-14 pb-12 lg:pb-16">
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

        {/* 6-Stage Lifecycle Section */}
        <section className="mx-auto max-w-4xl px-6 py-4 lg:px-8">
          <StickyStack
            cards={WORKFLOW_LIFECYCLE.map(({ title, body }, i) => (
              <div
                key={title}
                className={
                  i % 2 === 1
                    ? "flex flex-col justify-between rounded-2xl p-6 sm:p-7 shadow-[0_20px_50px_rgb(255_82_40_/_0.25)] border border-[#ff5228]/40"
                    : "flex flex-col justify-between rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6 sm:p-7"
                }
                style={
                  i % 2 === 1
                    ? { background: "linear-gradient(160deg, #1c1613, #0f0c0a)" }
                    : undefined
                }
              >
                <div className="flex items-center justify-between">
                  <span
                    className={
                      i % 2 === 1
                        ? "font-mono text-xs font-bold tracking-widest text-[#ff7a59] uppercase"
                        : "font-mono text-xs font-bold tracking-widest text-[var(--color-cta)] uppercase"
                    }
                  >
                    Stage 0{i + 1} of 06
                  </span>
                  <div
                    className={
                      i % 2 === 1
                        ? "h-1.5 w-8 rounded-full bg-[#ff5228]"
                        : "h-1.5 w-8 rounded-full bg-white/20"
                    }
                  />
                </div>
                <div className="mt-4">
                  <h3 className="text-xl font-semibold text-[var(--color-headline)] md:text-2xl">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--color-body)]">
                    {body}
                  </p>
                </div>
              </div>
            ))}
          />
        </section>

        {/* Live Trace Preview Section */}
        <section className="pt-12 pb-20 lg:pt-16 lg:pb-24">
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
