"use client";
import { useRef } from "react";
import { useSectionReveal } from "@/animations/sections";

export default function Intro() {
  const ref = useRef<HTMLElement | null>(null);
  useSectionReveal(ref, { start: "top 55%", once: false });

  return (
    <section id="intro" className="section intro-section" ref={ref} aria-label="Leaving the office">
      <div className="intro-grid">
        <span className="section-index" data-reveal>
          02 — Descent
        </span>
        <p className="display-copy" data-reveal>
          Below the desk there is a second layer — where the interface <em>stops being flat.</em>
        </p>
        <p className="body-copy" data-reveal>
          Product thinking, motion design and front-end engineering, treated as one system. Keep scrolling to meet the person behind the screens.
        </p>
      </div>
    </section>
  );
}
