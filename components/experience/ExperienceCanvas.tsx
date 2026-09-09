"use client";
import { useEffect, useRef } from "react";
import { Experience } from "@/three/Experience";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export default function ExperienceCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let experience: Experience | null = null;
    try {
      experience = new Experience(canvas, { reducedMotion });
      if (process.env.NODE_ENV !== "production") {
        (window as Window & { __experience?: Experience }).__experience = experience;
      }
    } catch (error) {
      console.error("WebGL experience failed to start; falling back to static layout.", error);
      document.documentElement.dataset.webgl = "failed";
    }
    return () => experience?.dispose();
  }, [reducedMotion]);

  return <canvas ref={canvasRef} className="experience-canvas" aria-hidden="true" />;
}
