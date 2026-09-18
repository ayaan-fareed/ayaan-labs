import * as THREE from "three";
import type { PoseName } from "@/three/character/Character";
import type { SectionId, Theme } from "@/lib/experienceStore";

/**
 * The world is arranged vertically. Scrolling descends through three levels:
 *   y =   0  → Ayaan's workspace / office (hero)
 *   y =  -6  → the digital hologram world (about)
 *   y = -13  → project floor & contact studio
 */
export const LEVEL = { office: 0, digital: -6, floor: -13 } as const;
export const PLATFORM_TOP = 0.225;

export type SceneState = {
  id: SectionId;
  theme: Theme;
  camera: THREE.Vector3;
  target: THREE.Vector3;
  fov: number;
  character: THREE.Vector3;
  characterRotY: number;
  pose: PoseName;
  holo: number;
  background: THREE.Color;
  grid: number;
  platform: number;
  beam: number;
  particles: number;
  propsX: number;
  ambient: THREE.Vector3;
  lightDir: THREE.Vector3;
};

const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const c = (hex: string) => new THREE.Color(hex);

export const WORKSPACE_POSITION = v(1.6, LEVEL.office, 0);

export const sceneStates: SceneState[] = [
  {
    // 01 — HERO (Dark cinematic blue workspace, Ayaan coding at desk)
    id: "top",
    theme: "dark",
    camera: v(-0.35, 1.72, 7.1),
    target: v(0.35, 1.05, 0),
    fov: 38,
    character: v(WORKSPACE_POSITION.x, LEVEL.office, 0.72),
    characterRotY: Math.PI,
    pose: "sitting",
    holo: 0,
    background: c("#0a0e1c"), // dark navy cinematic blue from reference
    grid: 0,
    platform: 0,
    beam: 0,
    particles: 0,
    propsX: 12,
    ambient: v(0.25, 0.28, 0.42),
    lightDir: v(0.6, 1, 0.8).normalize(),
  },
  {
    // 02 — DESCENT (Transition into digital space)
    id: "intro",
    theme: "dark",
    camera: v(0.2, LEVEL.digital + 1.9, 7.6),
    target: v(0.2, LEVEL.digital + 1.2, 0),
    fov: 38,
    character: v(-2.1, LEVEL.digital, 1.2),
    characterRotY: 0.4,
    pose: "standing",
    holo: 0,
    background: c("#081232"),
    grid: 1,
    platform: 0,
    beam: 0,
    particles: 0.6,
    propsX: 12,
    ambient: v(0.22, 0.26, 0.42),
    lightDir: v(0.3, 1, 0.9).normalize(),
  },
  {
    // 02 — ABOUT (Ayaan standing on glowing platform with floating tech pills)
    id: "about",
    theme: "dark",
    camera: v(0, LEVEL.digital + 1.25, 5.5),
    target: v(0, LEVEL.digital + 0.85, 0),
    fov: 38,
    character: v(0, LEVEL.digital + PLATFORM_TOP, 0),
    characterRotY: 0,
    pose: "standing",
    holo: 0.2,
    background: c("#06102e"),
    grid: 1,
    platform: 1,
    beam: 0.55,
    particles: 0.85,
    propsX: 12,
    ambient: v(0.22, 0.28, 0.46),
    lightDir: v(0.2, 1, 0.9).normalize(),
  },
  {
    // 03 — SKILLS (Clean light section: Built with modern tools)
    id: "skills",
    theme: "light",
    camera: v(0, LEVEL.digital + 1.35, 5.3),
    target: v(0, LEVEL.digital + 0.85, 0),
    fov: 38,
    character: v(0, LEVEL.digital + PLATFORM_TOP, 0),
    characterRotY: -0.08,
    pose: "presenting",
    holo: 0,
    background: c("#f5f6fa"), // light section matching reference
    grid: 0,
    platform: 0,
    beam: 0,
    particles: 0,
    propsX: 12,
    ambient: v(0.44, 0.42, 0.4),
    lightDir: v(0.4, 1, 0.8).normalize(),
  },
  {
    // 04 — PROJECTS (Dark section: Selected Work)
    id: "work",
    theme: "dark",
    camera: v(0, LEVEL.floor + 1.3, 8.2),
    target: v(0, LEVEL.floor + 0.8, 0),
    fov: 38,
    character: v(3.2, LEVEL.floor, 0.4),
    characterRotY: -0.35,
    pose: "standing",
    holo: 0,
    background: c("#070a14"), // dark section from reference
    grid: 0,
    platform: 0,
    beam: 0,
    particles: 0,
    propsX: 12,
    ambient: v(0.2, 0.22, 0.32),
    lightDir: v(0.6, 1, 0.8).normalize(),
  },
  {
    // 05 — CONTACT (Warm light studio: Ayaan sitting on boxes typing on laptop)
    id: "contact",
    theme: "light",
    camera: v(0.5, LEVEL.floor + 1.25, 6.2),
    target: v(1.1, LEVEL.floor + 0.8, 0),
    fov: 38,
    character: v(1.4, LEVEL.floor, 0.85),
    characterRotY: -0.18,
    pose: "crossed", // Seated on box with laptop typing
    holo: 0,
    background: c("#f4ede4"), // warm off-white cream from reference
    grid: 0,
    platform: 0,
    beam: 0,
    particles: 0,
    propsX: 0, // Props aligned at world coordinates
    ambient: v(0.46, 0.44, 0.42),
    lightDir: v(0.5, 1, 0.9).normalize(),
  },
];

export const sectionIds = sceneStates.map((s) => s.id);
