/**
 * Real-time 3D knee (three.js).
 *
 * Bone meshes: BodyParts3D (© The Database Center for Life Science, CC BY 4.0) — femur, tibia,
 * fibula, patella of one adult reference anatomy, pre-cut in /scripts/build_knee.py style at the
 * distal-femur / proximal-tibia resection planes. Implants (femoral component, tibial tray, insert)
 * are modelled procedurally from the bone surfaces and are illustrative, not a specific product.
 *
 * Modes
 *  - 'hero'  : assembled knee with implant, idles + gently flexes, follows the pointer,
 *              and explodes apart as the page scrolls past the hero (getScroll 0→1).
 *  - 'story' : the five-step knee-replacement sequence driven by getProgress() 0→1.
 */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { createBoneDust, createRobotArm, createTracker, rigMaterials } from './surgicalRig';
import { asset } from '../lib/base';

export type KneeMode = 'hero' | 'story';

/** One part, see scripts/build_knee.py: Int16 positions, Uint16|Uint32 indices, Uint8 baked AO, trailing saw-cut triangles. */
type PartData = { p: string; i: string; n: number; w: 2 | 4; a?: string; c?: number };
export type KneeModel = {
  meta: {
    fcut: number; tcut: number; pivot: [number, number, number]; tgap: number; source: string;
    q: Record<string, { o: [number, number, number]; s: number }>;
  };
  parts: Record<string, PartData>;
};

let modelPromise: Promise<KneeModel> | null = null;
export function loadKneeModel(url = asset('models/knee-model.json')): Promise<KneeModel> {
  if (!modelPromise) modelPromise = fetch(url).then((r) => {
    if (!r.ok) throw new Error(`knee model ${r.status}`);
    return r.json() as Promise<KneeModel>;
  });
  return modelPromise;
}

const bytes = (b64: string) => {
  const bin = atob(b64);
  const u8 = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
  return u8.buffer;
};

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const ease = (v: number) => (v < 0.5 ? 2 * v * v : 1 - Math.pow(-2 * v + 2, 2) / 2);

export type KneeEngineOptions = {
  mode: KneeMode;
  getProgress?: () => number; // story
  getScroll?: () => number; // hero explode
  reducedMotion?: boolean;
};

export type KneeEngine = { dispose: () => void; setVisible: (v: boolean) => void };

/* ---------- procedural bone surface (no textures to download) ----------
 * Injected into MeshPhysicalMaterial: baked per-vertex AO, low-frequency mottling, fine pitted
 * micro-bump for cortical bone, and a trabecular (spongy) pattern for saw-cut faces. Noise is
 * evaluated in object space (mm), so it stays glued to the bone as parts move. */
const NOISE_GLSL = /* glsl */ `
varying vec3 vObjPos;
varying float vAO;
uniform float uBump;
uniform float uMottle;
uniform float uSpongy;
float h31(vec3 p) { p = fract(p * 0.1031); p += dot(p, p.zyx + 31.32); return fract((p.x + p.y) * p.z); }
float vnoise(vec3 p) {
  vec3 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(h31(i), h31(i + vec3(1,0,0)), f.x), mix(h31(i + vec3(0,1,0)), h31(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(h31(i + vec3(0,0,1)), h31(i + vec3(1,0,1)), f.x), mix(h31(i + vec3(0,1,1)), h31(i + vec3(1,1,1)), f.x), f.y), f.z);
}
float fbm(vec3 p) { return 0.5 * vnoise(p) + 0.3 * vnoise(p * 2.03) + 0.2 * vnoise(p * 4.1); }
// distance to nearest feature point on the cut plane (xz) -> open marrow spaces between trabeculae
float cells(vec2 p) {
  vec2 i = floor(p), f = fract(p); float d = 1.0;
  for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) {
    vec2 g = vec2(float(x), float(y));
    vec2 o = vec2(h31(vec3(i + g, 1.7)), h31(vec3(i + g, 7.3)));
    d = min(d, length(g + o - f));
  }
  return d;
}
float boneHeight(vec3 p) {
  if (uSpongy > 0.5) return smoothstep(0.18, 0.5, cells(p.xz * 0.9)) * 0.8 + vnoise(p * 3.0) * 0.2;
  return vnoise(p * 0.9) * 0.55 + vnoise(p * 2.6) * 0.3 + vnoise(p * 7.0) * 0.15;
}
`;

type SurfaceOpts = { bump: number; mottle: number; spongy?: boolean };
function boneSurface(mat: THREE.MeshPhysicalMaterial, o: SurfaceOpts) {
  mat.customProgramCacheKey = () => `bone-${o.spongy ? 1 : 0}`;
  mat.onBeforeCompile = (sh) => {
    sh.uniforms.uBump = { value: o.bump };
    sh.uniforms.uMottle = { value: o.mottle };
    sh.uniforms.uSpongy = { value: o.spongy ? 1 : 0 };
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nattribute float ao;\nvarying vec3 vObjPos;\nvarying float vAO;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvObjPos = position;\nvAO = ao;');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\n' + NOISE_GLSL)
      .replace(
        '#include <color_fragment>',
        `#include <color_fragment>
        float mott = fbm(vObjPos * 0.06);
        diffuseColor.rgb *= mix(1.0 - uMottle, 1.0 + uMottle * 0.4, mott);
        if (uSpongy > 0.5) {
          float c = cells(vObjPos.xz * 0.9);
          diffuseColor.rgb = mix(vec3(0.62, 0.38, 0.30), diffuseColor.rgb, smoothstep(0.16, 0.42, c));
        }
        // crevices pick up a warmer, yellower tone, like real bone
        diffuseColor.rgb *= mix(vec3(0.86, 0.78, 0.66), vec3(1.0), vAO);`,
      )
      .replace(
        '#include <roughnessmap_fragment>',
        `#include <roughnessmap_fragment>
        roughnessFactor = clamp(roughnessFactor + (vnoise(vObjPos * 1.3) - 0.5) * 0.18, 0.04, 1.0);`,
      )
      .replace(
        '#include <normal_fragment_maps>',
        `#include <normal_fragment_maps>
        {
          float H = boneHeight(vObjPos) * uBump;
          vec2 dH = vec2(dFdx(H), dFdy(H));
          vec3 sx = normalize(dFdx(-vViewPosition)), sy = normalize(dFdy(-vViewPosition));
          vec3 R1 = cross(sy, normal), R2 = cross(normal, sx);
          float det = dot(sx, R1) * faceDirection;
          normal = normalize(abs(det) * normal - sign(det) * (dH.x * R1 + dH.y * R2));
        }`,
      )
      .replace(
        '#include <aomap_fragment>',
        `#include <aomap_fragment>
        reflectedLight.indirectDiffuse *= vAO;
        reflectedLight.indirectSpecular *= vAO;
        reflectedLight.directDiffuse *= mix(1.0, vAO, 0.55);
        reflectedLight.directSpecular *= mix(1.0, vAO, 0.75);`,
      );
  };
  return mat;
}

export function createKneeEngine(canvas: HTMLCanvasElement, model: KneeModel, opts: KneeEngineOptions): KneeEngine {
  const { mode } = opts;
  const M = model.meta;
  const geo: Record<string, THREE.BufferGeometry> = {};
  for (const [k, part] of Object.entries(model.parts)) {
    const g = new THREE.BufferGeometry();
    const q = M.q[k];
    const raw = new Int16Array(bytes(part.p));
    const pos = new Float32Array(raw.length);
    for (let i = 0; i < raw.length; i++) pos[i] = raw[i] * q.s + q.o[i % 3];
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const idx = part.w === 2 ? new Uint16Array(bytes(part.i)) : new Uint32Array(bytes(part.i));
    g.setIndex(new THREE.BufferAttribute(idx, 1));
    if (part.a) g.setAttribute('ao', new THREE.BufferAttribute(new Uint8Array(bytes(part.a)), 1, true));
    if (part.c) {
      const cutStart = idx.length - part.c * 3;
      g.addGroup(0, cutStart, 0);
      g.addGroup(cutStart, part.c * 3, 1);
    }
    g.computeVertexNormals();
    geo[k] = g;
  }

  const small = Math.min(window.innerWidth, window.innerHeight) < 700;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance', preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.92;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();

  // Neutral photo-studio environment for believable reflections on bone and polished metal.
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const envTex = pmrem.fromScene(room, 0.03).texture;
  scene.environment = envTex;
  room.dispose();
  // Polished metal needs contrast to read as metal: a darker studio with bright softboxes.
  const studio = new THREE.Scene();
  studio.add(new THREE.Mesh(new THREE.BoxGeometry(10, 10, 10), new THREE.MeshBasicMaterial({ color: 0x9aa1aa, side: THREE.BackSide })));
  const softbox = (c: number, w: number, h: number, pos: [number, number, number], rot: [number, number]) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide }));
    m.position.set(...pos);
    m.rotation.set(rot[0], rot[1], 0);
    studio.add(m);
  };
  softbox(0xffffff, 6, 2.2, [0, 4.6, 0], [Math.PI / 2, 0]);
  softbox(0xf2f6ff, 2.2, 6, [-4.8, 0.5, 1], [0, Math.PI / 2]);
  softbox(0xffffff, 1.6, 6, [4.8, 0.5, -1], [0, -Math.PI / 2]);
  softbox(0xfff6ea, 4, 1.4, [0, 1.8, 4.8], [0, Math.PI]);
  softbox(0x5b616a, 10, 10, [0, -4.8, 0], [-Math.PI / 2, 0]);
  softbox(0x2c3138, 10, 0.5, [0, -0.6, -4.8], [0, 0]); // dark horizon band gives the chrome its edge
  const metalEnv = pmrem.fromScene(studio, 0.02).texture;
  pmrem.dispose();

  // three r155+ uses physically based light units: scale legacy intensities by π.
  scene.add(new THREE.HemisphereLight(0xf4f8ff, 0x6f6252, 0.1 * Math.PI));
  const key = new THREE.DirectionalLight(0xfff1df, 1.3 * Math.PI);
  key.position.set(220, 340, 380);
  key.castShadow = true;
  key.shadow.mapSize.set(small ? 1024 : 2048, small ? 1024 : 2048);
  Object.assign(key.shadow.camera, { left: -170, right: 170, top: 260, bottom: -260, near: 50, far: 1400 });
  key.shadow.bias = -0.0004;
  key.shadow.normalBias = 0.8;
  key.shadow.radius = 4;
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xcfe6ff, 0.6 * Math.PI);
  rim.position.set(-260, 120, -240);
  scene.add(rim);
  const fill = new THREE.DirectionalLight(0xffffff, 0.12 * Math.PI);
  fill.position.set(-200, -60, 300);
  scene.add(fill);

  const camera = new THREE.PerspectiveCamera(30, 1, 1, 4000);
  const baseDist = mode === 'hero' ? 900 : 600;
  // pull the camera back on narrow canvases so the knee never crops sideways
  const fitCamera = (aspect: number) => {
    const d = baseDist / Math.min(1, aspect / 0.62);
    camera.position.set(0, 10, d);
    camera.lookAt(0, mode === 'hero' ? -30 : 0, 0);
  };
  fitCamera(0.62);

  // Materials — ivory cortical bone, spongy saw-cut bone, pearly articular cartilage,
  // cobalt-chrome femoral component, titanium tray, UHMW polyethylene insert.
  const bone = boneSurface(
    new THREE.MeshPhysicalMaterial({ color: 0xd9c8a6, roughness: 0.55, metalness: 0, clearcoat: 0.2, clearcoatRoughness: 0.5, sheen: 0.25, sheenColor: new THREE.Color(0xf3e3c6), sheenRoughness: 0.7, envMapIntensity: 0.24 }),
    { bump: 0.45, mottle: 0.12 },
  );
  const cut = boneSurface(new THREE.MeshPhysicalMaterial({ color: 0xe0c7a0, roughness: 0.8, envMapIntensity: 0.25 }), { bump: 2.4, mottle: 0.12, spongy: true });
  const cartilage = (): THREE.MeshPhysicalMaterial =>
    boneSurface(
      new THREE.MeshPhysicalMaterial({ color: 0xd8dfe0, roughness: 0.3, clearcoat: 0.7, clearcoatRoughness: 0.18, sheen: 0.5, sheenColor: new THREE.Color(0xdde9ff), emissive: new THREE.Color(0xff3a1f), emissiveIntensity: 0.6, envMapIntensity: 0.45, transparent: true }),
      { bump: 0.35, mottle: 0.05 },
    );
  const metal = new THREE.MeshPhysicalMaterial({ color: 0xeef1f5, metalness: 1, roughness: 0.08, envMap: metalEnv, envMapIntensity: 1.25, transparent: true });
  const metal2 = new THREE.MeshPhysicalMaterial({ color: 0xcfd2d6, metalness: 1, roughness: 0.3, envMap: metalEnv, envMapIntensity: 1.2, transparent: true });
  const poly = new THREE.MeshPhysicalMaterial({ color: 0xe9e7df, roughness: 0.42, transmission: 0.12, thickness: 6, ior: 1.5, sheen: 0.3, sheenColor: new THREE.Color(0xffffff), envMapIntensity: 0.45, transparent: true });
  const wire = new THREE.MeshBasicMaterial({ color: 0x2f6fb5, wireframe: true, transparent: true, opacity: 0, depthWrite: false });
  const patM = boneSurface(bone.clone(), { bump: 0.45, mottle: 0.12 });
  patM.transparent = true;
  const boneMats = [bone, cut];

  const mesh = (g: THREE.BufferGeometry, m: THREE.Material | THREE.Material[], shadow = true) => {
    const o = new THREE.Mesh(g, m);
    o.castShadow = o.receiveShadow = shadow;
    return o;
  };
  const knee = new THREE.Group();
  scene.add(knee);

  const femG = new THREE.Group();
  knee.add(femG);
  const femCapMat = cartilage();
  const tibCapMat = cartilage();
  // the lifted-away caps fade out, so their cut faces need their own transparent material
  const capCut = (): THREE.MeshPhysicalMaterial => {
    const m = boneSurface(cut.clone(), { bump: 2.4, mottle: 0.12, spongy: true });
    m.transparent = true;
    return m;
  };
  const femCapCut = capCut();
  const tibCapCut = capCut();
  const femTop = mesh(geo.femurTop, boneMats);
  const femCap = mesh(geo.femurCap, [femCapMat, femCapCut]);
  const imp = mesh(geo.implantFem, metal);
  femG.add(femTop, femCap, imp, mesh(geo.femurTop, wire, false));

  const pv = new THREE.Vector3(...M.pivot);
  const tibPivot = new THREE.Group();
  tibPivot.position.copy(pv);
  knee.add(tibPivot);
  const tibG = new THREE.Group();
  tibG.position.set(-pv.x, -pv.y, -pv.z);
  tibPivot.add(tibG);
  const tibCap = mesh(geo.tibiaCap, [tibCapMat, tibCapCut]);
  const tray = mesh(geo.tray, metal2);
  const ins = mesh(geo.insert, poly);
  tibG.add(mesh(geo.tibiaBot, boneMats), tibCap, mesh(geo.fibula, bone), tray, ins, mesh(geo.tibiaBot, wire, false));

  const patPivot = new THREE.Group();
  patPivot.position.copy(pv);
  knee.add(patPivot);
  const pat = mesh(geo.patella, patM);
  pat.position.set(-pv.x, -pv.y, -pv.z);
  patPivot.add(pat);

  // ---------- Theatre props & planning overlays (story mode) ----------
  const bbox = (g: THREE.BufferGeometry) => (g.computeBoundingBox(), g.boundingBox!);
  const fb = bbox(geo.femurCap);
  const tb = bbox(geo.tibiaCap);

  // planned resection planes: outline + faint fill, turn green while the saw is inside the boundary
  const mkPlane = (b: THREE.Box3, y: number, parent: THREE.Object3D) => {
    const g = new THREE.PlaneGeometry(b.max.x - b.min.x + 24, b.max.z - b.min.z + 24);
    const mat = new THREE.MeshBasicMaterial({ color: 0x3f79b5, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false });
    const m = new THREE.Mesh(g, mat);
    m.rotation.x = -Math.PI / 2;
    m.position.set((b.max.x + b.min.x) / 2, y, (b.max.z + b.min.z) / 2);
    const edge = new THREE.LineSegments(new THREE.EdgesGeometry(g), new THREE.LineBasicMaterial({ color: 0x3f79b5, transparent: true, opacity: 0 }));
    m.add(edge);
    parent.add(m);
    return { m, edge, mat, emat: edge.material as THREE.LineBasicMaterial };
  };
  const cutF = mkPlane(fb, M.fcut, femG);
  const cutT = mkPlane(tb, M.tcut, tibG);
  const blue = new THREE.Color(0x3f79b5);
  const green = new THREE.Color(0x2fcf75);

  // CT-style scanner ring sweeping down the leg
  const scan = new THREE.Group();
  const ringMat = new THREE.MeshBasicMaterial({ color: 0x7fd6ff, transparent: true, opacity: 0, depthWrite: false });
  const sheetMat = new THREE.MeshBasicMaterial({ color: 0x7fd6ff, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(78, 1.2, 8, 96), ringMat);
  ring.rotation.x = Math.PI / 2;
  const sheet = new THREE.Mesh(new THREE.CircleGeometry(78, 64), sheetMat);
  sheet.rotation.x = -Math.PI / 2;
  scan.add(ring, sheet);
  knee.add(scan);

  // planned implant "ghost" seen through the bone, as on the robot's planning screen
  const ghostMat = new THREE.MeshBasicMaterial({ color: 0x2f7fe0, transparent: true, opacity: 0, depthTest: false, depthWrite: false });
  const ghosts = [new THREE.Mesh(geo.implantFem, ghostMat), new THREE.Mesh(geo.tray, ghostMat), new THREE.Mesh(geo.insert, ghostMat)];
  ghosts.forEach((gm) => (gm.renderOrder = 5));
  femG.add(ghosts[0]);
  tibG.add(ghosts[1], ghosts[2]);

  // registration points the surgeon touches with the probe (front of femur & tibia near the joint)
  const pickPoints = (g: THREE.BufferGeometry, y0: number, y1: number, n: number) => {
    const P = g.attributes.position;
    const N = g.attributes.normal;
    const cand: THREE.Vector3[] = [];
    for (let i = 0; i < P.count; i++) {
      const y = P.getY(i);
      if (y > y0 && y < y1 && N.getZ(i) > 0.55) cand.push(new THREE.Vector3(P.getX(i), y, P.getZ(i)).addScaledVector(new THREE.Vector3(N.getX(i), N.getY(i), N.getZ(i)), 0.6));
    }
    cand.sort((a, b) => a.x - b.x);
    return Array.from({ length: n }, (_, k) => cand[Math.floor(((k + 0.5) / n) * cand.length)]).filter(Boolean);
  };
  const regGeo = new THREE.SphereGeometry(1.7, 12, 10);
  const haloGeo = new THREE.SphereGeometry(4.2, 16, 12);
  const regs: { dot: THREE.Mesh; halo: THREE.Mesh; at: number }[] = [];
  const addRegs = (pts: THREE.Vector3[], parent: THREE.Object3D, from: number) =>
    pts.forEach((v, k) => {
      const dot = new THREE.Mesh(regGeo, new THREE.MeshBasicMaterial({ color: 0x2fcf75, transparent: true, opacity: 0 }));
      const halo = new THREE.Mesh(haloGeo, new THREE.MeshBasicMaterial({ color: 0x4be38a, transparent: true, opacity: 0, depthWrite: false }));
      dot.position.copy(v);
      halo.position.copy(v);
      parent.add(dot, halo);
      regs.push({ dot, halo, at: from + k * 0.009 });
    });
  addRegs(pickPoints(geo.femurTop, M.fcut + 4, M.fcut + 46, 6), femG, 0.2);
  addRegs(pickPoints(geo.tibiaBot, M.tcut - 34, M.tcut - 4, 5), tibG, 0.255);

  // navigation trackers pinned into femur and tibia shafts
  const rigM = rigMaterials(metalEnv);
  const shaftCentre = (g: THREE.BufferGeometry, y: number) => {
    const P = g.attributes.position;
    const c = new THREE.Vector3();
    let n = 0;
    for (let i = 0; i < P.count; i++) if (Math.abs(P.getY(i) - y) < 4) (c.x += P.getX(i), c.z += P.getZ(i), n++);
    return c.set(c.x / (n || 1), y, c.z / (n || 1));
  };
  const trkF = createTracker(rigM, shaftCentre(geo.femurTop, 82), new THREE.Vector3(-0.55, 0.1, 1), 70);
  const trkT = createTracker(rigM, shaftCentre(geo.tibiaBot, -88), new THREE.Vector3(-0.55, -0.05, 1), 70);
  femG.add(trkF);
  tibG.add(trkT);

  // robot arm with sagittal saw; its base sits off-screen to the upper right
  const arm = createRobotArm(rigM, new THREE.Vector3(300, 270, 50));
  knee.add(arm.group);
  const dust = createBoneDust();
  knee.add(dust.points);
  const tip = new THREE.Vector3();
  const dustAt = new THREE.Vector3();
  const sawDir = new THREE.Vector3(-1, 0, -0.2).normalize(); // saw enters from the lateral side
  const parkTip = new THREE.Vector3(190, 110, 50);
  /** blade-tip path across a resection plane: plunge lateral→medial while sweeping front to back */
  const cutPath = (b: THREE.Box3, y: number, u: number, out: THREE.Vector3) => {
    const xl = b.max.x + 22;
    const xm = b.min.x + 10;
    const z0 = b.max.z - 6;
    const z1 = b.min.z + 8;
    return out.set(xl + (xm - xl) * Math.min(1, u * 1.5), y, z0 + (z1 - z0) * ease(u) + 7 * Math.sin(u * Math.PI * 6));
  };
  const easeOutBack = (v: number) => 1 + 2.2 * Math.pow(v - 1, 3) + 1.2 * Math.pow(v - 1, 2);

  const storyOnly = [cutF.m, cutT.m, scan, trkF, trkT, arm.group, dust.points, ...ghosts, ...regs.flatMap((r) => [r.dot, r.halo])];
  if (mode === 'hero') {
    femCap.visible = false;
    tibCap.visible = false;
    storyOnly.forEach((o) => (o.visible = false));
    tibG.position.y = -pv.y - M.tgap;
    patM.opacity = 0.4;
  }

  // Pointer parallax
  let mx = 0;
  let my = 0;
  const onMove = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    mx = (e.clientX - r.left) / r.width - 0.5;
    my = (e.clientY - r.top) / r.height - 0.5;
  };
  window.addEventListener('pointermove', onMove, { passive: true });

  const motion = opts.reducedMotion ? 0 : 1;
  let raf = 0;
  let visible = true;
  let w0 = 0;
  let h0 = 0;
  const t0 = performance.now();

  const frame = (now: number) => {
    raf = requestAnimationFrame(frame);
    if (!visible) return;
    const t = ((now - t0) / 1000) * motion;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (w && h && (w !== w0 || h !== h0)) {
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      fitCamera(w / h);
      camera.updateProjectionMatrix();
      w0 = w;
      h0 = h;
    }

    if (mode === 'hero') {
      const ex = ease(clamp01(opts.getScroll?.() ?? 0));
      knee.rotation.y = -0.5 + Math.sin(t * 0.35) * 0.55 * (1 - ex) + mx * 0.5 + ex * 2.2;
      knee.rotation.x = my * 0.15 + ex * 0.25;
      imp.position.set(0, 26 * ex, 40 * ex);
      tray.position.set(0, -24 * ex, 30 * ex);
      ins.position.set(0, 0, 70 * ex);
      const flex = (Math.sin(t * 0.9) * 0.5 + 0.5) * 0.6 * (1 - ex) * motion;
      tibPivot.rotation.x = flex;
      patPivot.rotation.x = flex * 0.45;
      knee.position.y = Math.sin(t * 0.8) * 4;
    } else {
      const p = clamp01(opts.getProgress?.() ?? 0);
      const seg = (a: number, b: number) => ease(clamp01((p - a) / (b - a)));
      const lin = (a: number, b: number) => clamp01((p - a) / (b - a));
      const fade = (a: number, b: number, c: number, d: number) => seg(a, b) * (1 - seg(c, d));

      // camera choreography: 3/4 front, tilted to look down onto the cut planes, then lateral view
      const cutView = fade(0.38, 0.44, 0.58, 0.64);
      const side = seg(0.82, 0.92);
      knee.rotation.y = (-0.35 + p * 0.5) * (1 - side) - 0.25 * cutView + (Math.PI / 2 - 0.25) * side + Math.sin(t * 0.5) * 0.05 + mx * 0.25;
      knee.rotation.x = 0.08 + 0.26 * cutView + my * 0.08;

      // 1 · worn cartilage glows; the kneecap is moved aside for surgery and returns at the end
      const inflame = 1 - seg(0.24, 0.42);
      femCapMat.emissiveIntensity = tibCapMat.emissiveIntensity = inflame * (0.7 + 0.4 * Math.sin(t * 4 + 1));
      const po = Math.max(1 - seg(0.1, 0.2), seg(0.86, 0.96));
      patM.opacity = po;
      pat.visible = po > 0.02;

      // 2 · trackers pinned, landmarks registered, CT sweep, plan appears
      const trk = fade(0.15, 0.2, 0.8, 0.86);
      for (const o of [trkF, trkT]) {
        o.visible = trk > 0.01;
        o.position.set(-22 * (1 - trk), 0, 40 * (1 - trk)); // slides in along the pin
      }
      for (const r of regs) {
        const on = seg(r.at, r.at + 0.012) * (1 - seg(0.4, 0.44));
        (r.dot.material as THREE.MeshBasicMaterial).opacity = on;
        const pulse = clamp01((p - r.at) / 0.02);
        (r.halo.material as THREE.MeshBasicMaterial).opacity = on * 0.5 * (1 - pulse);
        r.halo.scale.setScalar(0.6 + 1.4 * pulse);
        r.dot.visible = r.halo.visible = on > 0.01;
      }
      const sweep = lin(0.27, 0.35);
      scan.visible = sweep > 0 && sweep < 1;
      scan.position.y = 150 - 300 * ease(sweep);
      ringMat.opacity = 0.9 * Math.sin(Math.PI * sweep);
      sheetMat.opacity = 0.16 * Math.sin(Math.PI * sweep);
      wire.opacity = 0.22 * fade(0.28, 0.33, 0.38, 0.42);
      ghostMat.opacity = 0.42 * fade(0.33, 0.37, 0.62, 0.72) * (0.85 + 0.15 * Math.sin(t * 3));
      ghosts.forEach((gm) => (gm.visible = ghostMat.opacity > 0.005));
      const planes = fade(0.34, 0.38, 0.6, 0.64);

      // 3 · robot-guided cuts: approach → femur cut → lift → tibia cut → lift → retract
      const fcutU = lin(0.43, 0.49);
      const tcutU = lin(0.52, 0.57);
      const toF = seg(0.4, 0.43);
      const toT = seg(0.49, 0.52);
      const away = seg(0.57, 0.6);
      cutPath(fb, M.fcut, 0, tip);
      const fStart = tip.clone();
      cutPath(tb, M.tcut + tibG.position.y + pv.y, 0, tip);
      const tStart = tip.clone();
      if (p < 0.43) tip.lerpVectors(parkTip, fStart, toF);
      else if (p < 0.49) cutPath(fb, M.fcut, fcutU, tip);
      else if (p < 0.52) tip.lerpVectors(cutPath(fb, M.fcut, 1, new THREE.Vector3()).setX(fb.max.x + 30), tStart, toT);
      else if (p < 0.57) cutPath(tb, M.tcut + tibG.position.y + pv.y, tcutU, tip);
      else tip.lerpVectors(cutPath(tb, M.tcut + tibG.position.y + pv.y, 1, new THREE.Vector3()).setX(tb.max.x + 30), parkTip, away);
      const armOn = p > 0.395 && p < 0.605;
      arm.group.visible = armOn;
      const cutting = (fcutU > 0 && fcutU < 1) || (tcutU > 0 && tcutU < 1) ? 1 : 0;
      if (armOn) arm.pose(tip, sawDir, cutting * motion * 0.09 * Math.sin(t * 95));
      // dust sprays out where the blade enters the bone (lateral cortex), not from the hidden tip
      const entry = dustAt.set(Math.min(tip.x, (p < 0.5 ? fb : tb).max.x - 2), tip.y, tip.z);
      dust.update(entry, cutting * motion, t);

      const activeF = fcutU > 0 && fcutU < 1 ? 1 : 0;
      const activeT = tcutU > 0 && tcutU < 1 ? 1 : 0;
      for (const [c, act, done] of [[cutF, activeF, fcutU >= 1], [cutT, activeT, tcutU >= 1]] as const) {
        c.m.visible = planes > 0.01;
        c.mat.opacity = planes * (0.1 + 0.12 * act) * (done ? 0.4 : 1);
        c.emat.opacity = planes * 0.85;
        c.mat.color.copy(act ? green : blue);
        c.emat.color.copy(act ? green : blue);
      }

      // resected pieces are lifted away after each cut (slight kerf opening during the cut)
      const liftF = seg(0.49, 0.52);
      femCap.position.set(-55 * liftF, -1.2 * fcutU - 10 * liftF, 85 * liftF);
      femCap.rotation.z = -0.45 * liftF;
      femCapMat.opacity = femCapCut.opacity = 1 - seg(0.5, 0.53);
      femCap.visible = femCapMat.opacity > 0.01;
      const liftT = seg(0.57, 0.6);
      tibCap.position.set(55 * liftT, 1.2 * tcutU + 10 * liftT, 85 * liftT);
      tibCap.rotation.z = 0.45 * liftT;
      tibCapMat.opacity = tibCapCut.opacity = 1 - seg(0.58, 0.61);
      tibCap.visible = tibCapMat.opacity > 0.01;
      tibG.position.y = -pv.y - M.tgap * seg(0.58, 0.62);

      // 4 · implants follow their real insertion paths and are tapped home
      const fi = lin(0.62, 0.7);
      imp.visible = fi > 0;
      const fiA = ease(clamp01(fi / 0.75));
      const tapF = fi > 0.75 ? Math.sin(((fi - 0.75) / 0.25) * Math.PI * 3) * (1 - fi) * 6 : 0;
      imp.position.set(0, -26 * (1 - fiA) + tapF * 0.4, 120 * (1 - fiA));
      imp.rotation.x = -0.35 * (1 - fiA);
      metal.opacity = clamp01(fi * 4);
      const ti = lin(0.66, 0.74);
      tray.visible = ti > 0;
      const slide = ease(clamp01(ti / 0.6));
      const press = easeOutBack(clamp01((ti - 0.6) / 0.4));
      tray.position.set(0, 26 * (1 - press), 110 * (1 - slide));
      metal2.opacity = clamp01(ti * 4);
      const ii = lin(0.72, 0.8);
      ins.visible = ii > 0;
      ins.position.set(0, 0, 90 * (1 - easeOutBack(ii)));
      poly.opacity = clamp01(ii * 4);

      // 5 · lateral view, knee moves through its range of motion
      const rom = seg(0.84, 0.96);
      const flex = rom * (motion ? 0.75 + 0.6 * Math.sin(t * 0.9 - Math.PI / 2) : 1.1);
      tibPivot.rotation.x = flex;
      patPivot.rotation.x = flex * 0.5;
    }
    renderer.render(scene, camera);
  };
  raf = requestAnimationFrame(frame);

  return {
    setVisible: (v) => {
      visible = v;
    },
    dispose: () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      Object.values(geo).forEach((g) => g.dispose());
      envTex.dispose();
      metalEnv.dispose();
      [bone, cut, femCapMat, tibCapMat, femCapCut, tibCapCut, metal, metal2, poly, wire, patM, ringMat, sheetMat, ghostMat, cutF.mat, cutT.mat, cutF.emat, cutT.emat, ...Object.values(rigM)].forEach((m) => m.dispose());
      arm.dispose();
      dust.dispose();
      [trkF, trkT, scan].forEach((o) => o.traverse((c) => (c as THREE.Mesh).geometry?.dispose()));
      [regGeo, haloGeo].forEach((g) => g.dispose());
      renderer.dispose();
    },
  };
}
