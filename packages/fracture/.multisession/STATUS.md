# Fracture — workshop migration — STATUS

## Goal

Turn `@repo/fracture` (currently a Vite+ scaffold with a placeholder App) into a 2D
escape-time fractal workshop: migrate the three Mandelbrot pipelines found in
`/home/muratha/Dev/pg_lab/_TMP/fracture-to-migrate/src`, extract a shared pure core +
GLSL chunks, add a Julia experiment, and add workshop features (precision switcher,
camera readout, presets).

## Files

- `SPEC.md` — objective, scope, non-goals, target folder layout.
- `PLAN.md` — sessions S0..S6 with verification.
- `DECISIONS.md` — decisions (append-only).
- `SESSION_LOG.md` — session outcomes (append-only).

## Current state (verified)

- Destination scaffold builds: package-scoped `vp check` passes (8 files formatted,
  4 linted, 0 errors). Repo-scoped check reports 62 pre-existing lint failures in
  OTHER packages (glaze, glaze3d, mol-demo, automa, ui, art-canvas) — out of scope.
- Destination `src/`: `App.tsx` (placeholder Stage + theme toggle), `main.tsx`,
  `style.css`, `stores/appStore.tsx`.
- Source to migrate: `_TMP/fracture-to-migrate/src` — `components/`
  {ControlPanel, OriginalScene, PerturbationScene, DoubleSplitScene}.tsx,
  `core/*.ts` + 3 GLSL files, `stores/*.ts`, `styles/global.css`.
- New glaze: `GpuSurface` exposes `canvas` + `camera`; raw WebGL textures via
  `canvas.getContext('webgl2')` are still viable (same context instance glaze uses).
  `uniforms: (surface) => Record<string, UniformValue>` API is compatible.

## Next action

S1 — Workshop skeleton + naive Mandelbrot migration (see `PLAN.md`).
