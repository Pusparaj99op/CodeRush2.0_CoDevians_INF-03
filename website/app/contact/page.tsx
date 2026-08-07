import type { Metadata } from "next";
import { EnvelopeSimple } from "@phosphor-icons/react/dist/ssr";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";

export const metadata: Metadata = {
  title: "Contact — Veldar",
  description: "Reach the Veldar team.",
};

export default function ContactPage() {
  return (
    <>
      <Nav />
      <main className="grid min-h-[70dvh] place-items-center px-6">
        <div className="max-w-md text-center">
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-medium text-[var(--color-headline)] md:text-4xl">
            Get in touch.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-[var(--color-body)]">
            This is a hackathon build, so there&apos;s no support queue yet, just a real inbox.
            Questions about the orchestrator, the Algorand integration, or the demo are all
            welcome.
          </p>
          {/* Placeholder address on a domain you actually control (codevians.online) —
              swap for a real monitored inbox before sharing this page widely. */}
          <a
            href="mailto:hello@codevians.online"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-[var(--color-cta)] px-6 py-3.5 text-sm font-semibold text-white transition-all hover:bg-[var(--color-cta-hover)] active:scale-[0.98]"
          >
            <EnvelopeSimple size={18} weight="bold" />
            hello@codevians.online
          </a>
        </div>
      </main>
      <Footer />
    </>
  );
}
