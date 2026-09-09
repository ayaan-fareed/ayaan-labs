"use client";
import { useEffect, useRef } from "react";
import { site } from "@/data/site";
import { experienceStore, scrollToTarget } from "@/lib/experienceStore";
import { staggerReveal } from "@/animations/sections";
import { gsap } from "@/lib/gsap";

export default function Hero() {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const items = root.querySelectorAll("[data-reveal]");
    gsap.set(items, { opacity: 0 });
    let tween: gsap.core.Tween | null = null;
    const unsubscribe = experienceStore.loaderDone.subscribe((done) => {
      if (done && !tween) tween = staggerReveal(items, { delay: 0.15, y: 36, duration: 1.1, stagger: 0.12 });
    });
    return () => {
      unsubscribe();
      tween?.kill();
    };
  }, []);

  return (
    <section id="top" className="hero" ref={ref} aria-label="Introduction">
      <div className="hero-copy">
        <h1 data-reveal>
          {site.name}
          <br />
          <span>Labs</span>
        </h1>
        <span className="role-tag" data-reveal>
          {site.role}
        </span>
        <p className="hero-lede" data-reveal>
          {site.tagline}
        </p>
      </div>
      <div className="hero-meta" data-reveal>
        <span>01 — Office</span>
        <span>{site.location}</span>
      </div>
      <a
        className="scroll-cue"
        href="#intro"
        aria-label="Scroll to explore"
        data-reveal
        onClick={(e) => {
          e.preventDefault();
          scrollToTarget("#intro");
        }}
      >
        <span className="scroll-cue-track">
          <span />
        </span>
        <span className="scroll-cue-label">Scroll to explore</span>
      </a>
    </section>
  );
}
