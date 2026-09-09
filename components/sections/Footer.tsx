"use client";
import { site } from "@/data/site";
import { scrollToTarget } from "@/lib/experienceStore";

export default function Footer() {
  return (
    <footer className="site-footer">
      <button
        type="button"
        className="back-top"
        aria-label="Back to top"
        onClick={() => scrollToTarget("#top")}
      >
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 19V5m-7 7 7-7 7 7" />
        </svg>
      </button>
      <div className="footer-row">
        <span>© {new Date().getFullYear()} {site.brand}</span>
        <span className="footer-note">Procedural 3D — built with Three.js, GSAP and Next.js</span>
        <a href={site.socials[1].href} target="_blank" rel="noreferrer">
          GitHub ↗
        </a>
      </div>
    </footer>
  );
}
