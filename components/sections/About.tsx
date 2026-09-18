"use client";
import { useRef } from "react";
import { floatingSkills } from "@/data/skills";
import { scrollToTarget } from "@/lib/experienceStore";
import { useSectionReveal } from "@/animations/sections";

export default function About() {
  const ref = useRef<HTMLElement | null>(null);
  useSectionReveal(ref, { start: "top 60%", once: false });

  const leftSkills = floatingSkills.slice(0, 3); // React, Next.js, TypeScript
  const rightSkills = floatingSkills.slice(3, 6); // Tailwind, GSAP, Three.js

  return (
    <section id="about" className="section about-section" ref={ref} aria-label="About Ayaan">
      <div className="section-meta-bar" data-reveal>
        <span className="section-step">02 — ABOUT ME</span>
        <div className="section-counter">
          <span>02 / 06</span>
          <span className="counter-line" />
        </div>
      </div>

      <div className="about-grid">
        <div className="about-copy">
          <h2 data-reveal>
            Below the desk
            <br />
            there is a second layer —
            <br />
            <span className="gradient-cyan">where the interface stops being flat.</span>
          </h2>

          <p className="about-bio" data-reveal>
            I&apos;m Ayaan, a frontend developer who loves turning ideas into interactive, responsive, and visually polished web experiences.
          </p>

          <a
            className="about-scroll-btn"
            href="#skills"
            data-reveal
            onClick={(e) => {
              e.preventDefault();
              scrollToTarget("#skills");
            }}
          >
            <span className="btn-circle">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M19 12l-7 7-7-7" />
              </svg>
            </span>
            <span>SCROLL DOWN</span>
          </a>
        </div>

        {/* 3D Floating Technology Badges surrounding Ayaan */}
        <div className="floating-badges-wrap" aria-hidden="true">
          <div className="floating-col floating-col--left">
            {leftSkills.map((skill, i) => (
              <div
                key={skill}
                className="tech-badge tech-badge--left"
                style={{ animationDelay: `${i * 0.4}s` }}
                data-reveal
              >
                <span>{skill}</span>
              </div>
            ))}
          </div>

          <div className="floating-col floating-col--right">
            {rightSkills.map((skill, i) => (
              <div
                key={skill}
                className="tech-badge tech-badge--right"
                style={{ animationDelay: `${0.6 + i * 0.4}s` }}
                data-reveal
              >
                <span>{skill}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
