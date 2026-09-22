# Fracture — PLAN (sessions)

Verification command per session: `vp check` run **from the package dir**
(`/home/muratha/Dev/pg_lab/packages/fracture`) — must be green. Repo-scoped
`vp check` has pre-existing failures in other packages; ignore them.

Each session ends with the multisession ritual: update `STATUS.md`,
append one dated line to `SESSION_LOG.md`, append new decisions to
`DECISIONS.md`.

Source to migrate: `/home/muratha/Dev/pg_lab/_TMP/fracture-to-migrate/src`.
Reference pattern: `packages/art-canvas` (experiment registry, lazy modules).

---

## S0 — Baseline & starting point [DONE]

Verified:

- Package-scoped `vp check` green (8 files formatted, 4 linted, 0 errors).
- Scaffold renders placeholder Stage + theme toggle.
- Repo-scope lint noise (62 failures) is in other packages — not actionable.

Deliverable: this multisession folder.

## S1 — Workshop skeleton + naive Mandelbrot migration

- Create experiment registry `experiments.ts` + `workshopStore` (active
  experiment; food art-canvas shape).
- Rewire `App.tsx`: `ExperimentShell` + `ControlPanel` + `Stage` +
  `ErrorBoundary`; keep theme store.
- Port `modules/mandelbrot/`: `experiment.ts` (lazy entry),
  `Mandelbrot.tsx` (`naive` precision via GpuCanvas), `MandelbrotControls.tsx`
  (iterations / lighting / color groups on `@repo/ui`).
- Extract `core/iterationPolicy.ts`, `core/camera.ts` (`ZOOM_WHEEL_SPEED`),
  `stores/paramStore.ts` (create/use/set + defaults), `stores/workshopStore.tsx`,
  `stores/mandelbrotStore.ts`.
- Land D1 (single GpuCanvas + precision axis) and D2 (shared camera) decisions.
- Verify: `vp check` green; `vp dev` — Mandelbrot renders, pan/zoom works,
  controls are live, theme toggle works.

## S2 — double-split precision

- Extract `core/doubleSplit.ts`; port the double-split shader + uniform provider
  (center→DS pair mapping with the drift fix).
- Add the precision axis: a Segmented naive ↔ double-split sharing one camera.
- Verify: switching keeps position/zoom; zoom > 1e6 stays sharp in
  double-split; `vp check` green.

## S3 — perturbation precision

- Extract `core/referenceOrbit.ts` (computeMaxIterations path + reference +
  secondary) and `core/orbitTextures.ts` (raw RG textures; lazy create/upload/
  dispose; keep the NaN-sentinel recompute and the `webglcontextrestored`
  re-upload; textures via `canvas.getContext('webgl2')` — same context as
  glaze's).
- Port the perturbation shader + uniform provider as the third precision mode.
- Verify: deep zoom to ~1e13–1e15 renders; switching ds ↔ perturbation works;
  clean dispose on unmount; a forced context restore re-renders without crash;
  `vp check` green.

## S4 — GLSL dedup

- Extract `shaders/chunks/{oklch,lighting,ds-arithmetic}.glsl` + `assemble.ts`
  (prepends `#version`/precision, concatenates chunks + body).
- Refactor all 3 shaders to consume the chunks.
- Resolve D3 (two DS multiplication implementations — bitwise split vs 8193
  split; pick canonical or keep both under distinct names, judged by visuals).
- Verify: visual spot-check before/after at ~3 zoom levels (incl. deep);
  `vp check` green.

## S5 — Workshop UI: precision switcher, camera readout, presets

- Precision switcher (Segmented) surface; live camera readout
  (centerRe/Im, zoom, maxIterations) — implement the D4 change signal;
- Camera presets: curated deep-zoom spots + "capture current view" +
  view reset.
- Verify: switching keeps position; readout is live while panning/zooming;
  preset navigation works from any zoom; `vp check` green.

## S6 — Julia experiment (naive + double-split)

- Add `modules/julia/`: `experiment.ts`, `Julia.tsx`, `JuliaControls.tsx`
  (c via NumberFields), `shaders/julia/{naive,double-split}.glsl` reusing
  chunks + core.
- Verify: Julia renders; c controls are live; precision switch works;
  `vp check` green.

---

## Backlog (post-v1)

- Julia perturbation (adapts reference-orbit math).
- Glitch-correction hardening (multi-reference orbits, better fallback).
- Preset persistence (localStorage).
- "Pick c from Mandelbrot" pinning.
- BigInt / decimal centers beyond 1e15.
