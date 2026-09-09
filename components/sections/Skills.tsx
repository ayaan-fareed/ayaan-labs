"use client";
import { useEffect, useRef, useState } from "react";
import { skillGroups } from "@/data/skills";
import { useSectionReveal } from "@/animations/sections";
import { gsap } from "@/lib/gsap";

const LAYOUT = [
  { side: "left", top: 46, depth: 0.9 },
  { side: "right", top: 20, depth: 1.3 },
  { side: "left", top: 70, depth: 1.1 },
  { side: "right", top: 50, depth: 0.7 },
  { side: "right", top: 76, depth: 1.5 },
] as const;

export default function Skills() {
  const ref = useRef<HTMLElement | null>(null);
  const fieldRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(skillGroups[0].id);
  useSectionReveal(ref, { start: "top 60%", once: false });

  useEffect(() => {
    const field = fieldRef.current;
    if (!field || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const nodes = Array.from(field.querySelectorAll<HTMLElement>("[data-depth]"));
    const setters = nodes.map((n) => ({
      depth: Number(n.dataset.depth),
      x: gsap.quickTo(n, "x", { duration: 0.9, ease: "power3.out" }),
      y: gsap.quickTo(n, "y", { duration: 0.9, ease: "power3.out" }),
    }));
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      setters.forEach((s) => {
        s.x(nx * -26 * s.depth);
        s.y(ny * -18 * s.depth);
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <section id="skills" className="pin-wrap skills-wrap" ref={ref} aria-label="Skills">
      <div className="pin skills-pin">
        <div className="skills-heading">
          <span className="section-index" data-reveal>
            04 — Stack
          </span>
          <h2 data-reveal>
            Built across
            <br />
            <em>design + code.</em>
          </h2>
        </div>

        <div className="skills-field" ref={fieldRef}>
          {skillGroups.map((group, i) => {
            const slot = LAYOUT[i % LAYOUT.length];
            const isActive = active === group.id;
            return (
              <div
                key={group.id}
                className={`skill-node skill-node--${slot.side}`}
                style={{ top: `${slot.top}%` }}
                data-depth={slot.depth}
                data-reveal
                data-active={isActive || undefined}
              >
                <button
                  type="button"
                  className="skill-node-label"
                  onPointerEnter={() => setActive(group.id)}
                  onFocus={() => setActive(group.id)}
                  onClick={() => setActive(group.id)}
                  aria-expanded={isActive}
                  aria-controls={`skills-${group.id}`}
                >
                  <i />
                  {group.label}
                </button>
                <ul id={`skills-${group.id}`} className="skill-node-items">
                  {group.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
