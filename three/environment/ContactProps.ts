import * as THREE from "three";
import { TerminalScreenTexture } from "@/three/utilities/TerminalScreenTexture";

const CARD = "#d6be9f";
const CARD_DARK = "#be9f7e";
const TAPE = "#af8f6e";
const PAPER = "#fbf9f5";
const PLANT_POT = "#cc9068";
const PLANT_GREEN = "#55aa48";

export class ContactProps {
  readonly root = new THREE.Group();
  private terminalTexture: TerminalScreenTexture;

  constructor() {
    this.terminalTexture = new TerminalScreenTexture();

    const std = (color: string, roughness = 0.85, extra: Partial<THREE.MeshStandardMaterialParameters> = {}) =>
      new THREE.MeshStandardMaterial({ color, roughness, metalness: 0.05, ...extra });

    const box = (x: number, y: number, z: number, w: number, h: number, d: number, rotY: number, dark = false) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), std(dark ? CARD_DARK : CARD));
      m.position.set(x, y + h / 2, z);
      m.rotation.y = rotY;
      this.root.add(m);

      // Packing tape on box
      const tape = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.92, 0.07), std(TAPE, 0.95));
      tape.position.set(0, h / 2 + 0.002, 0);
      tape.rotation.x = -Math.PI / 2;
      m.add(tape);

      // White shipping label
      const label = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.28, h * 0.25), std(PAPER, 0.95));
      label.position.set(w * 0.2, h * 0.12, d / 2 + 0.002);
      m.add(label);

      return m;
    };

    // ─── Seat Box (Directly underneath Ayaan) ──────────────────────────────────
    box(1.4, 0, 0.82, 0.75, 0.44, 0.7, -0.15);

    // Stacked side cardboard boxes (matching reference image)
    box(2.2, 0, 0.65, 0.95, 0.55, 0.8, 0.12, true);
    box(2.15, 0.55, 0.62, 0.72, 0.42, 0.68, -0.08);
    box(2.85, 0, 0.95, 0.7, 0.48, 0.65, 0.35);

    // ─── Potted Floor Plant beside Ayaan ──────────────────────────────────────
    const potGroup = new THREE.Group();
    potGroup.position.set(0.55, 0, 1.05);

    const pot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.16, 0.38, 20),
      std(PLANT_POT, 0.8)
    );
    pot.position.y = 0.19;
    potGroup.add(pot);

    // Plant leaves
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI * 2) / 6;
      const leaf = new THREE.Mesh(
        new THREE.ConeGeometry(0.12, 0.65, 6),
        std(PLANT_GREEN, 0.6)
      );
      leaf.position.set(Math.sin(angle) * 0.08, 0.48, Math.cos(angle) * 0.08);
      leaf.rotation.set(Math.cos(angle) * 0.45, angle, -Math.sin(angle) * 0.45);
      leaf.scale.set(1, 1, 0.35);
      potGroup.add(leaf);
    }
    this.root.add(potGroup);

    // ─── Ayaan's Laptop with Live Terminal Screen ─────────────────────────────
    const laptop = new THREE.Group();
    laptop.position.set(1.4, 0.48, 1.06);
    laptop.rotation.set(-0.15, -0.18, 0.02);

    // Laptop base / keyboard body
    const baseWidth = 0.52;
    const baseDepth = 0.36;
    const baseHeight = 0.016;

    const lpBase = new THREE.Mesh(
      new THREE.BoxGeometry(baseWidth, baseHeight, baseDepth),
      std("#242735", 0.4, { metalness: 0.7 })
    );
    laptop.add(lpBase);

    // Trackpad
    const trackpad = new THREE.Mesh(
      new THREE.PlaneGeometry(0.16, 0.1),
      std("#1c1e29", 0.5, { metalness: 0.6 })
    );
    trackpad.rotation.x = -Math.PI / 2;
    trackpad.position.set(0, baseHeight / 2 + 0.001, 0.09);
    laptop.add(trackpad);

    // Laptop keyboard keys
    const lpKeys = new THREE.Mesh(
      new THREE.BoxGeometry(0.46, 0.005, 0.18),
      std("#12141c", 0.7)
    );
    lpKeys.position.set(0, baseHeight / 2 + 0.002, -0.055);
    laptop.add(lpKeys);

    // Laptop Screen Lid (Angled back open ~110 degrees)
    const lid = new THREE.Group();
    lid.position.set(0, baseHeight / 2, -baseDepth / 2);
    lid.rotation.x = -0.36; // open screen

    // Lid shell
    const lidMesh = new THREE.Mesh(
      new THREE.BoxGeometry(baseWidth, 0.35, 0.012),
      std("#242735", 0.4, { metalness: 0.7 })
    );
    lidMesh.position.y = 0.175;
    lid.add(lidMesh);

    // White Triangle Logo on back of lid
    const lidLogo = new THREE.Mesh(
      new THREE.CircleGeometry(0.028, 3),
      new THREE.MeshBasicMaterial({ color: "#ffffff" })
    );
    lidLogo.rotation.y = Math.PI;
    lidLogo.position.set(0, 0.175, -0.007);
    lid.add(lidLogo);

    // Screen Display running TerminalScreenTexture
    const screenMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(baseWidth - 0.03, 0.32),
      new THREE.MeshBasicMaterial({ map: this.terminalTexture.texture })
    );
    screenMesh.position.set(0, 0.175, 0.007);
    lid.add(screenMesh);

    laptop.add(lid);
    this.root.add(laptop);

    // ─── Wall Quote ("Good Ideas Build Great Products. ↗") ────────────────────
    const quoteCanvas = document.createElement("canvas");
    quoteCanvas.width = 512;
    quoteCanvas.height = 256;
    const qCtx = quoteCanvas.getContext("2d");
    if (qCtx) {
      qCtx.fillStyle = "#a89b8d";
      qCtx.font = "italic 32px 'Georgia', serif";
      qCtx.fillText("Good", 30, 60);
      qCtx.fillText("Ideas", 40, 105);
      qCtx.fillText("Build", 45, 150);
      qCtx.fillText("Great", 50, 195);
      qCtx.fillText("Products. ↗", 55, 235);
    }
    const quoteTex = new THREE.CanvasTexture(quoteCanvas);
    const quoteMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1.6, 0.8),
      new THREE.MeshBasicMaterial({ map: quoteTex, transparent: true, opacity: 0.75 })
    );
    quoteMesh.position.set(2.8, 1.6, 0.2);
    quoteMesh.rotation.y = -0.22;
    this.root.add(quoteMesh);

    // Soft ground shadow underneath boxes
    const shadow = new THREE.Mesh(
      new THREE.CircleGeometry(3.2, 32),
      new THREE.MeshBasicMaterial({ color: "#000000", transparent: true, opacity: 0.08, depthWrite: false })
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.set(1.6, 0.002, 0.8);
    this.root.add(shadow);

    this.root.traverse((o) => {
      o.frustumCulled = false;
    });
  }

  update(dt: number, isTyping = true) {
    this.terminalTexture.update(dt, isTyping);
  }

  dispose() {
    this.terminalTexture.dispose();
  }
}
