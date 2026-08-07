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
