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
        <span className="hero-greeting" data-reveal>
          01 — HI, I&apos;M
        </span>
        <h1 data-reveal>
          {site.firstName}
          <br />
          <span className="gradient-purple">{site.lastName}</span>
        </h1>
        <span className="role-tag" data-reveal>
          {site.role}
        </span>
        <p className="hero-lede" data-reveal>
          {site.tagline}
        </p>

        <a
          className="hero-scroll-btn"
          href="#about"
          aria-label="Scroll to explore"
          data-reveal
          onClick={(e) => {
            e.preventDefault();
            scrollToTarget("#about");
          }}
        >
          <span className="btn-circle">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M19 12l-7 7-7-7" />
            </svg>
          </span>
          <span>SCROLL TO EXPLORE</span>
        </a>
      </div>
    </section>
  );
}
