"use client";
import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { experienceStore } from "@/lib/experienceStore";
import { site } from "@/data/site";

const MIN_DURATION = 1.1;

export default function Loader() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const numberRef = useRef<HTMLSpanElement | null>(null);
  const barRef = useRef<HTMLSpanElement | null>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    const number = numberRef.current;
    const bar = barRef.current;
    if (!root || !number || !bar) return;

    const progress = { value: 0 };
    let ready = false;
    let finished = false;
    let outTl: gsap.core.Timeline | null = null;

    const render = () => {
      number.textContent = String(Math.round(progress.value)).padStart(2, "0");
      bar.style.transform = `scaleX(${progress.value / 100})`;
    };

    // Creep to 88% while the scene compiles, then complete once the first frame is rendered.
    const creep = gsap.to(progress, { value: 88, duration: MIN_DURATION * 2, ease: "power2.out", onUpdate: render });

    const finish = () => {
      if (finished) return;
      finished = true;
      creep.kill();
      outTl = gsap
        .timeline()
        .to(progress, { value: 100, duration: 0.45, ease: "power2.inOut", onUpdate: render })
        .to(root.querySelectorAll("[data-loader-text]"), { yPercent: -110, opacity: 0, duration: 0.5, stagger: 0.05, ease: "power3.in" }, "-=0.05")
        .to(root, { yPercent: -100, duration: 0.9, ease: "power4.inOut" }, "-=0.15")
        .add(() => {
          experienceStore.loaderDone.set(true);
          setHidden(true);
        });
    };

    const started = performance.now();
    const unsubscribe = experienceStore.ready.subscribe((value) => {
      if (!value || ready) return;
      ready = true;
      const elapsed = (performance.now() - started) / 1000;
      gsap.delayedCall(Math.max(0, MIN_DURATION - elapsed), finish);
    });
    // Safety net: never trap the visitor if WebGL fails to initialise.
    const fallback = gsap.delayedCall(6, finish);

    return () => {
      unsubscribe();
      creep.kill();
      fallback.kill();
      outTl?.kill();
    };
  }, []);

  if (hidden) return null;

  return (
    <div className="loader" ref={rootRef} role="status" aria-live="polite" aria-label="Loading experience">
      <div className="loader-inner">
        <span className="loader-brand" data-loader-text>
          {site.brand.toUpperCase()}
        </span>
        <span className="loader-number" data-loader-text>
          <span ref={numberRef}>00</span>
          <small>%</small>
        </span>
        <span className="loader-bar" aria-hidden="true">
          <span ref={barRef} />
        </span>
        <span className="loader-hint" data-loader-text>
          Preparing the world
        </span>
      </div>
    </div>
  );
}
