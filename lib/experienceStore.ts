import type Lenis from "lenis";

export type SectionId = "top" | "intro" | "about" | "skills" | "work" | "contact";
export type Theme = "light" | "dark";

type Listener<T> = (value: T) => void;

class Signal<T> {
  private listeners = new Set<Listener<T>>();
  constructor(public value: T) {}
  set(next: T) {
    if (Object.is(next, this.value)) return;
    this.value = next;
    this.listeners.forEach((l) => l(next));
  }
  subscribe(listener: Listener<T>) {
    this.listeners.add(listener);
    listener(this.value);
    return () => {
      this.listeners.delete(listener);
    };
  }
}

export const experienceStore = {
  lenis: null as Lenis | null,
  ready: new Signal(false),
  loaderDone: new Signal(false),
  activeSection: new Signal<SectionId>("top"),
  theme: new Signal<Theme>("light"),
  anchors: new Map<string, HTMLElement>(),
};

export function scrollToTarget(target: string | HTMLElement, offset = 0) {
  const lenis = experienceStore.lenis;
  if (lenis) {
    lenis.scrollTo(target, { offset, duration: 1.4, easing: (t) => 1 - Math.pow(1 - t, 3) });
    return;
  }
  const el = typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
  el?.scrollIntoView({ behavior: "smooth" });
}
