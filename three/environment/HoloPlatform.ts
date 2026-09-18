import * as THREE from "three";
import { HOLO_COLOR } from "@/three/materials/characterMaterial";
import type { QualitySettings } from "@/three/utilities/quality";

const gridVertex = /* glsl */ `
  varying vec3 vWorld;
  void main() {
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWorld = wp.xyz;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

const gridFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  uniform float uTime;
  varying vec3 vWorld;
  void main() {
    vec2 cell = fract(vWorld.xz * 0.6 + vec2(0.0, uTime * 0.02));
    vec2 d = min(cell, 1.0 - cell);
    float line = 1.0 - smoothstep(0.0, 0.03, min(d.x, d.y));
    vec2 dotCell = fract(vWorld.xz * 0.6 + 0.5 + vec2(0.0, uTime * 0.02));
    float dots = 1.0 - smoothstep(0.0, 0.05, length(dotCell - 0.5));
    float dist = length(vWorld.xz);
    float fade = 1.0 - smoothstep(4.0, 18.0, dist);
    float a = (line * 0.45 + dots * 0.9) * fade * uOpacity;
    gl_FragColor = vec4(uColor, a);
  }
`;

export class HoloPlatform {
  readonly root = new THREE.Group();
  private gridMat: THREE.ShaderMaterial;
  private discMats: THREE.Material[] = [];
  private ring: THREE.Mesh;
  private cone: THREE.Mesh;
  private coneMat: THREE.MeshBasicMaterial;
  private disc: THREE.Group;

  constructor(quality: QualitySettings) {
    this.gridMat = new THREE.ShaderMaterial({
      uniforms: { uColor: { value: new THREE.Color("#6fb7ff") }, uOpacity: { value: 0 }, uTime: { value: 0 } },
      vertexShader: gridVertex,
      fragmentShader: gridFragment,
      transparent: true,
      depthWrite: false,
    });
    const grid = new THREE.Mesh(new THREE.PlaneGeometry(40, 40, 1, 1), this.gridMat);
    grid.rotation.x = -Math.PI / 2;
    grid.position.y = -0.02;
    this.root.add(grid);

    this.disc = new THREE.Group();
    this.root.add(this.disc);

    const baseMat = new THREE.MeshStandardMaterial({ color: "#123a9a", roughness: 0.4, metalness: 0.3, transparent: true, opacity: 0 });
    const base = new THREE.Mesh(new THREE.CylinderGeometry(1.35, 1.45, 0.22, 48), baseMat);
    base.position.y = 0.11;
    this.disc.add(base);
    const topMat = new THREE.MeshBasicMaterial({ color: HOLO_COLOR, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
    const top = new THREE.Mesh(new THREE.CircleGeometry(1.3, 48), topMat);
    top.rotation.x = -Math.PI / 2;
    top.position.y = 0.225;
    this.disc.add(top);
    // Multiple concentric glowing neon rings
    const ringMat = new THREE.MeshBasicMaterial({ color: "#38bdf8", transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
    this.ring = new THREE.Mesh(new THREE.TorusGeometry(1.45, 0.02, 8, 96), ringMat);
    this.ring.rotation.x = Math.PI / 2;
    this.ring.position.y = 0.24;
    this.disc.add(this.ring);

    const outerRingMat = new THREE.MeshBasicMaterial({ color: "#2563eb", transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
    const outerRing = new THREE.Mesh(new THREE.TorusGeometry(1.85, 0.015, 8, 96), outerRingMat);
    outerRing.rotation.x = Math.PI / 2;
    outerRing.position.y = 0.12;
    this.disc.add(outerRing);

    const innerRingMat = new THREE.MeshBasicMaterial({ color: "#67e8f9", transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
    const innerRing = new THREE.Mesh(new THREE.TorusGeometry(1.05, 0.012, 8, 96), innerRingMat);
    innerRing.rotation.x = Math.PI / 2;
    innerRing.position.y = 0.235;
    this.disc.add(innerRing);

    this.discMats.push(baseMat, topMat, ringMat, outerRingMat, innerRingMat);

    // Floating faceted space rocks / asteroids flanking Ayaan (matching reference image)
    const rockGeo = new THREE.DodecahedronGeometry(0.55, 1);
    const rockMat = new THREE.MeshStandardMaterial({ color: "#172554", roughness: 0.8, metalness: 0.2, flatShading: true });

    const rockL = new THREE.Mesh(rockGeo, rockMat);
    rockL.position.set(-2.8, 1.8, -1.2);
    rockL.scale.set(1.1, 1.4, 0.9);
    this.root.add(rockL);

    const rockR = new THREE.Mesh(rockGeo, rockMat);
    rockR.position.set(2.8, 2.2, -1.0);
    rockR.scale.set(1.2, 1.5, 1.1);
    this.root.add(rockR);

    // Floating small glowing sphere
    const glowSphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 24, 24),
      new THREE.MeshStandardMaterial({ color: "#60a5fa", emissive: new THREE.Color("#2563eb"), emissiveIntensity: 1.2 })
    );
    glowSphere.position.set(1.4, 3.2, 0.2);
    this.root.add(glowSphere);

    this.coneMat = new THREE.MeshBasicMaterial({
      color: HOLO_COLOR,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.cone = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 1.28, 2.6, 40, 1, true), this.coneMat);
    this.cone.position.y = 1.52;
    this.disc.add(this.cone);

    this.root.traverse((o) => {
      o.frustumCulled = false;
    });
    void quality;
  }

  /** grid: 0..1 visibility of the world grid; platform: 0..1 visibility of the disc; beam: 0..1 hologram beam */
  set(grid: number, platform: number, beam: number) {
    this.gridMat.uniforms.uOpacity.value = grid;
    const [baseMat, topMat, ringMat] = this.discMats as [THREE.MeshStandardMaterial, THREE.MeshBasicMaterial, THREE.MeshBasicMaterial];
    baseMat.opacity = platform;
    topMat.opacity = platform * 0.35 + beam * 0.25;
    ringMat.opacity = platform * 0.6;
    this.coneMat.opacity = beam * 0.09;
    this.disc.visible = platform > 0.01;
    this.disc.scale.setScalar(0.85 + 0.15 * platform);
  }

  update(time: number, motionScale: number) {
    this.gridMat.uniforms.uTime.value = time * motionScale;
    this.ring.rotation.z = time * 0.2 * motionScale;
    this.ring.scale.setScalar(1 + Math.sin(time * 1.4) * 0.015 * motionScale);
  }
}
