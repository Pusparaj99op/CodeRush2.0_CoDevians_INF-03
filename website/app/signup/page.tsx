import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import Scanner from "@/components/Scanner";

export const metadata: Metadata = {
  title: "Create an account — Veldar",
  description: "Create a Veldar account with Google or email and start running agent workflows.",
};

export default function SignUpPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0908]">
      {/* WebGL Scanner background effect matching sign-in page */}
      <div className="pointer-events-none absolute inset-0 z-0 opacity-70">
        <Scanner
          color1="#6b5ef5"
          color2="#ff5228"
          color3="#ffffff"
          speed={0.4}
          sweepSpeed={0.2}
          sweepWidth={1.8}
          sweepFalloff={5}
          scale={1.4}
          frequency={2}
          ripple={0.25}
          bandDensity={10}
          lineSharpness={5}
          glow={0.3}
          scanDirection="vertical"
          colorSpread={0.8}
          brightness={0.9}
          contrast={1.2}
          softness={1.2}
          vignette={0.6}
          scanline={true}
          grain={true}
          grainIntensity={0.04}
          opacity={0.85}
          mouseInteraction={true}
          mouseRadius={0.6}
          mouseStrength={0.6}
        />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col justify-between">
        <Nav />
        <main className="grid flex-1 place-items-center px-6 py-16">
          <Suspense fallback={null}>
            <AuthForm mode="signup" />
          </Suspense>
        </main>
        <Footer className="relative z-20 bg-[#0a0908] shadow-2xl" />
      </div>
    </div>
  );
}
