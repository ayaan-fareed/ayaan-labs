import * as THREE from "three";
import { damp } from "@/three/utilities/dispose";

/**
 * Cinematic camera: a scroll-derived target (position/lookAt/fov) plus a
 * subtle mouse offset, both eased towards with exponential damping so the
 * camera never snaps.
 */
export class CameraController {
  readonly camera: THREE.PerspectiveCamera;
  readonly targetPosition = new THREE.Vector3();
  readonly targetLookAt = new THREE.Vector3();
  targetFov = 38;
  mouseInfluence = 1;

  private position = new THREE.Vector3();
  private lookAt = new THREE.Vector3();
  private mouse = new THREE.Vector2();
  private mouseTarget = new THREE.Vector2();
  private fov = 38;
  private initialised = false;

  constructor(aspect: number) {
    this.camera = new THREE.PerspectiveCamera(38, aspect, 0.1, 80);
  }

  setMouse(x: number, y: number) {
    this.mouseTarget.set(x, y);
  }

  /** Jump straight to the target state (e.g. when landing on a hash deep link). */
  snap() {
    this.initialised = false;
  }

  resize(aspect: number) {
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
  }

  update(dt: number) {
    if (!this.initialised) {
      this.position.copy(this.targetPosition);
      this.lookAt.copy(this.targetLookAt);
      this.fov = this.targetFov;
      this.initialised = true;
    }
    const k = 3.2;
    this.position.x = damp(this.position.x, this.targetPosition.x, k, dt);
    this.position.y = damp(this.position.y, this.targetPosition.y, k, dt);
    this.position.z = damp(this.position.z, this.targetPosition.z, k, dt);
    this.lookAt.x = damp(this.lookAt.x, this.targetLookAt.x, k, dt);
    this.lookAt.y = damp(this.lookAt.y, this.targetLookAt.y, k, dt);
    this.lookAt.z = damp(this.lookAt.z, this.targetLookAt.z, k, dt);
    this.fov = damp(this.fov, this.targetFov, k, dt);

    this.mouse.x = damp(this.mouse.x, this.mouseTarget.x, 2.4, dt);
    this.mouse.y = damp(this.mouse.y, this.mouseTarget.y, 2.4, dt);

    const mx = this.mouse.x * 0.42 * this.mouseInfluence;
    const my = -this.mouse.y * 0.26 * this.mouseInfluence;

    this.camera.position.set(this.position.x + mx, this.position.y + my, this.position.z);
    this.camera.lookAt(this.lookAt.x + mx * 0.35, this.lookAt.y + my * 0.35, this.lookAt.z);
    if (Math.abs(this.camera.fov - this.fov) > 0.01) {
      this.camera.fov = this.fov;
      this.camera.updateProjectionMatrix();
    }
  }
}
