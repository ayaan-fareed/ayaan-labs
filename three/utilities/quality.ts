export type QualityTier = "high" | "medium" | "low";

export type QualitySettings = {
  tier: QualityTier;
  maxDpr: number;
  particleCount: number;
  sphereSegments: number;
  capsuleSegments: number;
  gridDivisions: number;
  antialias: boolean;
};

export function detectQuality(width: number, reducedMotion: boolean): QualitySettings {
  const cores = typeof navigator !== "undefined" ? navigator.hardwareConcurrency || 4 : 4;
  const memory = typeof navigator !== "undefined" ? (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8 : 8;
  let tier: QualityTier = "high";
  if (width < 768 || cores <= 4 || memory <= 4) tier = "medium";
  if (width < 480 || (cores <= 2 && memory <= 4)) tier = "low";
  if (reducedMotion && tier === "high") tier = "medium";

  switch (tier) {
    case "high":
      return { tier, maxDpr: 1.75, particleCount: 420, sphereSegments: 40, capsuleSegments: 14, gridDivisions: 40, antialias: true };
    case "medium":
      return { tier, maxDpr: 1.5, particleCount: 220, sphereSegments: 28, capsuleSegments: 10, gridDivisions: 28, antialias: true };
    default:
      return { tier, maxDpr: 1.25, particleCount: 110, sphereSegments: 20, capsuleSegments: 8, gridDivisions: 20, antialias: false };
  }
}
