import * as THREE from "three";

const CARD = "#d8bfa2";
const CARD_DARK = "#c4a886";
const PAPER = "#f6f3ee";
const TAPE = "#b8977a";

export class ContactProps {
  readonly root = new THREE.Group();
  private envelopes: THREE.Mesh[] = [];

  constructor() {
    const std = (color: string, roughness = 0.9) => new THREE.MeshStandardMaterial({ color, roughness, metalness: 0 });

    const box = (x: number, y: number, z: number, w: number, h: number, d: number, rotY: number, dark = false) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), std(dark ? CARD_DARK : CARD));
      m.position.set(x, y + h / 2, z);
      m.rotation.y = rotY;
      this.root.add(m);
      const tape = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.9, 0.06), std(TAPE, 1));
      tape.position.set(0, h / 2 + 0.002, 0);
      tape.rotation.x = -Math.PI / 2;
      m.add(tape);
      const label = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.28, h * 0.22), std(PAPER, 1));
      label.position.set(w * 0.2, h * 0.15, d / 2 + 0.002);
      m.add(label);
      return m;
    };

    // Stacked boxes on the right side
    box(2.6, 0, -0.4, 1.7, 0.95, 1.1, -0.18);
    box(2.75, 0.95, -0.55, 1.05, 0.6, 0.75, 0.12, true);
    box(1.35, 0, 0.1, 0.85, 0.5, 0.65, 0.35, true);
    box(3.0, 0, 1.2, 1.35, 0.85, 0.95, 0.4);
    box(2.15, 0, 1.55, 0.55, 0.42, 0.45, -0.25, true);

    // Scattered envelopes
    const env = (x: number, z: number, rot: number) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(0.44, 0.3), std(PAPER, 0.8));
      m.rotation.set(-Math.PI / 2, 0, rot);
      m.position.set(x, 0.006, z);
      this.root.add(m);
      const flap = new THREE.Mesh(new THREE.PlaneGeometry(0.44, 0.15), std("#e4e0d9", 0.8));
      flap.rotation.set(-Math.PI / 2, 0, rot);
      flap.position.set(x, 0.009, z);
      this.root.add(flap);
      this.envelopes.push(m);
    };
    env(-1.7, 1.6, 0.4);
    env(-0.9, 0.4, -0.3);
    env(1.6, 1.1, 0.9);
    env(3.6, 0.6, -0.5);
    env(0.8, 2.1, 0.2);

    // Soft ground shadow
    const shadow = new THREE.Mesh(
      new THREE.CircleGeometry(4.5, 40),
      new THREE.MeshBasicMaterial({ color: "#000000", transparent: true, opacity: 0.05, depthWrite: false }),
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.set(1.4, 0.002, 0.4);
    this.root.add(shadow);

    this.root.traverse((o) => {
      o.frustumCulled = false;
    });
  }
}
