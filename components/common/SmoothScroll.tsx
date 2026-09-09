"use client";
import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { experienceStore } from "@/lib/experienceStore";

export default function SmoothScroll() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lenis = new Lenis({
      autoRaf: false,
      lerp: reduced ? 0.2 : 0.085,
      smoothWheel: !reduced,
      syncTouch: false,
      anchors: false,
    });
    experienceStore.lenis = lenis;

    const onTick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);
    lenis.on("scroll", ScrollTrigger.update);

    // Hold the page while the loader is running
    const unsubscribe = experienceStore.loaderDone.subscribe((done) => {
      if (done) lenis.start();
      else lenis.stop();
    });

    return () => {
      unsubscribe();
      lenis.off("scroll", ScrollTrigger.update);
      gsap.ticker.remove(onTick);
      lenis.destroy();
      experienceStore.lenis = null;
    };
  }, []);

  return null;
}
