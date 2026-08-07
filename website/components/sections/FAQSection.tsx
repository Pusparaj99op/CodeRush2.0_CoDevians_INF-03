"use client";

import { useState, useRef } from "react";
import { gsap } from "gsap";
import { Plus, Minus } from "@phosphor-icons/react";

const FAQS = [
  {
    q: "What blockchains does Veldar support?",
    a: "Veldar supports Algorand TestNet (with Lute Wallet), Stellar TestNet (with Freight/Freighter Wallet), and Ethereum Sepolia Testnet (with MetaMask). All payments run through dedicated x402 payment facilitators.",
  },
  {
    q: "How are approval gates enforced?",
    a: "Any workflow step whose quoted price exceeds your subscription tier cap, or any step routing to an unverified marketplace provider, automatically pauses and surfaces an approval gate. Tokens never leave your wallet without explicit authorization.",
  },
  {
    q: "What happens if a provider fails mid-run?",
    a: "If a provider fails or drops connection, Veldar's orchestrator logs the step failure, preserves all completed payments, and allows you to retry or execute fallback logic without double-spending.",
  },
  {
    q: "Is TestNet money real money?",
    a: "No, all transactions in this build run strictly on TestNet environments (Algorand TestNet, Stellar TestNet, and Ethereum Sepolia). You can acquire free test tokens from network dispensers.",
  },
  {
    q: "How does the ledger trace replay work?",
    a: "Every single event — goal creation, provider quote, human approval, on-chain transaction hash, and step deliverable — is immutably logged into Veldar's ledger. You can inspect or replay any run line-by-line.",
  },
  {
    q: "Can I paste an e-commerce URL to plan purchases?",
    a: "Yes! You can paste product URLs (smartphones, travel gear, tech accessories) into Veldar's E-Commerce Product Scanner. Veldar automatically extracts product specs, prices, and compiles an autonomous procurement pipeline.",
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const panelsRef = useRef<(HTMLDivElement | null)[]>([]);

  function toggleFaq(index: number) {
    const current = openIndex;
    const isOpening = current !== index;

    if (current !== null && panelsRef.current[current]) {
      const prevEl = panelsRef.current[current]!;
      gsap.to(prevEl, {
        height: 0,
        duration: 0.35,
        ease: "power2.inOut",
        onStart: () => {
          prevEl.style.overflow = "hidden";
        },
      });
    }

    if (isOpening && panelsRef.current[index]) {
      const nextEl = panelsRef.current[index]!;
      gsap.set(nextEl, { height: "auto" });
      gsap.from(nextEl, {
        height: 0,
        duration: 0.45,
        ease: "power2.inOut",
        onStart: () => {
          nextEl.style.overflow = "hidden";
        },
        onComplete: () => {
          nextEl.style.overflow = "visible";
        },
      });
      setOpenIndex(index);
    } else {
      setOpenIndex(null);
    }
  }

  return (
    <section className="py-24 lg:py-32 border-b border-[#D8D4CE]">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex items-center justify-between mb-12">
          <div className="eyebrow">● FREQUENT QUESTIONS</div>
          <span className="section-tag">(VLD — 05)</span>
        </div>

        <h2 className="font-[family-name:var(--font-display)] text-[clamp(2.5rem,5vw,4.5rem)] font-light text-[#1A1916] mb-16">
          Everything you need to <span className="italic font-normal text-[#C9A84C]">know.</span>
        </h2>

        {/* FAQ Accordions */}
        <div className="flex flex-col border-t border-[#D8D4CE]">
          {FAQS.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div key={faq.q} className="border-b border-[#D8D4CE] py-6">
                <button
                  onClick={() => toggleFaq(i)}
                  className="flex w-full items-center justify-between text-left focus:outline-none"
                >
                  <h3 className="font-[family-name:var(--font-display)] text-xl md:text-2xl font-medium text-[#1A1916] pr-4">
                    {faq.q}
                  </h3>
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#D8D4CE] text-[#1A1916]">
                    {isOpen ? <Minus size={16} /> : <Plus size={16} />}
                  </div>
                </button>

                <div
                  ref={(el) => {
                    panelsRef.current[i] = el;
                  }}
                  className={`overflow-hidden transition-all ${
                    isOpen ? "h-auto" : "h-0"
                  }`}
                >
                  <p className="pt-4 pr-12 text-sm font-light text-[#6B6660] leading-relaxed max-w-3xl">
                    {faq.a}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
