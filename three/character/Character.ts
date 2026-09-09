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
  hipL: number;
  hipR: number;
  kneeL: number;
  kneeR: number;
  rootY: number;
};

const POSES: Record<PoseName, JointPose> = {
  sitting: {
    torso: 0.12,
    head: [0.18, 0],
    armL: [-1.15, 0.15, -0.25],
    armR: [-1.15, -0.15, 0.25],
    forearmL: -0.55,
    forearmR: -0.55,
    hipL: -1.5,
    hipR: -1.5,
    kneeL: 1.5,
    kneeR: 1.5,
    rootY: 0.17,
  },
  standing: {
    torso: 0,
    head: [0, 0],
    armL: [0.08, 0, -0.12],
    armR: [0.08, 0, 0.12],
    forearmL: -0.18,
    forearmR: -0.18,
    hipL: 0,
    hipR: 0,
    kneeL: 0,
    kneeR: 0,
    rootY: 0,
  },
  presenting: {
    torso: -0.03,
    head: [-0.04, 0],
    armL: [0.12, 0, -0.22],
    armR: [-0.9, 0.2, 1.1],
    forearmL: -0.15,
    forearmR: -1.3,
    hipL: 0.02,
    hipR: -0.02,
    kneeL: 0,
    kneeR: 0,
    rootY: 0,
  },
  crossed: {
    torso: 0.02,
    head: [0.03, 0],
    armL: [-1.05, 0.55, -0.95],
    armR: [-1.05, -0.55, 0.95],
    forearmL: -1.35,
    forearmR: -1.35,
    hipL: 0.05,
    hipR: -0.05,
    kneeL: 0,
    kneeR: 0,
    rootY: 0,
  },
};

export const CHARACTER_SCALE = 0.7;

const PALETTE = {
  skin: "#f2c9a5",
  hair: "#5b3a2a",
  shirt: "#4b4b54",
  pants: "#1e1e24",
  shoe: "#f4f1ea",
  sole: "#2b78ff",
  eye: "#1a1a1e",
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
    hipL: THREE.Group;
    hipR: THREE.Group;
    kneeL: THREE.Group;
    kneeR: THREE.Group;
  };
  private body: THREE.Group;
  private pose: JointPose = { ...POSES.standing };
  private lookTarget = new THREE.Vector2();
  private look = new THREE.Vector2();

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

    // Legs (hip -> thigh -> knee -> shin -> shoe)
    const makeLeg = (side: 1 | -1) => {
      const hip = new THREE.Group();
      hip.position.set(side * 0.14, 0.62, 0);
      const thigh = new THREE.Mesh(new THREE.CapsuleGeometry(0.115, 0.28, 4, cap), mat(PALETTE.pants));
      thigh.position.y = -0.17;
      hip.add(thigh);
      const knee = new THREE.Group();
      knee.position.y = -0.34;
      hip.add(knee);
      const shin = new THREE.Mesh(new THREE.CapsuleGeometry(0.1, 0.2, 4, cap), mat(PALETTE.pants));
      shin.position.y = -0.12;
      knee.add(shin);
      const shoe = new THREE.Mesh(new THREE.CapsuleGeometry(0.11, 0.16, 4, cap), mat(PALETTE.shoe));
      shoe.rotation.x = Math.PI / 2;
      shoe.position.set(0, -0.28, 0.07);
      shoe.scale.set(1, 1, 0.75);
      knee.add(shoe);
      const sole = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.05, 0.34), mat(PALETTE.sole));
      sole.position.set(0, -0.35, 0.07);
      knee.add(sole);
      return { hip, knee };
    };
    const legL = makeLeg(-1);
    const legR = makeLeg(1);
    this.body.add(legL.hip, legR.hip);

    // Torso
    const torso = new THREE.Group();
    torso.position.y = 0.62;
    this.body.add(torso);
    const shirt = new THREE.Mesh(new THREE.CapsuleGeometry(0.31, 0.42, 6, cap * 2), mat(PALETTE.shirt));
    shirt.position.y = 0.36;
    shirt.scale.set(1, 1, 0.82);
    torso.add(shirt);
    const waist = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.27, 0.12, cap * 2), mat(PALETTE.pants));
    waist.position.y = 0.04;
    torso.add(waist);

    // Arms
    const makeArm = (side: 1 | -1) => {
      const shoulder = new THREE.Group();
      shoulder.position.set(side * 0.4, 0.66, 0);
      const upper = new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 0.22, 4, cap), mat(PALETTE.shirt));
      upper.position.y = -0.15;
      shoulder.add(upper);
      const elbow = new THREE.Group();
      elbow.position.y = -0.3;
      shoulder.add(elbow);
      const lower = new THREE.Mesh(new THREE.CapsuleGeometry(0.075, 0.2, 4, cap), mat(PALETTE.skin));
      lower.position.y = -0.13;
      elbow.add(lower);
      const hand = new THREE.Mesh(new THREE.SphereGeometry(0.085, seg / 2, seg / 2), mat(PALETTE.skin));
      hand.position.y = -0.28;
      elbow.add(hand);
      return { shoulder, elbow, hand };
    };
    const armL = makeArm(-1);
    const armR = makeArm(1);
    torso.add(armL.shoulder, armR.shoulder);

    // Head
    const head = new THREE.Group();
    head.position.y = 1.02;
    torso.add(head);
    const skull = new THREE.Mesh(new THREE.SphereGeometry(0.42, seg, seg), mat(PALETTE.skin));
    skull.position.y = 0.3;
    skull.scale.set(1, 1.02, 0.96);
    head.add(skull);
    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.445, seg, seg, 0, Math.PI * 2, 0, Math.PI * 0.55), mat(PALETTE.hair));
    hair.position.y = 0.32;
    hair.rotation.x = -0.25;
    head.add(hair);
    const fringe = new THREE.Mesh(new THREE.SphereGeometry(0.2, seg / 2, seg / 2), mat(PALETTE.hair));
    fringe.position.set(0.16, 0.5, 0.3);
    fringe.scale.set(1.3, 0.7, 0.8);
    head.add(fringe);
    const makeEye = (side: 1 | -1) => {
      const white = new THREE.Mesh(new THREE.SphereGeometry(0.075, seg / 2, seg / 2), mat("#ffffff"));
      white.position.set(side * 0.15, 0.3, 0.37);
      white.scale.set(1, 1.25, 0.6);
      const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.04, seg / 2, seg / 2), mat(PALETTE.eye));
      pupil.position.set(side * 0.15, 0.3, 0.415);
      pupil.scale.set(1, 1.3, 0.5);
      head.add(white, pupil);
    };
    makeEye(-1);
    makeEye(1);
    const ear = (side: 1 | -1) => {
      const e = new THREE.Mesh(new THREE.SphereGeometry(0.07, seg / 2, seg / 2), mat(PALETTE.skin));
      e.position.set(side * 0.41, 0.28, 0);
      head.add(e);
    };
    ear(-1);
    ear(1);

    this.joints = {
      torso,
      head,
      armL: armL.shoulder,
      armR: armR.shoulder,
      forearmL: armL.elbow,
      forearmR: armR.elbow,
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
    anchor("handL", armL.hand, -0.05, 0, 0);
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
    p.hipL = lerp(a.hipL, b.hipL, t);
    p.hipR = lerp(a.hipR, b.hipR, t);
    p.kneeL = lerp(a.kneeL, b.kneeL, t);
    p.kneeR = lerp(a.kneeR, b.kneeR, t);
    p.rootY = lerp(a.rootY, b.rootY, t);
  }

  setLook(x: number, y: number) {
    this.lookTarget.set(x, y);
  }

  /** holoEdge: world-space Y below which the body becomes a hologram. */
  setHoloEdge(edge: number) {
    for (const m of this.materials) m.uniforms.uHoloEdge.value = edge;
  }

  setLightDirection(dir: THREE.Vector3) {
    for (const m of this.materials) m.uniforms.uLightDir.value.copy(dir);
  }

  setAmbient(r: number, g: number, b: number) {
    for (const m of this.materials) m.uniforms.uAmbient.value.set(r, g, b);
  }

  update(time: number, dt: number, motionScale: number, typing: number) {
    const j = this.joints;
    const p = this.pose;
    const breathe = Math.sin(time * 1.6) * 0.012 * motionScale;
    const sway = Math.sin(time * 0.9) * 0.02 * motionScale;

    this.look.x = damp(this.look.x, this.lookTarget.x, 4, dt);
    this.look.y = damp(this.look.y, this.lookTarget.y, 4, dt);

    this.body.position.y = p.rootY + breathe * 0.5;
    j.torso.rotation.x = p.torso + breathe;
    j.torso.rotation.z = sway * 0.4;
    j.head.rotation.x = p.head[0] + this.look.y * 0.22 - breathe * 0.6;
    j.head.rotation.y = p.head[1] + this.look.x * 0.45;
    j.head.rotation.z = -this.look.x * 0.06;

    const typeL = Math.sin(time * 9) * 0.08 * typing * motionScale;
    const typeR = Math.sin(time * 9 + Math.PI) * 0.08 * typing * motionScale;
    j.armL.rotation.set(p.armL[0] + typeL, p.armL[1], p.armL[2] + sway * 0.5);
    j.armR.rotation.set(p.armR[0] + typeR, p.armR[1], p.armR[2] - sway * 0.5);
    j.forearmL.rotation.x = p.forearmL + typeL * 0.6;
    j.forearmR.rotation.x = p.forearmR + typeR * 0.6;
    j.hipL.rotation.x = p.hipL;
    j.hipR.rotation.x = p.hipR;
    j.kneeL.rotation.x = p.kneeL;
    j.kneeR.rotation.x = p.kneeR;

    for (const m of this.materials) m.uniforms.uTime.value = time;
  }
}
