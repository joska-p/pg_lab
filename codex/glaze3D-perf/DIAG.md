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

| Case | Meshes | Buffer | Render ms | Pattern ms | Fps |
| ---- | ------ | ------ | --------- | ---------- | --- |
| SF6  | —      | —      | —         | —          | —   |
| C60  | —      | —      | —         | —          | —   |

(After P1/P2/P3/P4: append delta rows here, never overwrite.)
