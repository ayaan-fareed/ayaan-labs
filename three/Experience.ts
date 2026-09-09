import * as THREE from "three";
import { Character } from "@/three/character/Character";
import { CameraController } from "@/three/camera/CameraController";
import { sceneStates, sectionIds, WORKSPACE_POSITION, LEVEL, type SceneState } from "@/three/camera/sceneStates";
import { Workspace } from "@/three/environment/Workspace";
import { HoloPlatform } from "@/three/environment/HoloPlatform";
import { ContactProps } from "@/three/environment/ContactProps";
import { Particles } from "@/three/environment/Particles";
import { detectQuality, type QualitySettings } from "@/three/utilities/quality";
import { disposeObject, lerp, smoothstep, clamp01 } from "@/three/utilities/dispose";
import { experienceStore, type SectionId } from "@/lib/experienceStore";

type Options = {
  reducedMotion: boolean;
};

const tmpV3 = new THREE.Vector3();
const tmpColor = new THREE.Color();

export class Experience {
  readonly quality: QualitySettings;
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private cameraCtl: CameraController;
  private character: Character;
  private workspace: Workspace;
  private platform: HoloPlatform;
  private props: ContactProps;
  private particles: Particles;
  private blobShadow: THREE.Mesh;
  private hemi: THREE.HemisphereLight;
  private key: THREE.DirectionalLight;
  private fill: THREE.PointLight;

  private sectionTops: number[] = [];
  private frame = 0;
  private lastTime = 0;
  private disposed = false;
  private readySent = false;
  private mouse = new THREE.Vector2();
  private width = 1;
  private height = 1;
  private motionScale: number;
  private measureTimer = 0;

  constructor(private canvas: HTMLCanvasElement, private options: Options) {
    this.quality = detectQuality(window.innerWidth, options.reducedMotion);
    this.motionScale = options.reducedMotion ? 0.25 : 1;

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: this.quality.antialias,
      alpha: false,
      powerPreference: "high-performance",
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.quality.maxDpr));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;

    this.scene.fog = new THREE.Fog(sceneStates[0].background, 14, 34);

    this.cameraCtl = new CameraController(1);
    this.cameraCtl.mouseInfluence = options.reducedMotion ? 0.15 : 1;

    // Lights for standard materials
    this.hemi = new THREE.HemisphereLight("#fff6ea", "#c9b9a6", 1.6);
    this.scene.add(this.hemi);
    this.key = new THREE.DirectionalLight("#ffffff", 2.2);
    this.key.position.set(4, 6, 5);
    this.scene.add(this.key);
    this.fill = new THREE.PointLight("#5aa7ff", 0, 20, 1.6);
    this.scene.add(this.fill);

    // World
    this.workspace = new Workspace(this.quality);
    this.workspace.root.position.copy(WORKSPACE_POSITION);
    this.scene.add(this.workspace.root);

    this.platform = new HoloPlatform(this.quality);
    this.platform.root.position.set(0, LEVEL.digital, 0);
    this.platform.root.scale.set(0.8, 1, 0.8);
    this.scene.add(this.platform.root);

    this.props = new ContactProps();
    this.props.root.position.set(12, LEVEL.floor, 0);
    this.props.root.scale.setScalar(0.8);
    this.scene.add(this.props.root);

    this.particles = new Particles(this.quality);
    this.particles.root.position.set(0, LEVEL.digital, 0);
    this.scene.add(this.particles.root);

    this.character = new Character(this.quality);
    this.scene.add(this.character.root);

    this.blobShadow = new THREE.Mesh(
      new THREE.CircleGeometry(0.46, 32),
      new THREE.MeshBasicMaterial({ color: "#000000", transparent: true, opacity: 0.1, depthWrite: false }),
    );
    this.blobShadow.rotation.x = -Math.PI / 2;
    this.scene.add(this.blobShadow);

    window.addEventListener("pointermove", this.onPointerMove, { passive: true });
    window.addEventListener("resize", this.onResize);
    this.onResize();
    this.measureSections();
    this.applyScroll(window.scrollY, true);
    if (window.location.hash) {
      // Landing on a deep link: settle the world once layout is final instead of flying there.
      requestAnimationFrame(() => this.snap());
    }

    this.lastTime = performance.now();
    this.frame = requestAnimationFrame(this.tick);
  }

  // ─── Events ────────────────────────────────────────────────────────────────

  private onPointerMove = (e: PointerEvent) => {
    if (e.pointerType === "touch") return;
    this.mouse.set((e.clientX / this.width) * 2 - 1, (e.clientY / this.height) * 2 - 1);
    this.cameraCtl.setMouse(this.mouse.x, this.mouse.y);
  };

  private onResize = () => {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.renderer.setSize(this.width, this.height, false);
    this.cameraCtl.resize(this.width / this.height);
    // portrait framing: pull the camera back so the composition survives narrow viewports
    const aspect = this.width / this.height;
    this.cameraCtl.targetFov = aspect < 0.7 ? 56 : aspect < 1 ? 48 : 38;
    this.measureSections();
  };

  measureSections() {
    this.sectionTops = sectionIds.map((id) => {
      const el = document.getElementById(id);
      if (!el) return 0;
      const rect = el.getBoundingClientRect();
      return rect.top + window.scrollY;
    });
  }

  // ─── Scroll → world state ─────────────────────────────────────────────────

  private blended: SceneState = {
    ...sceneStates[0],
    camera: sceneStates[0].camera.clone(),
    target: sceneStates[0].target.clone(),
    character: sceneStates[0].character.clone(),
    background: sceneStates[0].background.clone(),
    ambient: sceneStates[0].ambient.clone(),
    lightDir: sceneStates[0].lightDir.clone(),
  };
  private poseFrom = sceneStates[0].pose;
  private poseTo = sceneStates[0].pose;
  private poseT = 0;

  private applyScroll(scrollY: number, force = false) {
    const tops = this.sectionTops;
    let i = 0;
    for (let k = 0; k < tops.length; k++) if (scrollY >= tops[k] - 1) i = k;
    const a = sceneStates[i];
    const b = sceneStates[Math.min(i + 1, sceneStates.length - 1)];
    const span = i + 1 < tops.length ? Math.max(tops[i + 1] - tops[i], 1) : 1;
    const rawT = i + 1 < tops.length ? clamp01((scrollY - tops[i]) / span) : 0;
    const t = smoothstep(rawT);

    const s = this.blended;
    s.camera.lerpVectors(a.camera, b.camera, t);
    s.target.lerpVectors(a.target, b.target, t);
    s.character.lerpVectors(a.character, b.character, t);
    // small arc when the character travels between levels
    if (a.character.y !== b.character.y) s.character.y += Math.sin(t * Math.PI) * 0.35;
    s.characterRotY = lerp(a.characterRotY, b.characterRotY, t);
    s.holo = lerp(a.holo, b.holo, t);
    s.grid = lerp(a.grid, b.grid, t);
    s.platform = lerp(a.platform, b.platform, t);
    s.beam = lerp(a.beam, b.beam, t);
    s.particles = lerp(a.particles, b.particles, t);
    s.propsX = lerp(a.propsX, b.propsX, t);
    s.background.copy(a.background).lerp(b.background, t);
    s.ambient.lerpVectors(a.ambient, b.ambient, t);
    s.lightDir.lerpVectors(a.lightDir, b.lightDir, t).normalize();

    // Portrait viewports: recentre on the character, pull back, and push the scene into the lower half.
    const aspect = this.width / this.height;
    if (aspect < 0.95) {
      const p = clamp01((0.95 - aspect) / 0.45);
      s.camera.x = lerp(s.camera.x, s.character.x, 0.7 * p);
      s.target.x = lerp(s.target.x, s.character.x, 0.7 * p);
      s.camera.z += 2.4 * p;
      s.camera.y += 0.7 * p;
      s.target.y += 1.0 * p;
    }

    this.poseFrom = a.pose;
    this.poseTo = b.pose;
    this.poseT = t;

    const activeIndex = rawT > 0.5 ? Math.min(i + 1, sceneStates.length - 1) : i;
    const active = sceneStates[activeIndex];
    if (force || experienceStore.activeSection.value !== active.id) {
      experienceStore.activeSection.set(active.id as SectionId);
    }
    const themeIndex = t > 0.5 ? Math.min(i + 1, sceneStates.length - 1) : i;
    experienceStore.theme.set(sceneStates[themeIndex].theme);
  }

  // ─── Frame ─────────────────────────────────────────────────────────────────

  private tick = (now: number) => {
    if (this.disposed) return;
    this.frame = requestAnimationFrame(this.tick);
    const dt = Math.min((now - this.lastTime) / 1000, 0.2);
    this.lastTime = now;
    const time = now / 1000;

    // Section offsets can shift as fonts/images settle; re-measure occasionally.
    this.measureTimer += dt;
    if (this.measureTimer > 2) {
      this.measureTimer = 0;
      this.measureSections();
    }

    this.applyScroll(window.scrollY);
    const s = this.blended;

    // Camera
    this.cameraCtl.targetPosition.copy(s.camera);
    this.cameraCtl.targetLookAt.copy(s.target);
    this.cameraCtl.update(dt);

    // Character
    this.character.root.position.copy(s.character);
    this.character.root.rotation.y = s.characterRotY;
    this.character.blendPose(this.poseFrom, this.poseTo, this.poseT);
    const facingCamera = Math.cos(s.characterRotY) > 0.2;
    this.character.setLook(facingCamera ? this.mouse.x * 0.8 : 0, facingCamera ? -this.mouse.y * 0.5 : 0);
    const typing = this.poseFrom === "sitting" ? 1 - this.poseT : this.poseTo === "sitting" ? this.poseT : 0;
    const edge = s.holo <= 0.001 ? -1000 : s.character.y + lerp(-0.3, 1.7, s.holo);
    this.character.setHoloEdge(edge);
    this.character.setAmbient(s.ambient.x, s.ambient.y, s.ambient.z);
    this.character.setLightDirection(s.lightDir);
    this.character.update(time, dt, this.motionScale, typing);

    // Ground shadow follows the character
    this.blobShadow.position.set(s.character.x, s.character.y + 0.01, s.character.z + 0.1);
    const sitting = this.poseFrom === "sitting" || this.poseTo === "sitting";
    (this.blobShadow.material as THREE.MeshBasicMaterial).opacity = (sitting ? 0.04 : 0.1) * (1 - s.holo);

    // Environment
    this.workspace.update(time, this.motionScale);
    this.platform.set(s.grid, s.platform, s.beam);
    this.platform.update(time, this.motionScale);
    this.particles.set(s.particles);
    this.particles.update(time, this.motionScale);
    this.props.root.position.x = s.propsX;
    this.props.root.visible = s.propsX < 11;

    // Atmosphere
    this.scene.background = tmpColor.copy(s.background);
    (this.scene.fog as THREE.Fog).color.copy(s.background);
    const dark = s.grid;
    this.hemi.intensity = lerp(1.6, 1.1, dark);
    this.hemi.color.setHSL(0.09, lerp(0.9, 0.5, dark), lerp(0.96, 0.85, dark));
    this.hemi.groundColor.copy(s.background).multiplyScalar(0.8);
    this.fill.intensity = dark * 18;
    this.fill.position.set(s.character.x - 2.5, s.character.y + 1.4, s.character.z + 2.5);

    this.renderer.render(this.scene, this.cameraCtl.camera);
    this.projectAnchors();

    if (!this.readySent) {
      this.readySent = true;
      experienceStore.ready.set(true);
    }
  };

  private projectAnchors() {
    if (experienceStore.anchors.size === 0) return;
    const cam = this.cameraCtl.camera;
    for (const [name, el] of experienceStore.anchors) {
      const obj = this.character.anchors[name];
      if (!obj) continue;
      obj.getWorldPosition(tmpV3).project(cam);
      const visible = tmpV3.z < 1;
      const x = (tmpV3.x * 0.5 + 0.5) * this.width;
      const y = (-tmpV3.y * 0.5 + 0.5) * this.height;
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      el.style.visibility = visible ? "visible" : "hidden";
    }
  }

  /** Snap camera to the current scroll state (used after hash navigation on load). */
  snap() {
    this.measureSections();
    this.applyScroll(window.scrollY, true);
    this.cameraCtl.snap();
  }

  debugState() {
    const s = this.blended;
    return {
      scrollY: window.scrollY,
      tops: this.sectionTops,
      camera: this.cameraCtl.camera.position.toArray().map((n) => +n.toFixed(2)),
      character: s.character.toArray().map((n) => +n.toFixed(2)),
      characterWorld: this.character.root.position.toArray().map((n) => +n.toFixed(2)),
      pose: [this.poseFrom, this.poseTo, +this.poseT.toFixed(2)],
      holo: +s.holo.toFixed(2),
    };
  }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.frame);
    window.removeEventListener("pointermove", this.onPointerMove);
    window.removeEventListener("resize", this.onResize);
    disposeObject(this.scene);
    this.renderer.dispose();
    experienceStore.ready.set(false);
  }
}
