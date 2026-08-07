"use client";

import { Check } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import SpecularButton from "./SpecularButton";
import CursorGrid from "./CursorGrid";
import { TracePreview } from "./trace-preview";

export function Hero() {
  const router = useRouter();

  return (
    /*
      `section` is `relative` so CursorGrid (absolute inset-0) fills the
      ENTIRE hero area — both left text column and right card column.
      All content is `relative z-10` so it sits above the grid.
    */
    <section className="relative pt-12 pb-24 lg:pt-20 lg:pb-36 overflow-hidden">

      {/* ── Full-bleed CursorGrid — entire hero section background ── */}
      {/* pointerEvents:none so content (buttons, inputs) stays fully clickable.
          trackWindow=true makes the grid react to cursor even over stacked content. */}
      <div className="absolute inset-0 z-0" style={{ pointerEvents: "none" }}>
        <CursorGrid
          cellSize={72}
          color="#ff5228"
          radius={150}
          falloff="smooth"
          holdTime={400}
          fadeDuration={700}
          lineWidth={1.3}
          maxOpacity={0.9}
          fillOpacity={0.14}
          gridOpacity={0.08}
          cellRadius={6}
          clickPulse
          pulseSpeed={550}
          trackWindow
        />
      </div>

      {/* ── Hero content — sits above the grid ── */}
      <div
        className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-6 lg:grid-cols-12 lg:gap-12 lg:px-8"
        style={{ pointerEvents: "auto" }}
      >
        {/* Left Column: Typography & Action Bar */}
        <div className="lg:col-span-7">
          {/* Headline */}
          <h1 className="font-display text-5xl font-normal leading-[1.04] tracking-tight text-[var(--color-headline)] sm:text-6xl md:text-7xl lg:text-[5.25rem]">
            Your Goals.<br />
            Your Payments.<br />
            <span className="bg-gradient-to-r from-white via-white to-[#c9c5bf] bg-clip-text text-transparent">
              Your Agent.
            </span>
          </h1>

          {/* Sub-headline */}
          <p className="mt-7 max-w-[50ch] text-base leading-relaxed text-[var(--color-body)] md:text-xl font-normal">
            Give Veldar a goal. It shops a marketplace of paid services, executes instant
            x402 micropayments, and keeps budgets and approvals 100% visible before anything is final.
          </p>

          {/* Checklist */}
          <div className="mt-9 grid grid-cols-1 gap-4 sm:grid-cols-2 max-w-xl">
            {[
              "Earn with every purchase",
              "Instant x402 micropayments",
              "Strict budget enforcement",
              "No hidden fees",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-[#ff5228]/80 bg-[#ff5228]/15 text-[#ff5228] shadow-[0_0_10px_rgba(255,82,40,0.3)]">
                  <Check size={13} weight="bold" />
                </div>
                <span className="text-sm md:text-base font-medium text-[var(--color-headline)]">{item}</span>
              </div>
            ))}
          </div>

          {/* Email / CTA bar */}
          <div className="mt-10 flex max-w-lg items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] p-2 shadow-2xl backdrop-blur-2xl transition-all focus-within:border-[#ff5228]/60 focus-within:ring-2 focus-within:ring-[#ff5228]/20">
            <input
              type="email"
              placeholder="Your email address or goal..."
              className="w-full bg-transparent px-5 py-3 text-sm text-[var(--color-headline)] placeholder:text-[var(--color-muted)] outline-none"
            />
            <SpecularButton
              onClick={() => router.push("/dashboard")}
              size="lg"
              radius={9999}
              tint="#ff5228"
              tintOpacity={0.15}
              lineColor="#ff7a59"
              baseColor="#ff5228"
              autoAnimate={true}
              className="shrink-0"
            >
              Join Waitlist
            </SpecularButton>
          </div>

          <p className="mt-3.5 text-xs text-[var(--color-footer-dim)] pl-2">
            * Instant settlement powered by Algorand TestNet &amp; Stellar x402 protocol.
          </p>
        </div>

        {/* Right Column: TracePreview card floats above the grid */}
        <div className="lg:col-span-5 lg:pl-2">
          <div className="rounded-[2rem] border border-white/10 bg-[#0c0a09]/85 p-6 lg:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.7)] backdrop-blur-md">
            <TracePreview />
          </div>
        </div>
      </div>
    </section>
  );
}
