# glaze3D-perf — Diagnosis (evidence file, update with measured numbers)

Reference: `codex/glaze3D/mol-demo.js.txt` (origin, single RAF loop
`loop:769-779`, spheres `32x20` + cylinders `16 segs` at `739-763`,
pattern `BUF 900`, throttle `33ms`, early-out `angleTo<0.003` at `509-539`).

## Suspects (hypotheses, to confirm in P0)

H1 — Per-mesh uniform re-upload. `packages/glaze3d/src/renderer/renderer.ts`
`render:190-232` loops meshes; `drawPhong:408-468` calls `useProgram` +
~14 uniform uploads per mesh (projection, modelView, normal, diffuse,
specular, shininess, ambient, 4x dirColors + 4x dirDirections). At ~120
meshes (60 atoms + ~60 bonds, e.g. buckminsterfullerene) ≈ 1700 GL calls
per frame. three.js binds the program once and updates only per-object
state. Fix in P1 (hoist globals, per-mesh only modelView/normal/material).

H2 — Per-mesh allocs + generic 4x4 inverse. `drawPhong:420-434` does
`multiplyMatrices` + `copy().invert()` (`math/mat4.ts:159-318`) +
`new Float32Array(9)` per mesh per frame → ~7200 inverts+allocs/s at
60fps x 120 meshes. Molecule meshes are rigid (scale 1), so the generic
inverse is waste. Fix in P1 (reused temporaries, cheap normal path).

H3 — Two independent RAF loops. `MolCanvas.tsx:70-80` renders at 60fps,
`PatternCanvas.tsx:325-381` runs its own RAF (norm `computeNorm32Raw`
`lib/pattern/norm.ts:45-83` + fullscreen 900x900 shader). Origin has one
loop. Fix in P2 (single RAF owner, pattern on demand).

H4 — Per-frame allocs in controls. `controls/orbit.ts:157-159` allocates
2 `Quat` per `update()` while autoRotate runs forever, plus
`camera.updateMatrixWorld()` on every moved frame. Fix in P2 (module or
instance temporaries).

H5 — Tessellation + pixel budget. Spheres `32x20` (`lib/buildMolMesh.ts:13-19`)
and `setPixelRatio(min(dpr,2))` (`MolCanvas.tsx:43`) multiply vertex and
fill cost on HiDPI. Fix in P4 (segments config, pixelRatio clamp,
antialias/powerPreference review). Pattern `BUF 900` is origin-identical,
tune only last.

## Baseline protocol (P0)

- Dev-only timing (render ms + pattern ms + fps), mesh count, canvas
  buffer sizes. Record table below, SF6 (7 atoms) vs buckminsterfullerene
  (60 atoms), desktop DPR 1 vs DPR 2 if available.
- Confirm scaling: small molecule smooth + large molecule collapsed
  implicates H1+H2.

## Baseline results

Proxies for origin SF6/C60 (current registry has no SDF for those two;
origin `mol-demo.js.txt:191-261` used SF6 = 7 atoms/6 bonds, C60 = 60
atoms): smallest `cid-702.sdf` (counts line `9 8` → 9 atoms/8 bonds)
vs largest `cid-115374.sdf` (counts line `56 58` → 56 atoms/58 bonds).
Meshes = atoms + bonds (one sphere per atom + one cylinder per bond,
`buildMolMesh.ts:63-77`). Geometry: sphere 32x20 → 693 verts / 3840
indices (`sphere.ts:4-48`: 33x21 grid, 32x20x6); cylinder r16 → 70
verts / 192 indices (`cylinder.ts:4-46,64-85`: 17x2 side + 2x18 caps,
16x6 side + 2x16x3 caps). Buffers: mol canvas = CSS size x
`min(dpr,2)` (`MolCanvas.tsx:44`); pattern backing store fixed 900x900
desktop / 600x600 mobile (`PatternCanvas.tsx:252-254`).
Live timing via dev-only HUD (`?perf=1`, `lib/perf.ts` + `PerfHud.tsx`):
open the dev server, append `?perf=1`, select each molecule, read the
overlay after ~5s steady state.

| Case                            | Meshes | Buffer                    | Render ms    | Pattern ms   | Fps          |
| ------------------------------- | ------ | ------------------------- | ------------ | ------------ | ------------ |
| cid-702 (9a/8b, SF6 proxy)      | 17     | mol CSSxDPR / pat 900x900 | live pending | live pending | live pending |
| cid-115374 (56a/58b, C60 proxy) | 114    | mol CSSxDPR / pat 900x900 | live pending | live pending | live pending |

Live measure (user, dev server, `?perf=1`, steady state):

| Case       | fps | Render ms | Pattern ms | mol buffer | pat buffer |
| ---------- | --- | --------- | ---------- | ---------- | ---------- |
| cid-115374 | 12  | 0.66      | 1930.48    | 523x504    | 900x900    |
| cid-702    | 3   | 0.15      | 287.69     | 438x504    | 900x900    |

Reading: renderer is cheap (0.66 ms) even at 114 meshes — H1/H2 are
not the bottleneck. The pattern redraw (~1930 ms, fullscreen 900x900
shader + `norm.compute` on the main thread) saturates the main thread
and collapses fps to 12. Priority consequence: P2 (single RAF owner,
pattern strictly on demand) + pattern pixel/norm budget move ahead of
P1 in impact; P1 stays valid cleanup but will not fix smoothness.
Anomaly: small case shows fps 3 < large case fps 12 despite a cheaper
pattern redraw (288 vs 1930 ms) — fps EMA may have caught the molecule
switch hitch or different measure conditions; worth one steady-state
re-measure. User note: autoRotate can be disabled as a discriminating
test — with no rotation, `change` stops firing and the `angleTo<0.003`
early-out should freeze pattern redraws; if fps recovers to ~60, the
pattern-on-main-thread diagnosis is confirmed. No UI toggle exists
(autoRotate hardcoded `MolCanvas.tsx:46-53`); a dev-only `?noRotate=1`
flag is the cheapest way to run that test (proposed for P2).

Static scaling (code evidence, no GPU needed): 17 → 114 meshes (6.7x).
Per-mesh GL state calls in `drawPhong` (`renderer.ts:436-463`):
1 useProgram + 2 matrix4 + 1 matrix3 + 5 vec/float + 8 dir-light = ~16
(+ bind/draw/unbind) → ~270 vs ~1820 state calls/frame. Per-mesh
`copy().invert()` + `new Float32Array(9)` (`renderer.ts:420-434`): 17
vs 114 inverts+allocs/frame (1020 vs 6840/s at 60fps). Vertex load:
17 meshes = 6797 verts / 36096 indices; 114 meshes = 42868 verts /
226176 indices (all STATIC_DRAW, uploaded once, `renderer.ts:373-385`).

## H1–H5 verdicts (P0, code evidence)

- H1 CONFIRMED: per-mesh `useProgram` + full uniform re-upload
  (`renderer.ts:436-463`). Hoisting globals is valid P1 work.
- H2 CONFIRMED with correction: generic 4x4 `copy().invert()`
  (`renderer.ts:422`, `mat4.ts:159-318`) + `new Float32Array(9)` per
  mesh per frame (`renderer.ts:424`); `tmpModelView`/`tmpNormalSource`
  themselves are reused (`renderer.ts:149-150`), so only the 9-float
  array allocs. Registry max is 114 meshes, not 120 (~6840/s at 60fps).
- H3 CONFIRMED: two RAF loops (`MolCanvas.tsx:70-80`,
  `PatternCanvas.tsx:326-381`) vs origin's one; pattern RAF ticks at
  60fps but redraws at most every 33ms with the `angleTo<0.003`
  early-out (`PatternCanvas.tsx:347-348`, `norm.ts:17-18`).
- H4 CONFIRMED, scoped: 2 `Quat` allocs per `update()` but only on
  moved frames (`orbit.ts:146,157-159`); with autoRotate always on in
  the demo (`MolCanvas.tsx:46-53`) that is every frame (~120/s).
- H5 CONFIRMED: spheres 32x20 / cylinders r16
  (`buildMolMesh.ts:14-17`), `setPixelRatio(min(dpr,2))`
  (`MolCanvas.tsx:44`); pattern BUF 900 origin-identical, tune last.

(After P1/P2/P3/P4: append delta rows here, never overwrite.)

## P2 delta (code done, live numbers pending)

Single RAF owner = viewer loop (`MolCanvas.tsx:72-95`); pattern RAF
removed, `drawPattern` registered as `requestPatternDraw` on the
`ViewerHandle` (`PatternCanvas.tsx`, `viewer.ts:8-14`) with the 33 ms
throttle + `angleTo<0.003` early-out kept. `OrbitControls.update`
reuses 2 instance `Quat` temporaries (`orbit.ts`). `grep
requestAnimationFrame` over both `src/` hits only the viewer loop.
Dev-only `?norotate=1` freezes autoRotate (`perf.ts`, `MolCanvas.tsx`).
Live re-measure protocol: `?perf=1` (+ `?norotate=1` as discriminating
test — fps ~60 at rest confirms the diagnosis), cid-702 vs cid-115374.

| Case       | fps | Render ms | Pattern ms | note            |
| ---------- | --- | --------- | ---------- | --------------- |
| cid-115374 | —   | —         | —          | P2 pending live |
| cid-702    | —   | —         | —          | P2 pending live |

## P2-fix delta (code done, live numbers pending)

Root cause (code evidence): `PatternCanvas.tsx` cleanup called
`WEBGL_lose_context.loseContext()`; under dev StrictMode (double-invoked
effects, `main.tsx:7`) the remount reuses the same canvas element, gets
the lost context back, `makeProgram` throws, `setCpuFallback(true)` —
every dev-server session ran `drawPatternCPU` at 900x900 (810k px × N
atoms JS with cos/sin per redraw), synchronously inside the viewer RAF
(P2). 484 ms at 9 atoms → 1621 ms at 56 atoms matches that cost model;
the GPU shader is line-identical to the smooth origin. Fix: no
`loseContext()` (delete program + LUT texture only) + `isContextLost()`
guard; HUD shows `gpu`/`cpu` + `idle`; CPU path bounded to BUF 320/256

- 500 ms throttle. Re-measure protocol: `?perf=1`, cid-702 vs
  cid-115374 rotating — expect path `gpu`, `loops` 1, pattern <10 ms.

| Case       | fps          | Render ms | Pattern ms                | note                |
| ---------- | ------------ | --------- | ------------------------- | ------------------- |
| cid-115374 | 58 (loops 1) | 0.54      | 5.32 gpu (0.05/5.18/0.10) | P2-fix live, smooth |
| cid-702    | 60 (loops 1) | 0.16      | 0.98 gpu (0.00/0.95/0.03) | P2-fix live, smooth |

Reading: GPU path confirmed (`gpu`, `loops` 1), viewer + pattern each
well under a 16 ms frame — the issue is closed on numbers. Remaining
pattern cost is almost entirely `norm` (32x32 CPU grid: 0.95 ms at 9
atoms → 5.18 ms at 56 atoms, linear in atom count); GL fullscreen draw
is 0.03–0.10 ms. At a 33 ms throttle the norm cost is amortized and
needs no budget fix while it stays like this.

## P2 live (user, `?perf=1`, mol 476x420, pat 900x900)

| Case                     | fps (EMA, BROKEN — see below) | Render ms | Pattern ms                        |
| ------------------------ | ----------------------------- | --------- | --------------------------------- |
| cid-702 rot              | 2                             | 0.27      | 484.26                            |
| cid-115374 rot           | 227                           | 1.42      | 1621.02                           |
| cid-702 `&norotate=1`    | 60                            | 0.20      | 499.40 (stale: no redraw at rest) |
| cid-115374 `&norotate=1` | 61                            | 0.60      | 709.76 (stale)                    |

User feeling: <1 fps in all 4 rotating/norotate cases on Chrome + Firefox
incognito, while origin `https://davidromano.dev/` is smooth on the same
machine. Two instrumentation faults found and fixed (code, re-measure
pending): (1) fps was an instantaneous-dt EMA — blind to main-thread
blocking, reads ~60 between 500 ms stalls and 227 on overlapping
samples; replaced by windowed throughput (frames/window, HUD 2 Hz).
(2) No visibility into the pattern section: split into
proj/norm/gl spans (`proj/norm/gl` HUD line) to locate the 500–1600 ms.
(3) RAF loop registry (`loops` HUD field) to catch double loops.
Shader is line-identical to origin (`FS_SRC`), same BUF 900, same
throttle — so the stall is in OUR CPU-side section or GL setup, and the
span split will say which. `ff()` already exonerated (table lookup,
`formFactors.ts:153-163`).
