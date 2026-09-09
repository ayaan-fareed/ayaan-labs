"use client";
import { useEffect, useRef } from "react";
import { experienceStore } from "@/lib/experienceStore";

/** Registers a DOM element to be positioned each frame at a named 3D anchor on the character. */
export function useAnchor<T extends HTMLElement>(name: string) {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    experienceStore.anchors.set(name, el);
    return () => {
      experienceStore.anchors.delete(name);
    };
  }, [name]);
  return ref;
}
