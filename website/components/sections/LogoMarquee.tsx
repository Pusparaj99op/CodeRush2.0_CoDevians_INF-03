"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

const ROW_1 = [
  "Algorand TestNet",
  "Stellar Network",
  "Ethereum Sepolia",
  "x402 Protocol",
  "AlgoKit SDK",
  "Freight Wallet",
  "Lute Wallet",
  "MetaMask",
];

const ROW_2 = [
  "YCCE Nagpur",
  "Vercel Edge",
  "algosdk",
  "Soroban Smart Contracts",
  "Next.js 14",
  "TypeScript",
  "FastAPI",
  "GSAP Animations",
];

export function LogoMarquee() {
  const row1Ref = useRef<HTMLDivElement>(null);
  const row2Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (row1Ref.current) {
      const el1 = row1Ref.current;
      gsap.to(el1, {
        xPercent: -50,
        duration: 25,
        ease: "none",
        repeat: -1,
      });
    }

    if (row2Ref.current) {
      const el2 = row2Ref.current;
      gsap.fromTo(
        el2,
        { xPercent: -50 },
        {
          xPercent: 0,
          duration: 25,
          ease: "none",
          repeat: -1,
        }
      );
    }
  }, []);

  return (
    <section className="py-16 overflow-hidden border-b border-[#D8D4CE] bg-[#F5F3F0]">
      <div className="flex flex-col gap-6">
        {/* Row 1 (Moving Left) */}
        <div className="flex w-max items-center gap-12" ref={row1Ref}>
          {[...ROW_1, ...ROW_1].map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 font-mono text-xs font-semibold text-[#6B6660] uppercase tracking-widest"
            >
              <span className="text-[#C9A84C]">●</span>
              <span>{item}</span>
            </div>
          ))}
        </div>

        {/* Row 2 (Moving Right) */}
        <div className="flex w-max items-center gap-12" ref={row2Ref}>
          {[...ROW_2, ...ROW_2].map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 font-mono text-xs font-semibold text-[#1A1916] uppercase tracking-widest"
            >
              <span className="text-[#2E6B4F]">◆</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
