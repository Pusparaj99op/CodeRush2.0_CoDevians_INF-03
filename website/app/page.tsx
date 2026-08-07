import { Footer } from "@/components/footer";
import { GapSection } from "@/components/gap-section";
import { Hero } from "@/components/hero";
import { HowItWorks } from "@/components/how-it-works";
import { Nav } from "@/components/nav";
import { Pricing } from "@/components/pricing";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <HowItWorks />
        <GapSection />
        <Pricing />
      </main>
      <Footer />
    </>
  );
}
