"use client";
import { useMemo, useRef } from "react";
import { site } from "@/data/site";
import { headlineSkills } from "@/data/skills";
import { useAnchor } from "@/hooks/useAnchor";
import { useScrubReveal } from "@/animations/sections";

export default function About() {
  const ref = useRef<HTMLElement | null>(null);
  const headRef = useAnchor<HTMLDivElement>("head");
  const chestRef = useAnchor<HTMLDivElement>("chest");
  const handRef = useAnchor<HTMLDivElement>("handL");
  const feetRef = useAnchor<HTMLDivElement>("feet");
  const thresholds = useMemo(() => [0.12, 0.34, 0.5, 0.2], []);
  useScrubReveal(ref, thresholds);

  return (
    <section id="about" className="pin-wrap about-wrap" ref={ref} aria-label="About">
      <div className="pin about-pin">
        <span className="section-index section-index--floating">03 — Profile</span>

        <div className="anchor anchor--left" ref={headRef} data-scrub>
          <i className="anchor-dot" />
          <i className="anchor-line" />
          <div className="holo-card">
            <strong>{site.name}</strong>
            <span>
              <svg viewBox="0 0 12 12" width="10" height="10" aria-hidden="true">
                <path d="M6 1a3.6 3.6 0 0 1 3.6 3.6C9.6 7.3 6 11 6 11S2.4 7.3 2.4 4.6A3.6 3.6 0 0 1 6 1Z" fill="none" stroke="currentColor" strokeWidth="1.1" />
                <circle cx="6" cy="4.6" r="1.1" fill="currentColor" />
              </svg>
              {site.location}
            </span>
          </div>
        </div>

        <div className="anchor anchor--right" ref={chestRef} data-scrub>
          <i className="anchor-dot" />
          <i className="anchor-line" />
          <div className="holo-card holo-card--list">
            <strong>Skills</strong>
            <ul>
              {headlineSkills.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="anchor anchor--left anchor--wide" ref={handRef} data-scrub>
          <i className="anchor-dot" />
          <i className="anchor-line" />
          <div className="holo-card">
            <p>{site.tagline}</p>
          </div>
        </div>

        <div className="anchor anchor--below" ref={feetRef} data-scrub>
          <div className="holo-counter" aria-hidden="true">
            <span>AL — 01</span>
          </div>
        </div>
      </div>
    </section>
  );
}
