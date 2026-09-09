import * as THREE from "three";
import type { PoseName } from "@/three/character/Character";
import type { SectionId, Theme } from "@/lib/experienceStore";

/**
 * The world is arranged vertically. Scrolling descends through three levels:
 *   y =   0  → the office (hero)
 *   y =  -6  → the digital / hologram world (intro, about, skills)
 *   y = -13  → the project floor and the contact scene
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
export const CREAM = "#f3ebe0";
export const BLUE = "#0c2f8a";

export const sceneStates: SceneState[] = [
  {
    id: "top",
    theme: "light",
    camera: v(-0.5, 1.75, 7.3),
    target: v(0.25, 1.0, 0),
    fov: 38,
    character: v(WORKSPACE_POSITION.x, LEVEL.office, 0.72),
    characterRotY: Math.PI,
    pose: "sitting",
    holo: 0,
    background: c(CREAM),
    grid: 0,
    platform: 0,
    beam: 0,
    particles: 0,
    propsX: 12,
    ambient: v(0.4, 0.38, 0.36),
    lightDir: v(0.6, 1, 0.8).normalize(),
  },
  {
    id: "intro",
    theme: "dark",
    camera: v(0.2, LEVEL.digital + 1.9, 7.6),
    target: v(0.2, LEVEL.digital + 1.2, 0),
    fov: 38,
    character: v(-2.1, LEVEL.digital, 1.2),
    characterRotY: 0.4,
    pose: "standing",
    holo: 0,
    background: c("#103596"),
    grid: 1,
    platform: 0,
    beam: 0,
    particles: 0.6,
    propsX: 12,
    ambient: v(0.22, 0.26, 0.42),
    lightDir: v(0.3, 1, 0.9).normalize(),
  },
  {
    id: "about",
    theme: "dark",
    camera: v(0, LEVEL.digital + 1.3, 5.6),
    target: v(0, LEVEL.digital + 0.85, 0),
    fov: 38,
    character: v(0, LEVEL.digital + PLATFORM_TOP, 0),
    characterRotY: 0,
    pose: "standing",
    holo: 0.32,
    background: c(BLUE),
    grid: 1,
    platform: 1,
    beam: 0.5,
    particles: 0.85,
    propsX: 12,
    ambient: v(0.2, 0.26, 0.44),
    lightDir: v(0.2, 1, 0.9).normalize(),
  },
  {
    id: "skills",
    theme: "dark",
    camera: v(0, LEVEL.digital + 1.35, 5.3),
    target: v(0, LEVEL.digital + 0.85, 0),
    fov: 38,
    character: v(0, LEVEL.digital + PLATFORM_TOP, 0),
    characterRotY: -0.08,
    pose: "presenting",
    holo: 1,
    background: c("#0a2a80"),
    grid: 1,
    platform: 1,
    beam: 1,
    particles: 1,
    propsX: 12,
    ambient: v(0.18, 0.24, 0.44),
    lightDir: v(0.2, 1, 0.9).normalize(),
  },
  {
    id: "work",
    theme: "light",
    camera: v(0, LEVEL.floor + 1.3, 8.2),
    target: v(0, LEVEL.floor + 0.8, 0),
    fov: 38,
    character: v(2.9, LEVEL.floor, 0.4),
    characterRotY: -0.35,
    pose: "standing",
    holo: 0,
    background: c(CREAM),
    grid: 0,
    platform: 0,
    beam: 0,
    particles: 0,
    propsX: 12,
    ambient: v(0.4, 0.38, 0.36),
    lightDir: v(0.6, 1, 0.8).normalize(),
  },
  {
    id: "contact",
    theme: "light",
    camera: v(0.9, LEVEL.floor + 1.1, 6.4),
    target: v(1.1, LEVEL.floor + 0.75, 0),
    fov: 38,
    character: v(1.35, LEVEL.floor, 0.9),
    characterRotY: -0.05,
    pose: "crossed",
    holo: 0,
    background: c("#efe6d9"),
    grid: 0,
    platform: 0,
    beam: 0,
    particles: 0,
    propsX: 2.0,
    ambient: v(0.42, 0.4, 0.38),
    lightDir: v(0.5, 1, 0.9).normalize(),
  },
];

export const sectionIds = sceneStates.map((s) => s.id);
