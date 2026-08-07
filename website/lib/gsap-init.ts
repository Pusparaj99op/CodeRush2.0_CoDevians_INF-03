import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let lenisInstance: Lenis | null = null;

export function initGSAP() {
  if (typeof window === "undefined") return null;

  if (!lenisInstance) {
    gsap.registerPlugin(ScrollTrigger);

    lenisInstance = new Lenis({
      lerp: 0.08,
      smoothWheel: true,
    });

    lenisInstance.on("scroll", () => {
      ScrollTrigger.update();
    });

    gsap.ticker.add((time) => {
      lenisInstance?.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);
  }

  return lenisInstance;
}
