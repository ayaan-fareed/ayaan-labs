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
    category: "Perfume / E-commerce",
    year: "2025",
    role: "Frontend Development",
    technologies: ["Next.js", "React", "TypeScript", "Tailwind CSS"],
    description: "Modern perfume e-commerce experience with product browsing, categories, and a polished shopping interface.",
    longDescription:
      "A conversion-focused perfume boutique shopping experience built with Next.js, TypeScript and Tailwind CSS. Features curated fragrance galleries, dynamic filtering, responsive product discovery, and fluid checkout animations.",
    highlights: ["Responsive product discovery", "Refined visual hierarchy", "Performance-optimized commerce flows"],
    accent: "violet",
    liveUrl: "https://elyscen.vercel.app/",
    githubUrl: "https://github.com/ayaan-fareed/elyscents",
  },
  {
    id: "02",
    slug: "beads",
    title: "Beads",
    category: "Jewellery / E-commerce",
    year: "2025",
    role: "Frontend + Supabase",
    technologies: ["React", "TypeScript", "Supabase", "Tailwind CSS"],
    description: "Jewellery e-commerce platform with interactive product browsing, real-time inventory, and Supabase backend integration.",
    longDescription:
      "A customized jewellery shopping portal engineered with React and TypeScript, powered by Supabase as the third-party backend/database service. Implements real-time cart synchronization, user authentication, and fluid mobile-first interactions.",
    highlights: ["Supabase backend integration", "Real-time state & inventory", "High-conversion jewellery showcase"],
    accent: "orange",
    liveUrl: "https://beads-fe.vercel.app/",
    githubUrl: "https://github.com/ayaan-fareed",
  },
  {
    id: "03",
    slug: "logistics",
    title: "Logistics OS",
    category: "Logistics / Transportation",
    year: "2025",
    role: "Frontend + Strapi CMS",
    technologies: ["Next.js", "TypeScript", "Strapi", "REST APIs"],
    description: "Logistics platform with real-time tracking, freight management, operations workflows, and Strapi CMS integration.",
    longDescription:
      "A mission-critical transportation and fleet operations management platform built with Next.js and TypeScript, integrating Strapi as the headless CMS and API engine. Features interactive shipment tracking, routing dashboards, and responsive dispatch interfaces.",
    highlights: ["Strapi CMS & REST API integration", "Operations tracking dashboard", "Dense data presentation made legible"],
    accent: "blue",
    liveUrl: "https://logistic-web-pearl.vercel.app/",
    githubUrl: "https://github.com/ayaan-fareed",
  },
];

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}

export function getNextProject(slug: string) {
  const index = projects.findIndex((p) => p.slug === slug);
  return projects[(index + 1) % projects.length];
}
