"use client";
import { useEffect, useState, type MouseEvent } from "react";
import { usePathname } from "next/navigation";
import { site } from "@/data/site";
import { experienceStore, scrollToTarget } from "@/lib/experienceStore";
import { useStoreValue } from "@/hooks/useStoreValue";

export default function Nav() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const active = useStoreValue(experienceStore.activeSection);
  const theme = useStoreValue(experienceStore.theme);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.theme = isHome ? theme : "light";
  }, [theme, isHome]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const go = (e: MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!isHome) return;
    e.preventDefault();
    setOpen(false);
    scrollToTarget(href);
  };

  return (
    <header className="site-nav" data-open={open || undefined}>
      <a className="brand" href={isHome ? "#top" : "/"} onClick={(e) => go(e, "#top")} aria-label={`${site.brand} — back to top`}>
        <svg viewBox="0 0 32 32" width="28" height="28" aria-hidden="true">
          <path d="M16 3 28 9.5v13L16 29 4 22.5v-13L16 3Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M16 3v13m0 0 12-6.5M16 16 4 9.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        </svg>
        <span className="brand-text">{site.brand}</span>
      </a>

      <nav className="nav-pill" aria-label="Primary" id="primary-nav">
        {site.nav.map((item) => (
          <a
            key={item.id}
            href={isHome ? item.href : `/${item.href}`}
            onClick={(e) => go(e, item.href)}
            aria-current={isHome && active === item.id ? "true" : undefined}
          >
            {item.label}
          </a>
        ))}
      </nav>

      <div className="nav-actions">
        <a className="cta" href={isHome ? "#contact" : "/#contact"} onClick={(e) => go(e, "#contact")}>
          Get in touch
        </a>
        <button
          type="button"
          className="nav-toggle"
          aria-expanded={open}
          aria-controls="primary-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}
