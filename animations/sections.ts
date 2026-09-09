"use client";
import { useEffect, type RefObject } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Fade + rise a set of elements with stagger. Returns the tween for cleanup. */
export function staggerReveal(targets: gsap.TweenTarget, options: { delay?: number; y?: number; duration?: number; stagger?: number } = {}) {
  const { delay = 0, y = 28, duration = 0.9, stagger = 0.1 } = options;
  if (reduced()) return gsap.fromTo(targets, { opacity: 0 }, { opacity: 1, duration: 0.4, delay, stagger: 0.04 });
  return gsap.fromTo(targets, { y, opacity: 0 }, { y: 0, opacity: 1, duration, delay, stagger, ease: "power3.out", overwrite: "auto" });
}

/** Scroll-triggered reveal for every [data-reveal] element inside a section. */
export function useSectionReveal(ref: RefObject<HTMLElement | null>, options: { start?: string; once?: boolean } = {}) {
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const items = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (items.length === 0) return;
    const ctx = gsap.context(() => {
      gsap.set(items, { opacity: 0, y: reduced() ? 0 : 28 });
      ScrollTrigger.create({
        trigger: root,
        start: options.start ?? "top 72%",
        once: options.once ?? true,
        onEnter: () => staggerReveal(items),
        onLeaveBack: options.once === false ? () => gsap.to(items, { opacity: 0, y: reduced() ? 0 : 28, duration: 0.4, overwrite: "auto" }) : undefined,
      });
    }, root);
    return () => ctx.revert();
  }, [ref, options.start, options.once]);
}

/** Scrubbed reveal for pinned sections: elements appear at given progress thresholds of the wrapper. */
export function useScrubReveal(ref: RefObject<HTMLElement | null>, thresholds: number[]) {
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const items = Array.from(root.querySelectorAll<HTMLElement>("[data-scrub]"));
    if (items.length === 0) return;
    const ctx = gsap.context(() => {
      gsap.set(items, { opacity: 0, y: reduced() ? 0 : 16 });
      const state = items.map(() => false);
      ScrollTrigger.create({
        trigger: root,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          items.forEach((el, i) => {
            const show = self.progress >= (thresholds[i] ?? 0.2);
            if (show === state[i]) return;
            state[i] = show;
            gsap.to(el, { opacity: show ? 1 : 0, y: show ? 0 : reduced() ? 0 : 16, duration: 0.55, ease: "power3.out", overwrite: "auto" });
          });
        },
      });
    }, root);
    return () => ctx.revert();
  }, [ref, thresholds]);
}
