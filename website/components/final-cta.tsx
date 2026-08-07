import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { GsapReveal } from "./gsap-reveal";

export function FinalCta() {
  return (
    <section className="relative py-28 lg:py-36">
      {/* Expansive, smooth radial glow blending seamlessly into the dark background without box clipping */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-full max-w-6xl -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 blur-[130px]"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(255, 82, 40, 0.35) 0%, rgba(255, 107, 46, 0.12) 40%, rgba(10, 9, 8, 0) 75%)",
        }}
      />

      <div className="relative mx-auto max-w-4xl px-6 text-center lg:px-8">
        <GsapReveal>
          <h2 className="font-display text-4xl font-medium leading-[1.1] tracking-tight text-[var(--color-headline)] md:text-5xl lg:text-6xl">
            Give it a goal. Watch it pay.
          </h2>

          <p className="font-poppins mx-auto mt-6 max-w-[50ch] text-lg leading-relaxed text-[var(--color-body)]">
            Start on Algorand TestNet with zero friction. Every payment requires your explicit approval on the free tier until you choose your policy cap.
          </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/signin"
                className="btn-spectacular inline-flex items-center gap-2 px-8 py-4 text-base font-semibold"
              >
                <span>Get started for free</span>
                <ArrowRight size={18} weight="bold" />
              </Link>
              <Link
                href="/docs"
                className="btn-secondary inline-flex items-center gap-2 px-8 py-4 text-base font-semibold"
              >
                Read the docs
              </Link>
            </div>
        </GsapReveal>
      </div>
    </section>
  );
}

