"use client";
import { useRef } from "react";
import { skillGroups } from "@/data/skills";
import { useSectionReveal } from "@/animations/sections";
import { scrollToTarget } from "@/lib/experienceStore";

export default function Skills() {
  const ref = useRef<HTMLElement | null>(null);
  useSectionReveal(ref, { start: "top 65%", once: false });

  return (
    <section id="skills" className="section skills-section light-theme" ref={ref} aria-label="Skills & Technologies">
      <div className="skills-container">
        <div className="skills-header">
          <span className="section-step-light" data-reveal>
            03 — SKILLS & TECHNOLOGIES
          </span>
          <h2 data-reveal>
            Built with
            <br />
            modern <span className="highlight-blue">tools.</span>
          </h2>
          <p className="skills-lede" data-reveal>
            I work with modern technologies to build fast, scalable and visually appealing web applications.
          </p>
          <a
            className="skills-action-btn"
            href="#work"
            data-reveal
            onClick={(e) => {
              e.preventDefault();
              scrollToTarget("#work");
            }}
          >
            <span className="btn-circle-light">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </span>
            <span>VIEW ALL PROJECTS</span>
          </a>
        </div>

        <div className="skills-grid">
          {skillGroups.map((group) => (
            <div key={group.id} className="skill-card-white" data-reveal>
              <div className="skill-card-header">
                <div className="skill-icon-wrap" style={{ backgroundColor: `${group.color}15`, color: group.color }}>
                  {group.id === "frontend" && (
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="16 18 22 12 16 6" />
                      <polyline points="8 6 2 12 8 18" />
                    </svg>
                  )}
                  {group.id === "3d" && (
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                      <line x1="12" y1="22.08" x2="12" y2="12" />
                    </svg>
                  )}
                  {group.id === "tools" && (
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                    </svg>
                  )}
                  {group.id === "backend" && (
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
                      <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
                      <line x1="6" y1="6" x2="6.01" y2="6" />
                      <line x1="6" y1="18" x2="6.01" y2="18" />
                    </svg>
                  )}
                </div>
                <h3>{group.label}</h3>
              </div>

              <ul className="skill-item-list">
                {group.items.map((item) => (
                  <li key={item} className="skill-item-row">
                    <span className="skill-bullet" style={{ backgroundColor: group.color }} />
                    <span className="skill-text">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
