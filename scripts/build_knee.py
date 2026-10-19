"""
Builds public/models/knee-model.json from BodyParts3D bone meshes.

Source: BodyParts3D 3.0, polygon reduction 95% (the most detailed public release, ~5x the polygons
of the 4.0 / 99% set), (c) The Database Center for Life Science, CC BY 4.0.
  https://dbarchive.biosciencedbc.jp/data/bodyparts3d/20110915/BodyParts3D_3.0_obj_95.zip
Unzip it and pass the folder that holds the .obj files (left knee = FMA24475/24478/24481/24487.obj):

  python3 -m venv .venv && .venv/bin/pip install "trimesh[easy]" shapely scipy
  .venv/bin/python scripts/build_knee.py <obj-folder> public/models/knee-model.json

Pipeline: left femur / tibia / fibula / patella -> Y-up, centred on the joint line -> Taubin smoothing
(removes facet noise without shrinking; KNEE_SUBDIVIDE=1 adds a Loop subdivision) -> slice the distal femur (~9 mm) and
proximal tibia (~8 mm) into femurTop/femurCap and tibiaBot/tibiaCap -> procedural implants (femoral
component = bone shell offset 2.2 mm, tibial tray + keel + fin, poly insert) -> bake per-vertex ambient
occlusion (voxel ray-march over the assembled knee) -> quantise.

Output per part: p = Int16 xyz (decode: v * meta.q[part].s + meta.q[part].o), i = Uint16/Uint32 indices,
a = Uint8 ambient occlusion (0..255), c = number of trailing triangles that are flat saw-cut faces
(rendered as cut bone). All little-endian, base64.
"""
import base64, json, os, re, sys
import numpy as np
import trimesh
from shapely.geometry import Polygon

SRC, OUT = sys.argv[1], sys.argv[2]

# ---------------------------------------------------------------- load
WANT = {'femur': 'Left femur', 'tibia': 'Left tibia', 'fibula': 'Left fibula', 'patella': 'Left patella'}
# BodyParts3D 3.0 files carry no name header; they are named by FMA concept ID instead
FMA = {'FMA24475': 'femur', 'FMA24478': 'tibia', 'FMA24481': 'fibula', 'FMA24487': 'patella'}

def find_objs(folder):
    found = {}
    for root, _, files in os.walk(folder):
        for fn in files:
            if not fn.lower().endswith('.obj'):
                continue
            path = os.path.join(root, fn)
            if fn[:-4] in FMA:
                found[FMA[fn[:-4]]] = path
                continue
            with open(path, 'r', errors='ignore') as fh:
                head = fh.read(2000)
            m = re.search(r'English name\s*:\s*(.+)', head)
            if not m:
                continue
            name = m.group(1).strip()
            for k, want in WANT.items():
                if name.lower() == want.lower():
                    found[k] = path
    missing = set(WANT) - set(found)
    if missing:
        sys.exit(f'missing meshes: {missing}')
    return found

def load_obj(path):
    v, f = [], []
    with open(path, 'r', errors='ignore') as fh:
        for line in fh:
            if line.startswith('v '):
                v.append([float(x) for x in line.split()[1:4]])
            elif line.startswith('f '):
                f.append([int(x.split('/')[0]) - 1 for x in line.split()[1:4]])
    m = trimesh.Trimesh(vertices=np.array(v), faces=np.array(f), process=True)
    m.merge_vertices()
    return m

paths = find_objs(SRC)
print({k: os.path.basename(p) for k, p in paths.items()})
meshes = {k: load_obj(p) for k, p in paths.items()}

# ---------------------------------------------------------------- frame: x stays, z(up) -> Y, -y(anterior) -> Z
tib, fem = meshes['tibia'], meshes['femur']
joint_z = (tib.bounds[1][2] + fem.bounds[0][2]) / 2.0
cx = (tib.bounds[0][0] + tib.bounds[1][0]) / 2.0
cy = (tib.bounds[0][1] + tib.bounds[1][1]) / 2.0

def to3(m):
    v = m.vertices
    nv = np.stack([v[:, 0] - cx, v[:, 2] - joint_z, -(v[:, 1] - cy)], axis=1)
    m2 = trimesh.Trimesh(vertices=nv, faces=m.faces.copy(), process=False)
    if m2.volume < 0:
        m2.invert()
    return m2

SUBDIVIDE = os.environ.get('KNEE_SUBDIVIDE') == '1'  # 4x the vertices; only worth it for the low-res 4.0/99% set

def refine(m):
    m = to3(m)
    trimesh.smoothing.filter_taubin(m, lamb=0.5, nu=-0.53, iterations=12)
    if SUBDIVIDE:
        m = m.subdivide_loop(iterations=1)
        trimesh.smoothing.filter_taubin(m, lamb=0.5, nu=-0.53, iterations=4)
    return m

meshes = {k: refine(m) for k, m in meshes.items()}
for n, m in meshes.items():
    print(n, len(m.vertices), 'verts', m.is_watertight, np.round(m.bounds, 1).tolist())

fem, tib = meshes['femur'], meshes['tibia']
fem_min, tib_max = fem.bounds[0][1], tib.bounds[1][1]
FCUT = fem_min + 9.0   # distal femoral resection ~9 mm
TCUT = tib_max - 8.0   # proximal tibial resection ~8 mm
print('FCUT', FCUT, 'TCUT', TCUT)

def slice_(m, y, up):
    """Keep the side of plane y given by `up` (+1 above, -1 below); saw-cut faces are moved to the end."""
    s = trimesh.intersections.slice_mesh_plane(m, plane_normal=[0, up, 0], plane_origin=[0, y, 0], cap=True)
    tri_y = s.vertices[s.faces][:, :, 1]
    flat = np.all(np.abs(tri_y - y) < 1e-4, axis=1)
    # cut faces get their own vertices so the saw edge stays crisp (no normal averaging across it)
    cut = s.faces[flat]
    used, remap = np.unique(cut, return_inverse=True)
    verts = np.vstack([s.vertices, s.vertices[used]])
    cut = remap.reshape(-1, 3) + len(s.vertices)
    s = trimesh.Trimesh(vertices=verts, faces=np.vstack([s.faces[~flat], cut]), process=False)
    s.remove_unreferenced_vertices()
    return s, int(flat.sum())

parts, cutn = {}, {}
parts['femurTop'], cutn['femurTop'] = slice_(fem, FCUT, 1)
parts['femurCap'], cutn['femurCap'] = slice_(fem, FCUT, -1)
parts['tibiaBot'], cutn['tibiaBot'] = slice_(tib, TCUT, -1)
parts['tibiaCap'], cutn['tibiaCap'] = slice_(tib, TCUT, 1)
parts['fibula'] = meshes['fibula']
parts['patella'] = meshes['patella']

# ---------------------------------------------------------------- implants (illustrative, not a product)
shell = trimesh.intersections.slice_mesh_plane(fem, plane_normal=[0, -1, 0], plane_origin=[0, FCUT + 6, 0], cap=False)
vn = shell.vertex_normals
outer = trimesh.Trimesh(vertices=shell.vertices + vn * 2.2, faces=shell.faces, process=False)
inner = trimesh.Trimesh(vertices=shell.vertices - vn * 0.4, faces=shell.faces[:, ::-1], process=False)
parts['implantFem'] = trimesh.util.concatenate([outer, inner])

sec = tib.section(plane_origin=[0, TCUT, 0], plane_normal=[0, 1, 0])
pts = sec.vertices
c = pts.mean(axis=0)
ang = np.arctan2(pts[:, 2] - c[2], pts[:, 0] - c[0])
bins = 96
idx = np.arange(bins)
rr = np.full(bins, np.nan)
for b in range(bins):
    a0 = -np.pi + 2 * np.pi * b / bins
    sel = (ang >= a0) & (ang < a0 + 2 * np.pi / bins)
    if sel.any():
        rr[b] = np.hypot(pts[sel, 0] - c[0], pts[sel, 2] - c[2]).max()
good = ~np.isnan(rr)
rr = np.interp(idx, idx[good], rr[good], period=bins)
rr = np.convolve(np.r_[rr[-4:], rr, rr[:4]], np.ones(9) / 9, mode='valid')
ang_b = -np.pi + 2 * np.pi * (idx + 0.5) / bins
outline = np.stack([c[0] + rr * 0.96 * np.cos(ang_b), c[2] + rr * 0.96 * np.sin(ang_b)], axis=1)

def lay(m, y0):
    v = m.vertices
    out = trimesh.Trimesh(vertices=np.stack([v[:, 0], v[:, 2] + y0, v[:, 1]], axis=1), faces=m.faces[:, ::-1], process=False)
    if out.volume < 0:
        out.invert()
    return out

def rounded_slab(poly, h, r):
    """Extruded outline with softened vertical edges (two stacked, slightly inset layers)."""
    a = trimesh.creation.extrude_polygon(poly.buffer(-r), r)
    b = trimesh.creation.extrude_polygon(poly, h - 2 * r)
    b.apply_translation([0, 0, r])
    d = trimesh.creation.extrude_polygon(poly.buffer(-r), r)
    d.apply_translation([0, 0, h - r])
    return trimesh.util.concatenate([a, b, d])

P = Polygon(outline).buffer(0)
tray = lay(rounded_slab(P, 4.0, 0.6), TCUT - 1.5)
keel = trimesh.creation.cylinder(radius=6.5, height=38, sections=48)
keel.apply_transform(trimesh.transformations.rotation_matrix(np.pi / 2, [1, 0, 0]))
keel.apply_translation([c[0], TCUT - 1.5 - 19, c[2] - 2])
fin = trimesh.creation.box(extents=[34, 22, 3])
fin.apply_translation([c[0], TCUT - 1.5 - 11, c[2] - 2])
parts['tray'] = trimesh.util.concatenate([tray, keel, fin])
ins_h = 8.0
fem_imp_min = parts['implantFem'].bounds[0][1]
TGAP = float(TCUT + 2.5 + ins_h - fem_imp_min)
parts['insert'] = lay(rounded_slab(P.buffer(-1.2), ins_h, 1.0), TCUT + 2.5)
print('TGAP', TGAP)

# ---------------------------------------------------------------- ambient occlusion bake (bones only)
PITCH = 0.8
# the patella is left out: it fades away during the story and would leave a dark print on the femur
occluders = [fem, tib, meshes['fibula']]
lo = np.min([m.bounds[0] for m in occluders], axis=0) - 2
hi = np.max([m.bounds[1] for m in occluders], axis=0) + 2
shape = np.ceil((hi - lo) / PITCH).astype(int) + 1
occ = np.zeros(shape, dtype=bool)
for m in occluders:
    vg = m.voxelized(PITCH).fill()
    ijk = np.round((vg.points - lo) / PITCH).astype(int)
    ijk = ijk[np.all((ijk >= 0) & (ijk < shape), axis=1)]
    occ[ijk[:, 0], ijk[:, 1], ijk[:, 2]] = True
print('voxels', shape, occ.sum())

rng = np.random.default_rng(7)
NDIR = 64
u1, u2 = rng.random(NDIR), rng.random(NDIR)
local = np.stack([np.sqrt(u1) * np.cos(2 * np.pi * u2), np.sqrt(u1) * np.sin(2 * np.pi * u2), np.sqrt(1 - u1)], axis=1)  # cosine-weighted
STEPS = np.arange(2.0, 36.0, 0.8)
FALL = 1.0 - STEPS / 40.0  # nearer hits occlude more

def bake_ao(m, cut_faces=0):
    v, n = m.vertices, m.vertex_normals
    ao = np.ones(len(v))
    t = np.where(np.abs(n[:, 0:1]) < 0.9, np.array([[1, 0, 0]]), np.array([[0, 1, 0]]))
    t = np.cross(n, t); t /= np.linalg.norm(t, axis=1, keepdims=True)
    b = np.cross(n, t)
    for s in range(0, len(v), 2000):
        V, N, T, B = v[s:s + 2000], n[s:s + 2000], t[s:s + 2000], b[s:s + 2000]
        D = local[None, :, 0:1] * T[:, None] + local[None, :, 1:2] * B[:, None] + local[None, :, 2:3] * N[:, None]  # (v, d, 3)
        hit = np.zeros(D.shape[:2])
        for st, fall in zip(STEPS, FALL):
            p = V[:, None] + N[:, None] * 0.9 + D * st
            ijk = np.round((p - lo) / PITCH).astype(int)
            ok = np.all((ijk >= 0) & (ijk < shape), axis=2)
            h = np.zeros(ok.shape, dtype=bool)
            q = ijk[ok]
            h[ok] = occ[q[:, 0], q[:, 1], q[:, 2]]
            hit = np.maximum(hit, h * fall)
        ao[s:s + 2000] = 1 - hit.mean(axis=1)
    if cut_faces:  # saw-cut faces sit against the removed piece — leave them unshaded
        cut_v = np.unique(m.faces[-cut_faces:])
        ao[cut_v] = np.maximum(ao[cut_v], 0.92)
    return np.clip(ao, 0, 1) ** 1.3

ao = {}
for k in ['femurTop', 'femurCap', 'tibiaBot', 'tibiaCap', 'fibula', 'patella']:
    ao[k] = bake_ao(parts[k], cutn.get(k, 0))
    print('ao', k, round(float(ao[k].min()), 2), round(float(ao[k].mean()), 2))

# ---------------------------------------------------------------- encode
b64 = lambda a: base64.b64encode(np.ascontiguousarray(a).tobytes()).decode()
out_parts, q = {}, {}
for n, m in parts.items():
    v = m.vertices
    o = (v.max(0) + v.min(0)) / 2
    s = (v.max(0) - v.min(0)).max() / 2 / 32767
    vi = np.round((v - o) / s).astype('<i2')
    f = m.faces.astype('<u2' if len(v) < 65536 else '<u4')
    rec = {'p': b64(vi), 'i': b64(f), 'n': int(len(v)), 'w': 2 if f.dtype.itemsize == 2 else 4}
    if n in ao:
        rec['a'] = b64(np.round(ao[n] * 255).astype(np.uint8))
    if cutn.get(n):
        rec['c'] = cutn[n]
    out_parts[n] = rec
    q[n] = {'o': [float(x) for x in o], 's': float(s)}
    print(n, len(v), 'verts', len(m.faces), 'tris')

data = {
    'meta': {
        'source': 'BodyParts3D 3.0 (95%), (c) The Database Center for Life Science, CC BY 4.0; implants procedurally modelled',
        'version': 2, 'fcut': float(FCUT), 'tcut': float(TCUT), 'pivot': [0, float(fem_min + 22), -6.0], 'tgap': TGAP, 'q': q,
    },
    'parts': out_parts,
}
json.dump(data, open(OUT, 'w'), separators=(',', ':'))
print('bytes', os.path.getsize(OUT))
