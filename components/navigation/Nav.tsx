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
  const soundOn = useStoreValue(experienceStore.soundOn);
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
        <svg viewBox="0 0 32 32" width="24" height="24" aria-hidden="true" className="brand-icon">
          <polygon points="16,4 28,26 4,26" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
          <polygon points="16,11 23,24 9,24" fill="currentColor" opacity="0.9" />
        </svg>
        <span className="brand-text">{site.brand}</span>
      </a>

      <nav className="nav-pill" aria-label="Primary" id="primary-nav">
        {site.nav.map((item) => {
          const isItemActive = isHome && (
            (item.id === "top" && (active === "top" || active === "intro")) ||
            (item.id === "work" && active === "work") ||
            (item.id === "about" && (active === "about" || active === "skills")) ||
            (item.id === "contact" && active === "contact")
          );
          return (
            <a
              key={item.id}
              href={isHome ? item.href : `/${item.href}`}
              onClick={(e) => go(e, item.href)}
              aria-current={isItemActive ? "true" : undefined}
              className={isItemActive ? "active-link" : ""}
            >
              {item.label}
            </a>
          );
        })}
      </nav>

      <div className="nav-actions">
        <div className="lang-picker" aria-label="Language">
          <span>EN</span>
          <svg viewBox="0 0 10 6" width="9" height="5" aria-hidden="true">
            <path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>

        <button
          type="button"
          className="sound-toggle"
          aria-label={soundOn ? "Mute audio" : "Enable audio"}
          aria-pressed={soundOn}
          onClick={() => experienceStore.soundOn.set(!soundOn)}
          title="Ambient Sound"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            {soundOn ? (
              <>
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" />
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
              </>
            ) : (
              <>
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" />
                <line x1="23" y1="9" x2="17" y2="15" />
                <line x1="17" y1="9" x2="23" y2="15" />
              </>
            )}
          </svg>
        </button>

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
