import * as THREE from "three";
import type { QualitySettings } from "@/three/utilities/quality";
import { CodeScreenTexture } from "@/three/utilities/CodeScreenTexture";

const C = {
  wood: "#9c6f44",
  woodDark: "#3d2b1a",
  desktop: "#181a24",
  deskTrim: "#252838",
  metal: "#2a2d3d",
  screen: "#0c101c",
  lampGold: "#ffbe5c",
  chairDark: "#13151f",
  chairCushion: "#1c1f2e",
  plantGreen: "#38bdf8",
  leafGreen: "#4ade80",
  orbPurple: "#a855f7",
};

export class Workspace {
  readonly root = new THREE.Group();
  readonly seat = new THREE.Vector3();
  private codeTexture: CodeScreenTexture;
  private floatingOrb: THREE.Mesh;
  private lampLight: THREE.PointLight;
  private plantLeaves: THREE.Mesh[] = [];

  constructor(private quality: QualitySettings) {
    const std = (color: string, extra: Partial<THREE.MeshStandardMaterialParameters> = {}) =>
      new THREE.MeshStandardMaterial({ color, roughness: 0.7, metalness: 0.1, ...extra });
    const g = this.root;

    this.codeTexture = new CodeScreenTexture();

    // ─── Room Back Wall & Wooden Floor ─────────────────────────────────────────
    // Dark navy back wall
    const backWall = new THREE.Mesh(
      new THREE.BoxGeometry(14, 8, 0.2),
      std("#090d1a", { roughness: 0.95, metalness: 0.05 })
    );
    backWall.position.set(0, 3.2, -1.5);
    g.add(backWall);

    // Warm dark wooden floor slab
    const floor = new THREE.Mesh(
      new THREE.BoxGeometry(14, 0.6, 10),
      std("#141724", { roughness: 0.85, metalness: 0.1 })
    );
    floor.position.set(0, -0.3, 0.5);
    g.add(floor);

    // ─── Modern Developer Desk ────────────────────────────────────────────────
    // Thick dark matte desk top
    const deskTop = new THREE.Mesh(
      new THREE.BoxGeometry(3.6, 0.12, 1.35),
      std(C.desktop, { roughness: 0.45, metalness: 0.15 })
    );
    deskTop.position.set(0, 0.78, -0.32);
    g.add(deskTop);

    // Desk legs (sleek black metal frames)
    const legGeo = new THREE.BoxGeometry(0.06, 0.78, 1.25);
    [-1.65, 1.65].forEach((x) => {
      const legFrame = new THREE.Mesh(legGeo, std(C.metal, { roughness: 0.5, metalness: 0.6 }));
      legFrame.position.set(x, 0.39, -0.32);
      g.add(legFrame);
    });

    // ─── Primary Center Monitor (Live Code Editor) ─────────────────────────────
    const monitorGroup = new THREE.Group();
    monitorGroup.position.set(0.12, 0.84, -0.52);
    monitorGroup.rotation.y = -0.06;

    // Monitor frame (ultra-thin bezel)
    const mWidth = 1.45;
    const mHeight = 0.88;
    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(mWidth, mHeight, 0.05),
      std("#0f121d", { roughness: 0.3, metalness: 0.5 })
    );
    frame.position.y = 0.52;
    monitorGroup.add(frame);

    // Monitor screen with live CodeScreenTexture
    const codeScreenMat = new THREE.MeshBasicMaterial({
      map: this.codeTexture.texture,
    });
    const codeScreen = new THREE.Mesh(
      new THREE.PlaneGeometry(mWidth - 0.04, mHeight - 0.04),
      codeScreenMat
    );
    codeScreen.position.set(0, 0.52, 0.026);
    monitorGroup.add(codeScreen);

    // Monitor stand and heavy round base
    const neck = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.28, 0.06), std(C.metal, { metalness: 0.7 }));
    neck.position.set(0, 0.14, -0.03);
    monitorGroup.add(neck);

    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.26, 0.03, 32), std(C.metal, { metalness: 0.7 }));
    base.position.y = 0.015;
    monitorGroup.add(base);

    g.add(monitorGroup);

    // ─── Secondary Laptop / Vertical Screen on Left ───────────────────────────
    const laptopGroup = new THREE.Group();
    laptopGroup.position.set(-1.15, 0.85, -0.28);
    laptopGroup.rotation.set(0, 0.42, 0);

    // Laptop base
    const lBase = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.02, 0.38), std("#2d3142", { metalness: 0.7 }));
    laptopGroup.add(lBase);

    // Laptop screen angled open
    const lScreenFrame = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.38, 0.018), std("#1c1f2e", { metalness: 0.6 }));
    lScreenFrame.position.set(0, 0.18, -0.18);
    lScreenFrame.rotation.x = -0.32;
    laptopGroup.add(lScreenFrame);

    // Glowing screen showing terminal
    const lScreen = new THREE.Mesh(
      new THREE.PlaneGeometry(0.52, 0.34),
      new THREE.MeshBasicMaterial({ color: "#00d2ff" })
    );
    lScreen.position.set(0, 0.18, -0.169);
    lScreen.rotation.x = -0.32;
    laptopGroup.add(lScreen);

    g.add(laptopGroup);

    // ─── Keyboard & Mouse ─────────────────────────────────────────────────────
    const keyboardGroup = new THREE.Group();
    keyboardGroup.position.set(0.08, 0.845, -0.06);

    const kbBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.72, 0.026, 0.24),
      std("#1c1e2b", { roughness: 0.5, metalness: 0.3 })
    );
    keyboardGroup.add(kbBody);

    // Subtle dark keycap grid
    const keycaps = new THREE.Mesh(
      new THREE.BoxGeometry(0.68, 0.012, 0.2),
      std("#2e3247", { roughness: 0.6 })
    );
    keycaps.position.y = 0.016;
    keyboardGroup.add(keycaps);

    g.add(keyboardGroup);

    // Mouse & Mousepad
    const mousepad = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.005, 0.4),
      std("#10121a", { roughness: 0.9 })
    );
    mousepad.position.set(0.2, 0.842, -0.06);
    g.add(mousepad);

    const mouse = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.045, 0.06, 4, 10),
      std("#2b2f42", { roughness: 0.4 })
    );
    mouse.rotation.x = Math.PI / 2;
    mouse.position.set(0.62, 0.86, -0.06);
    mouse.scale.y = 0.55;
    g.add(mouse);

    // ─── Ayaan's Signature Coffee Mug with White Triangle Logo ─────────────────
    const mug = new THREE.Mesh(
      new THREE.CylinderGeometry(0.085, 0.075, 0.18, 24),
      std("#161822", { roughness: 0.3 })
    );
    mug.position.set(-0.55, 0.93, -0.15);
    g.add(mug);

    // Triangle logo on mug
    const mugLogo = new THREE.Mesh(
      new THREE.CircleGeometry(0.035, 3),
      new THREE.MeshBasicMaterial({ color: "#ffffff" })
    );
    mugLogo.rotation.y = Math.PI / 2;
    mugLogo.position.set(-0.464, 0.93, -0.15);
    g.add(mugLogo);

    // ─── Desk Lamp with Warm Glow ─────────────────────────────────────────────
    const lampGroup = new THREE.Group();
    lampGroup.position.set(1.15, 0.84, -0.45);

    const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.03, 24), std(C.metal, { metalness: 0.8 }));
    lampGroup.add(lampBase);

    const lampStem = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.58, 12), std(C.metal, { metalness: 0.8 }));
    lampStem.position.set(0, 0.3, 0);
    lampStem.rotation.z = -0.18;
    lampGroup.add(lampStem);

    const lampShade = new THREE.Mesh(
      new THREE.ConeGeometry(0.14, 0.22, 24, 1, true),
      std(C.metal, { roughness: 0.4, emissive: new THREE.Color("#ffa63d"), emissiveIntensity: 0.3 })
    );
    lampShade.position.set(-0.06, 0.58, 0);
    lampShade.rotation.z = Math.PI / 3;
    lampGroup.add(lampShade);

    // Warm point light casting cinematic rim light
    this.lampLight = new THREE.PointLight("#ffb05c", 1.8, 4.5, 1.2);
    this.lampLight.position.set(-0.12, 0.54, 0);
    lampGroup.add(this.lampLight);

    g.add(lampGroup);

    // ─── "Keep Building" Framed Wall Art ──────────────────────────────────────
    const posterGroup = new THREE.Group();
    posterGroup.position.set(1.4, 2.3, -1.38);

    const pFrame = new THREE.Mesh(
      new THREE.BoxGeometry(1.0, 1.35, 0.04),
      std("#0a0c14", { roughness: 0.4 })
    );
    posterGroup.add(pFrame);

    // Poster canvas texture
    const posterCanvas = document.createElement("canvas");
    posterCanvas.width = 512;
    posterCanvas.height = 680;
    const pCtx = posterCanvas.getContext("2d");
    if (pCtx) {
      pCtx.fillStyle = "#1e2230";
      pCtx.fillRect(0, 0, 512, 680);

      // Subtle warm gradient
      const grad = pCtx.createLinearGradient(0, 0, 512, 680);
      grad.addColorStop(0, "#252b3e");
      grad.addColorStop(1, "#141724");
      pCtx.fillStyle = grad;
      pCtx.fillRect(20, 20, 472, 640);

      pCtx.fillStyle = "#ffffff";
      pCtx.font = "bold 52px sans-serif";
      pCtx.fillText("Keep", 70, 240);
      pCtx.fillText("building", 70, 310);

      pCtx.fillStyle = "#38bdf8";
      pCtx.beginPath();
      pCtx.arc(400, 220, 16, 0, Math.PI * 2);
      pCtx.fill();
    }
    const posterTex = new THREE.CanvasTexture(posterCanvas);
    const posterMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(0.92, 1.27),
      new THREE.MeshBasicMaterial({ map: posterTex })
    );
    posterMesh.position.z = 0.022;
    posterGroup.add(posterMesh);

    g.add(posterGroup);

    // ─── Wall Shelves with Books and Plant ────────────────────────────────────
    const shelf = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 0.05, 0.34),
      std(C.woodDark, { roughness: 0.8 })
    );
    shelf.position.set(-0.85, 2.4, -1.35);
    g.add(shelf);

    // Books on shelf
    ["#3b82f6", "#f97316", "#a855f7"].forEach((c, i) => {
      const book = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.36 - i * 0.03, 0.24), std(c));
      book.position.set(-1.25 + i * 0.11, 2.6, -1.35);
      g.add(book);
    });

    // Small succulent pot on shelf
    const sPot = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.07, 0.14, 16), std("#24283b"));
    sPot.position.set(-0.55, 2.5, -1.35);
    g.add(sPot);

    const plant = new THREE.Mesh(new THREE.DodecahedronGeometry(0.11), std("#22c55e", { roughness: 0.6 }));
    plant.position.set(-0.55, 2.63, -1.35);
    g.add(plant);

    // ─── Floating Glowing Purple Orb ──────────────────────────────────────────
    this.floatingOrb = new THREE.Mesh(
      new THREE.SphereGeometry(0.16, 32, 32),
      new THREE.MeshStandardMaterial({
        color: C.orbPurple,
        emissive: new THREE.Color("#9333ea"),
        emissiveIntensity: 0.75,
        roughness: 0.2,
      })
    );
    this.floatingOrb.position.set(-1.8, 1.45, 0.6);
    g.add(this.floatingOrb);

    // ─── Ergonomic Office Chair ───────────────────────────────────────────────
    const chair = new THREE.Group();
    chair.position.set(0.08, 0, 0.74);

    // Seat cushion
    const seat = new THREE.Mesh(
      new THREE.BoxGeometry(0.64, 0.1, 0.6),
      std(C.chairCushion, { roughness: 0.6 })
    );
    seat.position.y = 0.48;
    chair.add(seat);

    // Ergonomic curved backrest
    const back = new THREE.Mesh(
      new THREE.BoxGeometry(0.58, 0.72, 0.08),
      std(C.chairDark, { roughness: 0.6 })
    );
    back.position.set(0, 0.88, 0.31);
    back.rotation.x = -0.14;
    chair.add(back);

    // Center post & 5-star wheeled base
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.42, 12), std(C.metal, { metalness: 0.8 }));
    post.position.y = 0.23;
    chair.add(post);

    const baseHub = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.05, 12), std(C.metal, { metalness: 0.8 }));
    baseHub.position.y = 0.06;
    chair.add(baseHub);

    for (let i = 0; i < 5; i++) {
      const angle = (i * Math.PI * 2) / 5;
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.32), std(C.metal, { metalness: 0.8 }));
      leg.position.set(Math.sin(angle) * 0.16, 0.06, Math.cos(angle) * 0.16);
      leg.rotation.y = angle;
      chair.add(leg);
    }

    g.add(chair);
    this.seat.set(0.08, 0, 0.72);

    g.traverse((o) => {
      o.frustumCulled = false;
    });
  }

  update(time: number, dt: number, motionScale: number, isTyping = true) {
    // Update live monitor code editor texture
    this.codeTexture.update(dt, isTyping);

    // Floating orb bobbing gently in space
    this.floatingOrb.position.y = 1.45 + Math.sin(time * 1.8) * 0.06 * motionScale;

    // Subtle breathing pulse in lamp intensity
    this.lampLight.intensity = 1.7 + Math.sin(time * 2.2) * 0.15;
  }

  dispose() {
    this.codeTexture.dispose();
  }
}
