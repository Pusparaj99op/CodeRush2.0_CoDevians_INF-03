"use client";

import { ArrowDownRight, ArrowRight, Sparkle } from "@phosphor-icons/react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import SplitType from "split-type";

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subtextRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!headlineRef.current || !containerRef.current) return;

    const ctx = gsap.context(() => {
      const splitHeadline = new SplitType(headlineRef.current!, {
        types: "chars,words",
      });

      const splitSubtext = subtextRef.current
        ? new SplitType(subtextRef.current, { types: "lines" })
        : null;

      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });

      if (splitHeadline.chars) {
        tl.from(splitHeadline.chars, {
          y: "110%",
          opacity: 0,
          rotateX: -30,
          duration: 0.9,
          stagger: 0.025,
          delay: 0.2,
          transformOrigin: "bottom center",
        });
      }

      if (splitSubtext?.lines) {
        tl.from(
          splitSubtext.lines,
          {
            y: 30,
            opacity: 0,
            duration: 0.7,
            stagger: 0.1,
          },
          "-=0.4"
        );
      }

      tl.from(
        ".hero-cta-group",
        {
          y: 20,
          opacity: 0,
          duration: 0.5,
          stagger: 0.1,
        },
        "-=0.3"
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative pt-24 pb-20 lg:pt-32 lg:pb-36 overflow-hidden border-b border-[#D8D4CE]"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col items-start gap-8 max-w-5xl">
          {/* Eyebrow */}
          <div className="eyebrow">● AUTONOMOUS AGENT PAYMENTS</div>

          {/* Giant Editorial Headline */}
          <h1
            ref={headlineRef}
            className="font-[family-name:var(--font-display)] text-[clamp(3.5rem,8.5vw,8.5rem)] font-light italic leading-[0.98] tracking-tight text-[#1A1916]"
          >
            An agent <br />
            that spends <br />
            <span className="font-normal not-italic text-[#C9A84C]">carefully.</span>
          </h1>

          {/* Subtext */}
          <p
            ref={subtextRef}
            className="max-w-[48ch] text-lg lg:text-xl font-light text-[#6B6660] leading-relaxed"
          >
            Give Veldar a goal. It shops a marketplace of paid services, pays each step in small Algorand, Stellar, or Ethereum micro-transfers, and surfaces human approval gates before anything is final.
          </p>

          {/* CTA Buttons */}
          <div className="hero-cta-group flex flex-wrap items-center gap-4 pt-4">
            <Link
              href="#pricing"
              className="inline-flex items-center gap-3 rounded-full bg-[#1A1916] px-7 py-4 font-sans text-sm font-medium text-[#F5F3F0] transition-transform duration-300 hover:scale-[1.02] hover:bg-[#383530] active:scale-[0.98]"
            >
              <span>Explore Plans</span>
              <ArrowDownRight size={16} className="text-[#C9A84C]" />
            </Link>

            <Link
              href="#how-it-works"
              className="inline-flex items-center gap-2 rounded-full border border-[#B5B1AB] bg-transparent px-7 py-4 font-sans text-sm font-medium text-[#1A1916] transition-colors hover:border-[#1A1916] hover:bg-[#EDEAE5] active:scale-[0.98]"
            >
              <span>See how it works</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
