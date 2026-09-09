export type SkillGroup = {
  id: string;
  label: string;
  items: string[];
};

export const skillGroups: SkillGroup[] = [
  { id: "frontend", label: "Frontend", items: ["Next.js", "React", "TypeScript", "JavaScript"] },
  { id: "3d", label: "3D / WebGL", items: ["Three.js", "WebGL", "GLSL", "GSAP"] },
  { id: "backend", label: "Backend", items: ["Node.js", "REST APIs", "Vercel"] },
  { id: "uiux", label: "UI / UX", items: ["Figma", "Prototyping", "Design systems", "Motion"] },
  { id: "tools", label: "Tools", items: ["Git", "SCSS", "Tailwind", "Lenis"] },
];

export const headlineSkills = ["Three.js & WebGL", "Next.js & React", "TypeScript", "GSAP motion", "UI / UX systems"];
