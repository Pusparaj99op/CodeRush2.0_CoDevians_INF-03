import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { Hero } from "@/components/sections/Hero";
import { ValueStrip } from "@/components/sections/ValueStrip";
import { Features } from "@/components/sections/Features";
import { ServicesAccordion } from "@/components/sections/ServicesAccordion";
import { Testimonials } from "@/components/sections/Testimonials";
import { LogoMarquee } from "@/components/sections/LogoMarquee";
import { Benefits } from "@/components/sections/Benefits";
import { PricingSection } from "@/components/sections/PricingSection";
import { FAQSection } from "@/components/sections/FAQSection";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <ValueStrip />
        <Features />
        <ServicesAccordion />
        <Testimonials />
        <LogoMarquee />
        <Benefits />
        <PricingSection />
        <FAQSection />
      </main>
      <Footer />
    </>
  );
}
