import * as THREE from "three";
import { createCharacterMaterial, type CharacterUniforms } from "@/three/materials/characterMaterial";
import type { QualitySettings } from "@/three/utilities/quality";
import { lerp, damp } from "@/three/utilities/dispose";

export type PoseName = "sitting" | "standing" | "presenting" | "crossed";

type JointPose = {
  torso: number;
  head: [number, number];
  armL: [number, number, number];
  armR: [number, number, number];
  forearmL: number;
  forearmR: number;
  wristL: [number, number];
  wristR: [number, number];
  hipL: number;
  hipR: number;
  kneeL: number;
  kneeR: number;
  rootY: number;
};

const POSES: Record<PoseName, JointPose> = {
  sitting: {
    torso: 0.16, // subtle forward lean towards keyboard/monitor
    head: [0.18, 0], // looking directly into center monitor
    armL: [-1.22, 0.26, -0.22], // hands comfortably positioned over keyboard
    armR: [-1.22, -0.26, 0.22],
    forearmL: -0.62,
    forearmR: -0.62,
    wristL: [0.22, 0.1],
    wristR: [0.22, -0.1],
    hipL: -1.52,
    hipR: -1.52,
    kneeL: 1.54,
    kneeR: 1.54,
    rootY: 0.17,
  },
  standing: {
    torso: 0,
    head: [0, 0],
    armL: [0.08, 0.05, -0.16],
    armR: [0.08, -0.05, 0.16],
    forearmL: -0.2,
    forearmR: -0.2,
    wristL: [0, 0],
    wristR: [0, 0],
    hipL: 0,
    hipR: 0,
    kneeL: 0,
    kneeR: 0,
    rootY: 0,
  },
  presenting: {
    torso: -0.02,
    head: [-0.04, 0],
    armL: [0.14, 0, -0.24],
    armR: [-0.96, 0.24, 1.05],
    forearmL: -0.18,
    forearmR: -1.25,
    wristL: [0, 0],
    wristR: [-0.2, 0.3],
    hipL: 0.02,
    hipR: -0.02,
    kneeL: 0,
    kneeR: 0,
    rootY: 0,
  },
  crossed: {
    // Used for the Contact section: seated naturally on cardboard boxes, holding/typing laptop on lap
    torso: 0.22, // leaning down towards laptop on lap
    head: [0.38, 0], // head angled down looking at laptop screen
    armL: [-1.34, 0.32, -0.32], // hands holding and resting on laptop keyboard
    armR: [-1.34, -0.32, 0.32],
    forearmL: -0.72,
    forearmR: -0.72,
    wristL: [0.3, 0.12],
    wristR: [0.3, -0.12],
    hipL: -1.48,
    hipR: -1.48,
    kneeL: 1.52,
    kneeR: 1.52,
    rootY: 0.14,
  },
};

export const CHARACTER_SCALE = 0.72;

// Ayaan's signature palette matching the reference image
const PALETTE = {
  skin: "#ba7b50", // warm medium brown developer skin
  skinWarm: "#cb8d62",
  hair: "#1b140e", // rich dark brown/black modern hair
  hoodie: "#15161c", // sleek matte dark black hoodie
  hoodieTrim: "#262834",
  logo: "#f8fafc", // crisp white triangle emblem
  pants: "#191a24", // dark slim trousers
  shoe: "#ffffff", // clean white sneakers
  sole: "#232630", // dark sole edge
  eyeWhite: "#ffffff",
  eyeIris: "#442714", // warm deep amber brown iris
  eyePupil: "#0c0a09",
  eyebrow: "#221710",
};

export class Character {
  readonly root = new THREE.Group();
  readonly anchors: Record<string, THREE.Object3D> = {};
  private materials: (THREE.ShaderMaterial & { uniforms: CharacterUniforms })[] = [];
  private joints: {
    torso: THREE.Group;
    head: THREE.Group;
    armL: THREE.Group;
    armR: THREE.Group;
    forearmL: THREE.Group;
    forearmR: THREE.Group;
    wristL: THREE.Group;
    wristR: THREE.Group;
    hipL: THREE.Group;
    hipR: THREE.Group;
    kneeL: THREE.Group;
    kneeR: THREE.Group;
  };
  private fingersL: THREE.Mesh[] = [];
  private fingersR: THREE.Mesh[] = [];
  private body: THREE.Group;
  private pose: JointPose = { ...POSES.standing };
  private lookTarget = new THREE.Vector2();
  private look = new THREE.Vector2();
  /** Current keystrike intensity (0 during thinking pauses), exposed for audio/sync. */
  typingActivity = 0;

  // Realistic typing state variables
  private pauseTimer = 0;
  private isThinking = false;
  private thinkDuration = 0;
  private burstTimer = 0;

  constructor(private quality: QualitySettings) {
    const seg = quality.sphereSegments;
    const cap = quality.capsuleSegments;

    const mat = (color: string) => {
      const m = createCharacterMaterial(color);
      this.materials.push(m);
      return m;
    };

    this.body = new THREE.Group();
    this.root.add(this.body);
    this.root.scale.setScalar(CHARACTER_SCALE);

    // ─── Legs (hip -> thigh -> knee -> shin -> clean sneakers) ───────────────
    const makeLeg = (side: 1 | -1) => {
      const hip = new THREE.Group();
      hip.position.set(side * 0.14, 0.62, 0);

      const thigh = new THREE.Mesh(new THREE.CapsuleGeometry(0.118, 0.28, 4, cap), mat(PALETTE.pants));
      thigh.position.y = -0.17;
      hip.add(thigh);

      const knee = new THREE.Group();
      knee.position.y = -0.34;
      hip.add(knee);

      const shin = new THREE.Mesh(new THREE.CapsuleGeometry(0.1, 0.22, 4, cap), mat(PALETTE.pants));
      shin.position.y = -0.12;
      knee.add(shin);

      // Sneaker Upper (Crisp White)
      const shoeGroup = new THREE.Group();
      shoeGroup.position.set(0, -0.28, 0.08);

      const shoe = new THREE.Mesh(new THREE.CapsuleGeometry(0.115, 0.18, 4, cap), mat(PALETTE.shoe));
      shoe.rotation.x = Math.PI / 2;
      shoe.scale.set(1.02, 1.05, 0.82);
      shoeGroup.add(shoe);

      // Sneaker Sole (Dark trim)
      const sole = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.052, 0.36), mat(PALETTE.sole));
      sole.position.set(0, -0.075, 0);
      shoeGroup.add(sole);

      // Sneaker front bumper toe cap
      const toeCap = new THREE.Mesh(new THREE.SphereGeometry(0.108, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.5), mat(PALETTE.shoe));
      toeCap.rotation.x = Math.PI / 2;
      toeCap.position.set(0, -0.03, 0.14);
      shoeGroup.add(toeCap);

      knee.add(shoeGroup);

      return { hip, knee };
    };

    const legL = makeLeg(-1);
    const legR = makeLeg(1);
    this.body.add(legL.hip, legR.hip);

    // ─── Torso (Hoodie with Kangaroo Pocket & White Triangle Emblem) ──────────
    const torso = new THREE.Group();
    torso.position.y = 0.62;
    this.body.add(torso);

    // Main Hoodie Body
    const hoodieBody = new THREE.Mesh(new THREE.CapsuleGeometry(0.32, 0.44, 6, cap * 2), mat(PALETTE.hoodie));
    hoodieBody.position.y = 0.38;
    hoodieBody.scale.set(1.02, 1, 0.85);
    torso.add(hoodieBody);

    // Waistband
    const waist = new THREE.Mesh(new THREE.CylinderGeometry(0.31, 0.28, 0.13, cap * 2), mat(PALETTE.pants));
    waist.position.y = 0.04;
    torso.add(waist);

    // Kangaroo Pocket on Front of Hoodie
    const pocket = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.16, 0.12), mat(PALETTE.hoodieTrim));
    pocket.position.set(0, 0.26, 0.25);
    torso.add(pocket);

    // Hood Collar around Neck
    const hoodCollar = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.08, 8, 24), mat(PALETTE.hoodieTrim));
    hoodCollar.rotation.x = Math.PI / 2 - 0.2;
    hoodCollar.position.set(0, 0.65, -0.04);
    torso.add(hoodCollar);

    // White Triangle Logo on Chest (Ayaan's signature brand)
    const logoShape = new THREE.Shape();
    logoShape.moveTo(0, 0.06);
    logoShape.lineTo(0.05, -0.03);
    logoShape.lineTo(-0.05, -0.03);
    logoShape.closePath();

    const logoGeo = new THREE.ShapeGeometry(logoShape);
    const logoMat = mat(PALETTE.logo);
    const logoMesh = new THREE.Mesh(logoGeo, logoMat);
    logoMesh.position.set(0, 0.44, 0.29);
    logoMesh.scale.setScalar(0.7);
    torso.add(logoMesh);

    // Hoodie Drawstrings hanging down
    const makeDrawstring = (side: 1 | -1) => {
      const stringMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.2, 6), mat(PALETTE.logo));
      stringMesh.position.set(side * 0.08, 0.52, 0.27);
      torso.add(stringMesh);
    };
    makeDrawstring(-1);
    makeDrawstring(1);

    // ─── Arms & Articulated Hands for Believable Typing ───────────────────────
    const makeArm = (side: 1 | -1) => {
      const shoulder = new THREE.Group();
      shoulder.position.set(side * 0.41, 0.66, 0);

      // Upper arm with hoodie sleeve
      const upper = new THREE.Mesh(new THREE.CapsuleGeometry(0.095, 0.22, 4, cap), mat(PALETTE.hoodie));
      upper.position.y = -0.15;
      shoulder.add(upper);

      const elbow = new THREE.Group();
      elbow.position.y = -0.3;
      shoulder.add(elbow);

      // Forearm with sleeve cuff
      const lower = new THREE.Mesh(new THREE.CapsuleGeometry(0.082, 0.2, 4, cap), mat(PALETTE.hoodie));
      lower.position.y = -0.13;
      elbow.add(lower);

      // Sleeve white/grey cuff
      const cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.086, 0.086, 0.04, 12), mat(PALETTE.hoodieTrim));
      cuff.position.y = -0.22;
      elbow.add(cuff);

      // Wrist joint for subtle pitch, roll and typing micro-motion
      const wrist = new THREE.Group();
      wrist.position.y = -0.26;
      elbow.add(wrist);

      // Palm (rounded skin box)
      const palm = new THREE.Mesh(new THREE.BoxGeometry(0.088, 0.038, 0.1), mat(PALETTE.skin));
      palm.position.set(0, -0.03, 0.02);
      wrist.add(palm);

      // Articulated Fingers for Typing
      const fingers: THREE.Mesh[] = [];
      const fingerCount = 4;
      for (let f = 0; f < fingerCount; f++) {
        const fingerX = (f - 1.5) * 0.022;
        const finger = new THREE.Mesh(new THREE.CapsuleGeometry(0.012, 0.042, 3, 6), mat(PALETTE.skin));
        finger.rotation.x = Math.PI / 2 - 0.2; // naturally curved towards keyboard
        finger.position.set(fingerX, -0.035, 0.075);
        wrist.add(finger);
        fingers.push(finger);
      }

      // Thumb
      const thumb = new THREE.Mesh(new THREE.CapsuleGeometry(0.014, 0.038, 3, 6), mat(PALETTE.skin));
      thumb.rotation.set(0.3, -side * 0.5, side * 0.4);
      thumb.position.set(-side * 0.042, -0.03, 0.035);
      wrist.add(thumb);

      return { shoulder, elbow, wrist, fingers };
    };

    const armL = makeArm(-1);
    const armR = makeArm(1);
    torso.add(armL.shoulder, armR.shoulder);
    this.fingersL = armL.fingers;
    this.fingersR = armR.fingers;

    // ─── Head & Stylized Pixar/CGI Face & Modern Hair ─────────────────────────
    const head = new THREE.Group();
    head.position.y = 1.02;
    torso.add(head);

    // Skull: smooth rounded stylized head
    const skull = new THREE.Mesh(new THREE.SphereGeometry(0.42, seg, seg), mat(PALETTE.skin));
    skull.position.y = 0.3;
    skull.scale.set(1, 1.05, 0.98);
    head.add(skull);

    // Stylized Chin & Jaw contour
    const jaw = new THREE.Mesh(new THREE.SphereGeometry(0.24, seg / 2, seg / 2), mat(PALETTE.skin));
    jaw.position.set(0, 0.14, 0.16);
    jaw.scale.set(0.95, 0.7, 0.9);
    head.add(jaw);

    // Large Expressive Eyes (Sclera + Amber/Brown Iris + Pupil + Specular Highlight)
    const makeExpressiveEye = (side: 1 | -1) => {
      const eyeGroup = new THREE.Group();
      eyeGroup.position.set(side * 0.145, 0.31, 0.365);

      // Sclera
      const white = new THREE.Mesh(new THREE.SphereGeometry(0.075, seg / 2, seg / 2), mat(PALETTE.eyeWhite));
      white.scale.set(1, 1.22, 0.65);
      eyeGroup.add(white);

      // Iris (Warm Deep Brown)
      const iris = new THREE.Mesh(new THREE.SphereGeometry(0.048, seg / 2, seg / 2), mat(PALETTE.eyeIris));
      iris.position.set(0, 0, 0.035);
      iris.scale.set(1, 1.25, 0.45);
      eyeGroup.add(iris);

      // Pupil (Obsidian)
      const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.028, seg / 2, seg / 2), mat(PALETTE.eyePupil));
      pupil.position.set(0, 0, 0.052);
      pupil.scale.set(1, 1.25, 0.45);
      eyeGroup.add(pupil);

      // Specular Highlight (Pixar gleam)
      const gleam = new THREE.Mesh(new THREE.SphereGeometry(0.013, 8, 8), mat("#ffffff"));
      gleam.position.set(0.014, 0.018, 0.062);
      eyeGroup.add(gleam);

      // Eyebrow
      const brow = new THREE.Mesh(new THREE.CapsuleGeometry(0.015, 0.11, 4, 8), mat(PALETTE.eyebrow));
      brow.rotation.z = side * -0.15;
      brow.position.set(0, 0.105, 0.032);
      eyeGroup.add(brow);

      head.add(eyeGroup);
    };

    makeExpressiveEye(-1);
    makeExpressiveEye(1);

    // Stylized Ears
    const makeEar = (side: 1 | -1) => {
      const e = new THREE.Mesh(new THREE.SphereGeometry(0.075, seg / 2, seg / 2), mat(PALETTE.skin));
      e.position.set(side * 0.41, 0.28, 0);
      e.scale.set(0.45, 1, 0.7);
      head.add(e);
    };
    makeEar(-1);
    makeEar(1);

    // Stylized Nose
    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.045, seg / 2, seg / 2), mat(PALETTE.skinWarm));
    nose.position.set(0, 0.25, 0.42);
    nose.scale.set(0.85, 1, 0.95);
    head.add(nose);

    // Modern Side-Swept Hairstyle (Dark brown/black with stylized volume)
    const hairGroup = new THREE.Group();
    head.add(hairGroup);

    // Main Hair Helmet/Cap
    const hairCap = new THREE.Mesh(
      new THREE.SphereGeometry(0.45, seg, seg, 0, Math.PI * 2, 0, Math.PI * 0.58),
      mat(PALETTE.hair)
    );
    hairCap.position.set(0, 0.33, -0.02);
    hairCap.rotation.x = -0.22;
    hairGroup.add(hairCap);

    // Side-Swept Layered Bangs (Sweeping from left to right across forehead)
    const fringeMain = new THREE.Mesh(new THREE.SphereGeometry(0.24, seg / 2, seg / 2), mat(PALETTE.hair));
    fringeMain.position.set(0.14, 0.52, 0.32);
    fringeMain.scale.set(1.4, 0.65, 0.9);
    fringeMain.rotation.z = -0.25;
    hairGroup.add(fringeMain);

    const fringeSweep = new THREE.Mesh(new THREE.SphereGeometry(0.18, seg / 2, seg / 2), mat(PALETTE.hair));
    fringeSweep.position.set(0.26, 0.46, 0.34);
    fringeSweep.scale.set(1.1, 0.55, 0.85);
    fringeSweep.rotation.z = -0.42;
    hairGroup.add(fringeSweep);

    // Left side part definition
    const leftPart = new THREE.Mesh(new THREE.SphereGeometry(0.2, seg / 2, seg / 2), mat(PALETTE.hair));
    leftPart.position.set(-0.24, 0.48, 0.24);
    leftPart.scale.set(0.9, 0.6, 0.8);
    hairGroup.add(leftPart);

    // Back Taper
    const hairBack = new THREE.Mesh(new THREE.CapsuleGeometry(0.38, 0.15, 4, seg / 2), mat(PALETTE.hair));
    hairBack.position.set(0, 0.24, -0.22);
    hairGroup.add(hairBack);

    this.joints = {
      torso,
      head,
      armL: armL.shoulder,
      armR: armR.shoulder,
      forearmL: armL.elbow,
      forearmR: armR.elbow,
      wristL: armL.wrist,
      wristR: armR.wrist,
      hipL: legL.hip,
      hipR: legR.hip,
      kneeL: legL.knee,
      kneeR: legR.knee,
    };

    const anchor = (name: string, parent: THREE.Object3D, x: number, y: number, z: number) => {
      const o = new THREE.Object3D();
      o.position.set(x, y, z);
      parent.add(o);
      this.anchors[name] = o;
    };
    anchor("head", head, -0.42, 0.34, 0);
    anchor("chest", torso, 0.42, 0.5, 0);
    anchor("handL", armL.wrist, -0.05, 0, 0);
    anchor("feet", this.body, 0, -0.05, 0.2);

    this.root.traverse((o) => {
      o.frustumCulled = false;
    });
  }

  /** Blend towards pose `to` from pose `from` by t (0..1). */
  blendPose(from: PoseName, to: PoseName, t: number) {
    const a = POSES[from];
    const b = POSES[to];
    const p = this.pose;
    p.torso = lerp(a.torso, b.torso, t);
    p.head = [lerp(a.head[0], b.head[0], t), lerp(a.head[1], b.head[1], t)];
    p.armL = [lerp(a.armL[0], b.armL[0], t), lerp(a.armL[1], b.armL[1], t), lerp(a.armL[2], b.armL[2], t)];
    p.armR = [lerp(a.armR[0], b.armR[0], t), lerp(a.armR[1], b.armR[1], t), lerp(a.armR[2], b.armR[2], t)];
    p.forearmL = lerp(a.forearmL, b.forearmL, t);
    p.forearmR = lerp(a.forearmR, b.forearmR, t);
    p.wristL = [lerp(a.wristL[0], b.wristL[0], t), lerp(a.wristL[1], b.wristL[1], t)];
    p.wristR = [lerp(a.wristR[0], b.wristR[0], t), lerp(a.wristR[1], b.wristR[1], t)];
    p.hipL = lerp(a.hipL, b.hipL, t);
    p.hipR = lerp(a.hipR, b.hipR, t);
    p.kneeL = lerp(a.kneeL, b.kneeL, t);
    p.kneeR = lerp(a.kneeR, b.kneeR, t);
    p.rootY = lerp(a.rootY, b.rootY, t);
  }

  setLook(x: number, y: number) {
    this.lookTarget.set(x, y);
  }

  setHoloEdge(edge: number) {
    for (const m of this.materials) m.uniforms.uHoloEdge.value = edge;
  }

  setLightDirection(dir: THREE.Vector3) {
    for (const m of this.materials) m.uniforms.uLightDir.value.copy(dir);
  }

  setAmbient(r: number, g: number, b: number) {
    for (const m of this.materials) m.uniforms.uAmbient.value.set(r, g, b);
  }

  /**
   * Advanced update loop driving realistic typing kinematics, independent hand strikes,
   * breathing, natural micro-pauses, and focused developer posture.
   */
  update(time: number, dt: number, motionScale: number, typing: number) {
    const j = this.joints;
    const p = this.pose;

    // Subtle natural breathing
    const breathe = Math.sin(time * 1.6) * 0.012 * motionScale;
    const sway = Math.sin(time * 0.9) * 0.015 * motionScale;

    this.look.x = damp(this.look.x, this.lookTarget.x, 4, dt);
    this.look.y = damp(this.look.y, this.lookTarget.y, 4, dt);

    this.body.position.y = p.rootY + breathe * 0.5;

    // Head and Torso subtle motion
    j.torso.rotation.x = p.torso + breathe;
    j.torso.rotation.z = sway * 0.4;
    j.head.rotation.x = p.head[0] + this.look.y * 0.22 - breathe * 0.5;
    j.head.rotation.y = p.head[1] + this.look.x * 0.45;
    j.head.rotation.z = -this.look.x * 0.05;

    // ─── Dedicated Realistic Typing Kinematics ─────────────────────────────────
    let typeActive = typing;

    if (typing > 0.05) {
      // Natural rhythm with variable bursts and thinking pauses
      this.burstTimer += dt;

      if (this.isThinking) {
        this.thinkDuration -= dt;
        typeActive = 0; // Hands hover over keys during thinking pause
        if (this.thinkDuration <= 0) {
          this.isThinking = false;
        }
      } else if (this.burstTimer > 3.5 + Math.sin(time * 0.5) * 1.5) {
        // Trigger a natural 0.8s thinking/reviewing pause
        this.burstTimer = 0;
        this.isThinking = true;
        this.thinkDuration = 0.6 + Math.random() * 0.5;
      }
    } else {
      this.isThinking = false;
    }
    this.typingActivity = typeActive;

    // Left and Right independent key-strike trajectories
    // Non-linear keystrokes: fast down-strike, momentary tap, gentle recoil
    const tL = time * 13;
    const tR = time * 14.5 + 1.2;

    const keyStrikeL = Math.pow(Math.max(0, Math.sin(tL)), 2) * 0.045 * typeActive * motionScale;
    const keyStrikeR = Math.pow(Math.max(0, Math.sin(tR)), 2) * 0.045 * typeActive * motionScale;

    const lateralL = Math.sin(time * 3.2) * 0.015 * typeActive;
    const lateralR = Math.cos(time * 2.8) * 0.015 * typeActive;

    // Arms
    j.armL.rotation.set(
      p.armL[0] + keyStrikeL * 0.8,
      p.armL[1] + lateralL,
      p.armL[2] + sway * 0.3
    );
    j.armR.rotation.set(
      p.armR[0] + keyStrikeR * 0.8,
      p.armR[1] + lateralR,
      p.armR[2] - sway * 0.3
    );

    // Forearms
    j.forearmL.rotation.x = p.forearmL + keyStrikeL * 0.5;
    j.forearmR.rotation.x = p.forearmR + keyStrikeR * 0.5;

    // Wrists: micro pitch & roll when striking keys
    j.wristL.rotation.set(
      p.wristL[0] + keyStrikeL * 1.8,
      p.wristL[1] + lateralL * 0.8,
      lateralL * 0.5
    );
    j.wristR.rotation.set(
      p.wristR[0] + keyStrikeR * 1.8,
      p.wristR[1] + lateralR * 0.8,
      -lateralR * 0.5
    );

    // Finger micro-articulation (individual keys being tapped)
    if (typing > 0.05) {
      for (let i = 0; i < this.fingersL.length; i++) {
        const fingerPhase = i * 1.5;
        const tap = Math.pow(Math.max(0, Math.sin(tL + fingerPhase)), 3) * 0.035 * typeActive;
        this.fingersL[i].rotation.x = Math.PI / 2 - 0.2 + tap;
      }
      for (let i = 0; i < this.fingersR.length; i++) {
        const fingerPhase = i * 1.7 + 0.8;
        const tap = Math.pow(Math.max(0, Math.sin(tR + fingerPhase)), 3) * 0.035 * typeActive;
        this.fingersR[i].rotation.x = Math.PI / 2 - 0.2 + tap;
      }
    }

    // Legs
    j.hipL.rotation.x = p.hipL;
    j.hipR.rotation.x = p.hipR;
    j.kneeL.rotation.x = p.kneeL;
    j.kneeR.rotation.x = p.kneeR;

    for (const m of this.materials) m.uniforms.uTime.value = time;
  }
}
