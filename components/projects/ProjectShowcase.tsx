"use client";
import Link from "next/link";
import { useRef, type PointerEvent } from "react";
import { projects } from "@/data/projects";
import ProjectPreview from "@/components/projects/ProjectPreview";
import { useSectionReveal } from "@/animations/sections";

export default function ProjectShowcase() {
  const ref = useRef<HTMLElement | null>(null);
  useSectionReveal(ref, { start: "top 70%" });

  const move = (e: PointerEvent<HTMLAnchorElement>) => {
    if (e.pointerType === "touch") return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    const el = e.currentTarget;
    el.style.setProperty("--rx", `${(py - 0.5) * -6}deg`);
    el.style.setProperty("--ry", `${(px - 0.5) * 8}deg`);
    el.style.setProperty("--px", `${px * 100}%`);
    el.style.setProperty("--py", `${py * 100}%`);
  };
  const reset = (e: PointerEvent<HTMLAnchorElement>) => {
    e.currentTarget.style.setProperty("--rx", "0deg");
    e.currentTarget.style.setProperty("--ry", "0deg");
  };

  return (
    <section id="work" className="section work-section" ref={ref} aria-label="Selected projects">
      <div className="work-heading">
        <span className="section-index" data-reveal>
          05 — Projects
        </span>
        <h2 data-reveal>
          A few worlds
          <br />
          <em>I have built.</em>
        </h2>
        <span className="work-count" data-reveal>
          {String(projects.length).padStart(2, "0")} selected
        </span>
      </div>

      <div className="projects-list">
        {projects.map((project, index) => (
          <Link
            className="project-row"
            href={`/projects/${project.slug}`}
            key={project.slug}
            onPointerMove={move}
            onPointerLeave={reset}
            data-reveal
            aria-label={`${project.title} — ${project.category}`}
          >
            <ProjectPreview project={project} index={index} />
            <div className="project-info">
              <div className="project-title">
                <span className="project-category">{project.category}</span>
                <h3>{project.title}</h3>
                <p>{project.description}</p>
              </div>
              <div className="project-meta">
                <span>{project.year}</span>
                <span>{project.technologies.slice(0, 3).join(" / ")}</span>
                <span className="project-arrow" aria-hidden="true">
                  ↗
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
