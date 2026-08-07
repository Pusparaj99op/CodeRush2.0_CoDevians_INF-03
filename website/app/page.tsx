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
    <>
      <Nav />
      <main>
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
    </>
  );
}
