export type ProjectAccent = "violet" | "orange" | "blue";

export type Project = {
  id: string;
  slug: string;
  title: string;
  category: string;
  year: string;
  role: string;
  technologies: string[];
  description: string;
  longDescription: string;
  highlights: string[];
  accent: ProjectAccent;
  image?: string;
  liveUrl?: string;
  githubUrl?: string;
};

export const projects: Project[] = [
  {
    id: "01",
    slug: "elyscents",
    title: "Elyscents",
    category: "E-commerce / UI engineering",
    year: "2025",
    role: "Design + front-end",
    technologies: ["Next.js", "TypeScript", "Tailwind CSS", "Figma"],
    description: "A conversion-focused commerce experience built around a refined visual system and responsive product discovery.",
    longDescription:
      "A polished e-commerce direction where interface hierarchy, product presentation, responsive behavior, and interaction details work as one system.",
    highlights: ["Responsive product discovery", "Editorial product presentation", "Reusable UI system in Figma and code"],
    accent: "violet",
    githubUrl: "https://github.com/ayaan-fareed/elyscents",
  },
  {
    id: "02",
    slug: "apex",
    title: "Apex",
    category: "3D web experience",
    year: "2025",
    role: "Creative development",
    technologies: ["Three.js", "Next.js", "GSAP", "WebGL"],
    description: "An experimental automotive interface exploring motion, depth, and cinematic product presentation.",
    longDescription:
      "A concept direction for a 3D car site that treats navigation as a guided visual sequence instead of a conventional collection of page sections.",
    highlights: ["Scroll-driven camera sequence", "Custom lighting and materials", "Performance-tiered rendering"],
    accent: "orange",
  },
  {
    id: "03",
    slug: "logistics",
    title: "Logistics OS",
    category: "Product / dashboard",
    year: "2025",
    role: "Product UI engineering",
    technologies: ["React", "TypeScript", "SCSS", "UX"],
    description: "A workflow-heavy logistics product shaped around clarity, operational speed, and dense information architecture.",
    longDescription:
      "A product interface designed to turn complex operational states into fast, readable workflows with strong hierarchy and minimal friction.",
    highlights: ["Dense data made readable", "Keyboard-first workflows", "State-driven component architecture"],
    accent: "blue",
  },
];

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}

export function getNextProject(slug: string) {
  const index = projects.findIndex((p) => p.slug === slug);
  return projects[(index + 1) % projects.length];
}
