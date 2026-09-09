import * as THREE from "three";
import type { QualitySettings } from "@/three/utilities/quality";

const C = {
  wood: "#d9b58a",
  woodDark: "#b9905f",
  white: "#f7f3ec",
  grey: "#8d8f98",
  dark: "#2a2b31",
  screen: "#1b1d2a",
  rug: "#e59a3c",
  rugInner: "#f2b455",
  rugCore: "#c8782a",
  plant: "#7cc242",
  pot: "#b79274",
  board: "#a37d5c",
  note: "#8fb8ff",
  noteB: "#ffe08a",
  book1: "#4d7cff",
  book2: "#ff8a3d",
  book3: "#f6c94b",
  chairSeat: "#f4f0e8",
  chairFrame: "#6d7078",
};

export class Workspace {
  readonly root = new THREE.Group();
  readonly seat = new THREE.Vector3();
  private screenMats: THREE.MeshStandardMaterial[] = [];
  private codeMats: THREE.MeshBasicMaterial[] = [];
  private plantLeaves: THREE.Mesh[] = [];

  constructor(private quality: QualitySettings) {
    const std = (color: string, extra: Partial<THREE.MeshStandardMaterialParameters> = {}) =>
      new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0.02, ...extra });
    const g = this.root;

    // Room slab: the floor the office sits on, visible from below when the camera descends
    const slab = new THREE.Mesh(new THREE.BoxGeometry(11, 0.7, 7.5), std("#f8f1e6", { roughness: 1 }));
    slab.position.set(-0.6, -0.36, -0.2);
    g.add(slab);
    const slabEdge = new THREE.Mesh(new THREE.BoxGeometry(11.2, 0.12, 7.7), std("#e7dccb", { roughness: 1 }));
    slabEdge.position.set(-0.6, -0.72, -0.2);
    g.add(slabEdge);

    // Rug (layered rounded rectangles)
    const rugLayer = (w: number, d: number, y: number, color: string) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.02, d), std(color, { roughness: 1 }));
      m.position.y = y;
      m.rotation.y = -0.14;
      g.add(m);
    };
    rugLayer(4.6, 3.6, 0.0, C.rug);
    rugLayer(3.6, 2.8, 0.012, C.rugInner);
    rugLayer(2.6, 2.0, 0.024, C.rugCore);

    // Desk
    const top = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.1, 1.1), std(C.white, { roughness: 0.5 }));
    top.position.set(0, 0.78, -0.3);
    g.add(top);
    const legGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.78, 10);
    [[-1.45, -0.75], [1.45, -0.75], [-1.45, 0.1], [1.45, 0.1]].forEach(([x, z]) => {
      const leg = new THREE.Mesh(legGeo, std(C.woodDark));
      leg.position.set(x, 0.39, z);
      g.add(leg);
    });

    // Monitors
    const makeMonitor = (x: number, w: number, rotY: number) => {
      const group = new THREE.Group();
      group.position.set(x, 0.83, -0.55);
      group.rotation.y = rotY;
      const frame = new THREE.Mesh(new THREE.BoxGeometry(w, w * 0.62, 0.06), std(C.dark, { roughness: 0.4 }));
      frame.position.y = 0.55;
      group.add(frame);
      const screenMat = std(C.screen, { roughness: 0.25, emissive: new THREE.Color("#0f1220"), emissiveIntensity: 0.9 });
      this.screenMats.push(screenMat);
      const screen = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.1, w * 0.62 - 0.1), screenMat);
      screen.position.set(0, 0.55, 0.031);
      group.add(screen);
      // code lines
      const lineColors = ["#8b6cff", "#ffb35c", "#4fd6ff", "#9ee37d", "#ff7c93"];
      const lines = 9;
      for (let i = 0; i < lines; i++) {
        const lw = (0.25 + ((i * 37) % 60) / 100) * (w - 0.3) * 0.55;
        const mat = new THREE.MeshBasicMaterial({ color: lineColors[i % lineColors.length], transparent: true, opacity: 0.85 });
        this.codeMats.push(mat);
        const line = new THREE.Mesh(new THREE.PlaneGeometry(lw, 0.022), mat);
        const offsetX = -(w - 0.3) / 2 + lw / 2 + (i % 3) * 0.06;
        line.position.set(offsetX, 0.55 + (w * 0.62 - 0.3) / 2 - i * 0.055, 0.034);
        group.add(line);
      }
      const neck = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.26, 0.05), std(C.dark));
      neck.position.set(0, 0.13, -0.02);
      group.add(neck);
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.24, 0.03, 20), std(C.dark));
      base.position.y = 0.015;
      group.add(base);
      g.add(group);
    };
    makeMonitor(-0.72, 1.1, 0.22);
    makeMonitor(0.72, 1.1, -0.22);

    // Keyboard + mouse
    const keyboard = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.03, 0.24), std("#e9e5dd", { roughness: 0.5 }));
    keyboard.position.set(0.05, 0.845, -0.05);
    g.add(keyboard);
    const mouse = new THREE.Mesh(new THREE.CapsuleGeometry(0.045, 0.06, 4, 10), std("#e9e5dd"));
    mouse.rotation.x = Math.PI / 2;
    mouse.position.set(0.6, 0.86, -0.05);
    mouse.scale.y = 0.6;
    g.add(mouse);

    // Mug with pencils
    const mug = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.2, 16), std("#f0e9df"));
    mug.position.set(-1.25, 0.93, -0.35);
    g.add(mug);
    ["#ff6a5c", "#4d7cff", "#ffd15c"].forEach((c, i) => {
      const pencil = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.32, 6), std(c));
      pencil.position.set(-1.25 + (i - 1) * 0.035, 1.1, -0.35 + (i % 2) * 0.03);
      pencil.rotation.z = (i - 1) * 0.18;
      g.add(pencil);
    });

    // Small speaker + rubik cube
    const speaker = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.3, 0.16), std("#f3a34a", { roughness: 0.7 }));
    speaker.position.set(1.32, 0.98, -0.5);
    g.add(speaker);
    const cube = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.16, 0.16), std("#2f6bff", { roughness: 0.4 }));
    cube.position.set(1.08, 0.91, -0.15);
    cube.rotation.y = 0.5;
    g.add(cube);

    // Shelf with books and plant
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.06, 0.32), std(C.wood));
    shelf.position.set(-1.05, 2.15, -0.95);
    g.add(shelf);
    [C.book1, C.book2, C.book3].forEach((c, i) => {
      const book = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.42 - i * 0.04, 0.26), std(c));
      book.position.set(-1.38 + i * 0.1, 2.39 - i * 0.02, -0.95);
      g.add(book);
    });
    const smallPot = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.07, 0.14, 12), std("#f7f3ec"));
    smallPot.position.set(-0.8, 2.25, -0.95);
    g.add(smallPot);
    const succulent = new THREE.Mesh(new THREE.IcosahedronGeometry(0.1, 1), std(C.plant, { flatShading: true }));
    succulent.position.set(-0.8, 2.38, -0.95);
    g.add(succulent);

    // Wall board with notes
    const board = new THREE.Mesh(new THREE.BoxGeometry(1.7, 1.15, 0.05), std(C.board, { roughness: 1 }));
    board.position.set(0.55, 2.35, -1.0);
    board.rotation.y = -0.06;
    g.add(board);
    const boardFrame = new THREE.Mesh(new THREE.BoxGeometry(1.82, 1.27, 0.03), std(C.wood));
    boardFrame.position.set(0.55, 2.35, -1.02);
    boardFrame.rotation.y = -0.06;
    g.add(boardFrame);
    [
      [-0.35, 0.2, C.note, 0.32, 0.36],
      [0.45, -0.15, "#ffffff", 0.3, 0.4],
      [0.05, 0.25, C.noteB, 0.24, 0.22],
    ].forEach(([x, y, c, w, h]) => {
      const note = new THREE.Mesh(new THREE.PlaneGeometry(w as number, h as number), std(c as string, { roughness: 1 }));
      note.position.set(0.55 + (x as number), 2.35 + (y as number), -0.97 + (x as number) * 0.06);
      note.rotation.y = -0.06;
      note.rotation.z = (x as number) * 0.15;
      g.add(note);
      const pin = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 10), std("#e4404b", { roughness: 0.3 }));
      pin.position.set(note.position.x, note.position.y + (h as number) / 2 - 0.02, note.position.z + 0.03);
      g.add(pin);
    });

    // Picture frame right
    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.5, 0.06), std("#3e6fe0", { roughness: 0.6 }));
    frame.position.set(2.15, 2.0, -0.95);
    frame.rotation.y = -0.25;
    g.add(frame);
    const picture = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.38), std("#e8eefc"));
    picture.position.set(2.15, 2.0, -0.915);
    picture.rotation.y = -0.25;
    g.add(picture);

    // Floor plant
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.22, 0.5, 18), std(C.pot, { roughness: 0.9 }));
    pot.position.set(2.35, 0.25, 0.25);
    g.add(pot);
    for (let i = 0; i < 5; i++) {
      const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.9, 6), std(C.plant, { roughness: 0.6 }));
      leaf.position.set(2.35 + Math.cos(i * 1.25) * 0.12, 0.85, 0.25 + Math.sin(i * 1.25) * 0.12);
      leaf.rotation.set(Math.sin(i) * 0.5, i * 1.25, Math.cos(i) * 0.5);
      leaf.scale.set(1, 1, 0.35);
      this.plantLeaves.push(leaf);
      g.add(leaf);
    }

    // Chair
    const chair = new THREE.Group();
    chair.position.set(0, 0, 0.75);
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.08, 0.6), std(C.chairSeat, { roughness: 0.6 }));
    seat.position.y = 0.48;
    chair.add(seat);
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.66, 0.08), std(C.chairSeat, { roughness: 0.6 }));
    back.position.set(0, 0.86, 0.3);
    back.rotation.x = -0.12;
    chair.add(back);
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.42, 10), std(C.chairFrame, { metalness: 0.4, roughness: 0.4 }));
    post.position.y = 0.24;
    chair.add(post);
    const sled = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.025, 8, 24, Math.PI), std(C.chairFrame, { metalness: 0.4, roughness: 0.4 }));
    sled.rotation.z = Math.PI;
    sled.position.y = 0.3;
    chair.add(sled);
    g.add(chair);
    this.seat.set(0, 0, 0.72);

    g.traverse((o) => {
      o.frustumCulled = false;
    });
  }

  update(time: number, motionScale: number) {
    const flicker = 0.85 + Math.sin(time * 3.1) * 0.05 + Math.sin(time * 7.3) * 0.03;
    for (const m of this.screenMats) m.emissiveIntensity = flicker;
    this.codeMats.forEach((m, i) => {
      m.opacity = 0.55 + 0.4 * (0.5 + 0.5 * Math.sin(time * 1.7 + i * 0.9));
    });
    this.plantLeaves.forEach((leaf, i) => {
      leaf.rotation.z = Math.cos(i) * 0.5 + Math.sin(time * 1.2 + i) * 0.04 * motionScale;
    });
  }
}
