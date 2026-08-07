import { FinalCta } from "@/components/final-cta";
import { Footer } from "@/components/footer";
import { GapSection } from "@/components/gap-section";
import { Hero } from "@/components/hero";
import { HowItWorks } from "@/components/how-it-works";
import { LivePaymentTicker } from "@/components/live-payment-ticker";
import { MarketplaceGlimpse } from "@/components/marketplace-glimpse";
import { Nav } from "@/components/nav";
import { Pricing } from "@/components/pricing";
import { TrustBar } from "@/components/trust-bar";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-x-clip bg-[#0a0908]">
      {/* Top-Right Ambient Radial Glow: Bleeds seamlessly across the top edge & behind header */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 right-0 h-[850px] w-[850px] rounded-full opacity-35 blur-[160px]"
        style={{
          background: "radial-gradient(circle at 75% 25%, #ff4a1f 0%, #ff6b2e 45%, transparent 70%)",
        }}
      />

      {/* Mid-Left Secondary Ambient Soft Glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-[450px] -left-48 h-[650px] w-[650px] rounded-full opacity-15 blur-[170px]"
        style={{
          background: "radial-gradient(circle, #ff5228 0%, transparent 75%)",
        }}
      />

      <Nav />
      <main className="relative z-10">
        <Hero />
        <TrustBar />
        <HowItWorks />
        <LivePaymentTicker />
        <MarketplaceGlimpse />
        <GapSection />
        <Pricing />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
