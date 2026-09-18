"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import { projects } from "@/data/projects";
import ProjectPreview from "@/components/projects/ProjectPreview";
import { useSectionReveal } from "@/animations/sections";
import { scrollToTarget } from "@/lib/experienceStore";

export default function ProjectShowcase() {
  const ref = useRef<HTMLElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  useSectionReveal(ref, { start: "top 65%", once: false });

  const handlePrev = () => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : projects.length - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev < projects.length - 1 ? prev + 1 : 0));
  };

  return (
    <section id="work" className="section work-section dark-theme" ref={ref} aria-label="Selected Projects">
      <div className="work-header">
        <div className="work-title-col">
          <span className="section-step" data-reveal>
            04 — PROJECTS
          </span>
          <h2 data-reveal>
            Selected
            <br />
            <span className="gradient-blue">Work.</span>
          </h2>
          <p className="work-lede" data-reveal>
            A collection of real-world projects built with modern technologies, focusing on performance, design and user experience.
          </p>

          <a
            className="work-explore-btn"
            href="#contact"
            data-reveal
            onClick={(e) => {
              e.preventDefault();
              scrollToTarget("#contact");
            }}
          >
            <span className="btn-circle">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M19 12l-7 7-7-7" />
              </svg>
            </span>
            <span>GET IN TOUCH</span>
          </a>
        </div>

        <div className="work-nav-controls" data-reveal>
          <span className="work-counter-text">
            {String(activeIndex + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}
          </span>
          <button
            type="button"
            className="nav-arrow-btn"
            onClick={handlePrev}
            aria-label="Previous project"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            className="nav-arrow-btn"
            onClick={handleNext}
            aria-label="Next project"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div className="project-cards-grid">
        {projects.map((project, index) => (
          <div
            key={project.slug}
            className={`project-card-premium ${index === activeIndex ? "is-featured" : ""}`}
            data-reveal
          >
            <div className="card-mockup-wrapper">
              <ProjectPreview project={project} index={index} />
            </div>

            <div className="card-body">
              <div className="card-category-row">
                <span className="project-badge-pill">{project.category}</span>
                <span className="project-year">{project.year}</span>
              </div>

              <h3 className="card-title">{project.title}</h3>
              <p className="card-desc">{project.description}</p>

              <div className="card-tech-badges">
                {project.technologies.map((tech) => (
                  <span key={tech} className="tech-badge-small">
                    {tech}
                  </span>
                ))}
              </div>

              <div className="card-actions-row">
                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="card-live-btn"
                    title={`Open ${project.title} live site`}
                  >
                    <span>Live Demo</span>
                    <span className="arrow-icon">↗</span>
                  </a>
                )}
                <Link
                  href={`/projects/${project.slug}`}
                  className="card-detail-link"
                >
                  Details
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
