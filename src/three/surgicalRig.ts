/**
 * Procedural operating-theatre props for the knee story (illustrative, not a specific product):
 *  - RobotArm: articulated arm (2-link IK) holding a sagittal saw; the blade oscillates while cutting.
 *  - Tracker: navigation array (bone pin + frame + 4 reflective marker spheres).
 *  - BoneDust: small particle burst at the blade tip while it is inside bone.
 * Units are millimetres in the knee's local space.
 */
import * as THREE from 'three';

const UP = new THREE.Vector3(0, 1, 0);
const tmp = new THREE.Vector3();

/** Stretch a unit-height (Y) cylinder between two points. */
function span(o: THREE.Object3D, a: THREE.Vector3, b: THREE.Vector3) {
  tmp.subVectors(b, a);
  const len = tmp.length();
  o.position.copy(a).addScaledVector(tmp, 0.5);
  o.scale.set(1, len, 1);
  o.quaternion.setFromUnitVectors(UP, tmp.divideScalar(len || 1));
}

export type RigMaterials = { shell: THREE.Material; joint: THREE.Material; steel: THREE.Material; marker: THREE.Material };

export function rigMaterials(metalEnv: THREE.Texture): RigMaterials {
  return {
    // robot covers: white, slightly glossy medical-device plastic
    shell: new THREE.MeshPhysicalMaterial({ color: 0xf3f5f7, roughness: 0.32, clearcoat: 0.6, clearcoatRoughness: 0.2, envMapIntensity: 0.6 }),
    joint: new THREE.MeshPhysicalMaterial({ color: 0x1b2a3f, roughness: 0.45, metalness: 0.3, envMapIntensity: 0.6 }),
    steel: new THREE.MeshPhysicalMaterial({ color: 0xd9dde2, metalness: 1, roughness: 0.22, envMap: metalEnv, envMapIntensity: 1.2 }),
    // retro-reflective navigation spheres read as matte silver-grey
    marker: new THREE.MeshPhysicalMaterial({ color: 0xcfd3d8, metalness: 0.4, roughness: 0.38, envMap: metalEnv, envMapIntensity: 1.3 }),
  };
}

/** Navigation array: pin from `anchor` (inside bone) along `dir`, frame + 4 marker spheres at the end. */
export function createTracker(m: RigMaterials, anchor: THREE.Vector3, dir: THREE.Vector3, len = 80) {
  const g = new THREE.Group();
  const d = dir.clone().normalize();
  const end = anchor.clone().addScaledVector(d, len);
  const pin = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 1, 12), m.steel);
  span(pin, anchor, end);
  const pin2 = pin.clone();
  span(pin2, anchor.clone().add(new THREE.Vector3(0, -9, 0)), end.clone().add(new THREE.Vector3(0, -9, 0)));
  const clamp = new THREE.Mesh(new THREE.BoxGeometry(8, 16, 8), m.joint);
  clamp.position.copy(end).add(new THREE.Vector3(0, -4.5, 0));
  const frame = new THREE.Group();
  frame.position.copy(end).addScaledVector(d, 6);
  frame.lookAt(frame.position.clone().add(d));
  const arms: [number, number][] = [[-22, 14], [20, 18], [-12, -20], [24, -12]];
  const sphere = new THREE.SphereGeometry(4.2, 20, 14);
  const bar = new THREE.CylinderGeometry(1.4, 1.4, 1, 8);
  for (const [x, y] of arms) {
    const b = new THREE.Mesh(bar, m.joint);
    span(b, new THREE.Vector3(0, 0, 0), new THREE.Vector3(x, y, 0));
    const s = new THREE.Mesh(sphere, m.marker);
    s.position.set(x, y, 0);
    frame.add(b, s);
  }
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(4, 4, 5, 16), m.joint);
  hub.rotation.x = Math.PI / 2;
  frame.add(hub);
  g.add(pin, pin2, clamp, frame);
  g.traverse((o) => ((o as THREE.Mesh).castShadow = true));
  return g;
}

/**
 * Robot arm. `shoulder` is off-screen; each frame call `pose(tip, axis, oscillate)` with the saw
 * blade tip and the direction the handpiece points (horizontal → horizontal blade).
 */
export function createRobotArm(m: RigMaterials, shoulder: THREE.Vector3) {
  const g = new THREE.Group();
  const L1 = 190;
  const L2 = 175;
  const HAND = 78; // handpiece length
  const BLADE = 52; // blade length

  const column = new THREE.Mesh(new THREE.CylinderGeometry(18, 22, 1, 28), m.shell);
  span(column, shoulder, shoulder.clone().add(new THREE.Vector3(0, 400, 0)));
  const link = () => new THREE.Mesh(new THREE.CylinderGeometry(10, 12, 1, 24), m.shell);
  const upper = link();
  const fore = link();
  const jointGeo = new THREE.SphereGeometry(15, 24, 18);
  const ringGeo = new THREE.TorusGeometry(14.5, 2.2, 10, 32);
  const joint = () => {
    const j = new THREE.Group();
    j.add(new THREE.Mesh(jointGeo, m.shell));
    const r = new THREE.Mesh(ringGeo, m.joint);
    r.rotation.y = Math.PI / 2;
    j.add(r);
    return j;
  };
  const jS = joint();
  const jE = joint();
  const jW = joint();
  jS.position.copy(shoulder);
  jW.scale.setScalar(0.7);

  // end effector: handpiece + oscillating blade, plus its own small tracker array
  const tool = new THREE.Group();
  const hand = new THREE.Mesh(new THREE.CylinderGeometry(8, 9.5, HAND, 24), m.shell);
  hand.rotation.x = Math.PI / 2;
  hand.position.z = HAND / 2;
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(9.8, 9.8, 7, 24), m.joint);
  collar.rotation.x = Math.PI / 2;
  collar.position.z = HAND - 4;
  const nose = new THREE.Mesh(new THREE.CylinderGeometry(4.5, 6, 12, 20), m.steel);
  nose.rotation.x = Math.PI / 2;
  nose.position.z = HAND + 6;
  const bladePivot = new THREE.Group();
  bladePivot.position.z = HAND + 10;
  const bladeShape = new THREE.Shape();
  bladeShape.moveTo(-5, 0);
  bladeShape.lineTo(5, 0);
  bladeShape.lineTo(9, BLADE - 3);
  for (let i = 0; i < 9; i++) {
    // saw teeth along the cutting edge
    const x = 9 - (18 * (i + 0.5)) / 9;
    bladeShape.lineTo(x, BLADE + 1.8);
    bladeShape.lineTo(9 - (18 * (i + 1)) / 9, BLADE - 0.4);
  }
  bladeShape.lineTo(-5, 0);
  const bladeGeo = new THREE.ExtrudeGeometry(bladeShape, { depth: 0.9, bevelEnabled: false });
  bladeGeo.rotateX(Math.PI / 2); // shape Y → +Z (forward), thickness along Y
  bladeGeo.translate(0, 0.45, 0);
  const blade = new THREE.Mesh(bladeGeo, m.steel);
  bladePivot.add(blade);
  const toolTracker = createTracker(m, new THREE.Vector3(0, 8, HAND * 0.35), new THREE.Vector3(0.2, 1, -0.2), 26);
  tool.add(hand, collar, nose, bladePivot, toolTracker);
  tool.traverse((o) => ((o as THREE.Mesh).castShadow = true));
  g.add(column, upper, fore, jS, jE, jW, tool);
  for (const o of [column, upper, fore]) o.castShadow = true;

  const W = new THREE.Vector3();
  const E = new THREE.Vector3();
  const axis = new THREE.Vector3();
  const pole = new THREE.Vector3();

  return {
    group: g,
    /** blade tip position, handpiece axis (tip direction), oscillation angle (radians) */
    pose(tip: THREE.Vector3, dir: THREE.Vector3, osc: number) {
      axis.copy(dir).normalize();
      W.copy(tip).addScaledVector(axis, -(HAND + 10 + BLADE));
      // 2-link IK, elbow bent upward/outward
      const d = tmp.subVectors(W, shoulder);
      const dist = Math.min(d.length(), L1 + L2 - 0.5);
      d.normalize();
      const a = (L1 * L1 - L2 * L2 + dist * dist) / (2 * dist);
      const h = Math.sqrt(Math.max(0, L1 * L1 - a * a));
      pole.set(0.4, 1, 0.3).addScaledVector(d, -pole.dot(d)).normalize();
      E.copy(shoulder).addScaledVector(d, a).addScaledVector(pole, h);
      W.copy(shoulder).addScaledVector(d, dist);
      span(upper, shoulder, E);
      span(fore, E, W);
      jE.position.copy(E);
      jW.position.copy(W);
      tool.position.copy(W);
      g.updateWorldMatrix(true, false);
      tool.lookAt(g.localToWorld(tmp.copy(W).add(axis))); // lookAt takes world space
      bladePivot.rotation.y = osc;
    },
    dispose() {
      g.traverse((o) => (o as THREE.Mesh).geometry?.dispose());
    },
  };
}

/** Bone dust: particles thrown from the blade tip; `update(tip, active, t)` each frame. */
export function createBoneDust(count = 140) {
  const pos = new Float32Array(count * 3);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  // soft round speck
  const c = document.createElement('canvas');
  c.width = c.height = 32;
  const ctx = c.getContext('2d')!;
  const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.5, 'rgba(255,255,255,0.8)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 32, 32);
  const speck = new THREE.CanvasTexture(c);
  const mat = new THREE.PointsMaterial({ color: 0xb99a68, size: 5.5, map: speck, sizeAttenuation: true, transparent: true, opacity: 0.95, depthWrite: false });
  const pts = new THREE.Points(geo, mat);
  pts.frustumCulled = false;
  const seed = Array.from({ length: count }, (_, i) => {
    const r = (k: number) => {
      const x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453;
      return x - Math.floor(x);
    };
    return { phase: r(1), vx: 20 + r(2) * 60, vy: 55 + r(3) * 70, vz: 10 + r(4) * 60 }; // thrown up and out of the cut, toward the viewer
  });
  const LIFE = 0.7;
  return {
    points: pts,
    update(tip: THREE.Vector3, active: number, t: number) {
      pts.visible = active > 0.01;
      if (!pts.visible) return;
      mat.opacity = 0.9 * active;
      seed.forEach((s, i) => {
        const age = ((t / LIFE + s.phase) % 1) * LIFE;
        pos[i * 3] = tip.x + s.vx * age;
        pos[i * 3 + 1] = tip.y + s.vy * age - 230 * age * age;
        pos[i * 3 + 2] = tip.z + s.vz * age;
      });
      geo.attributes.position.needsUpdate = true;
    },
    dispose() {
      geo.dispose();
      mat.dispose();
      speck.dispose();
    },
  };
}
