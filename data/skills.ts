export type SkillGroup = {
  id: string;
  label: string;
  icon: string;
  color: string;
  items: string[];
};

export const skillGroups: SkillGroup[] = [
  {
    id: "frontend",
    label: "Frontend",
    icon: "code",
    color: "#2b78ff",
    items: ["React", "Next.js", "TypeScript", "JavaScript", "Tailwind CSS", "Bootstrap"],
  },
  {
    id: "3d",
    label: "3D / WebGL",
    icon: "cube",
    color: "#00d2ff",
    items: ["Three.js", "GSAP", "GLSL", "WebGL"],
  },
  {
    id: "tools",
    label: "Tools",
    icon: "tool",
    color: "#9945ff",
    items: ["Git", "Vercel", "VS Code", "Figma", "Postman"],
  },
  {
    id: "backend",
    label: "Backend / Services",
    icon: "server",
    color: "#14f195",
    items: ["Supabase", "Strapi", "REST APIs", "Node.js"],
  },
];

export const floatingSkills = ["React", "Next.js", "TypeScript", "Tailwind", "GSAP", "Three.js"];
export const headlineSkills = ["Next.js & React", "TypeScript", "Three.js & WebGL", "Tailwind CSS", "Supabase & Strapi"];
