"use client";
import { useRef } from "react";
import { site } from "@/data/site";
import { useSectionReveal } from "@/animations/sections";
import SocialIcon from "@/components/common/SocialIcon";

export default function Contact() {
  const ref = useRef<HTMLElement | null>(null);
  useSectionReveal(ref, { start: "top 60%", once: false });

  return (
    <section id="contact" className="section contact-section" ref={ref} aria-label="Contact">
      <div className="contact-frame">
        <span className="section-index" data-reveal>
          06 — Contact
        </span>
        <h2 data-reveal>
          Let&apos;s work
          <br />
          together.
        </h2>
        <a className="contact-link" href={`mailto:${site.email}`} data-reveal>
          {site.email}
        </a>
        <ul className="social-row" data-reveal aria-label="Social links">
          {site.socials.map((s) => (
            <li key={s.label}>
              <a href={s.href} target={s.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" aria-label={s.label} title={s.label}>
                <SocialIcon name={s.icon} />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
