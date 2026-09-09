import * as THREE from "three";
import type { QualitySettings } from "@/three/utilities/quality";

export class Particles {
  readonly root: THREE.Points;
  private material: THREE.PointsMaterial;

  constructor(quality: QualitySettings) {
    const count = quality.particleCount;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const radius = 5 + Math.random() * 9;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.cos(phi) * 0.5 + 1.5;
      positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta) - 2;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    this.material = new THREE.PointsMaterial({
      color: "#9fd6ff",
      size: 0.035,
      transparent: true,
      opacity: 0,
      sizeAttenuation: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.root = new THREE.Points(geometry, this.material);
    this.root.frustumCulled = false;
  }

  set(opacity: number) {
    this.material.opacity = opacity * 0.7;
    this.root.visible = opacity > 0.005;
  }

  update(time: number, motionScale: number) {
    this.root.rotation.y = time * 0.02 * motionScale;
  }
}
