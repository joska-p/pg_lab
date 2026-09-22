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

- S1 done: workshop skeleton + naive Mandelbrot migrated.
    - `experiments.ts` registry + `stores/workshopStore.tsx` (active experiment; art-canvas
      shape). `App.tsx` rewired: ExperimentShell + ControlPanel + Stage + ErrorBoundary;
      theme store kept.
    - `modules/mandelbrot/`: `experiment.ts` (lazy entries), `Mandelbrot.tsx` (naive via
      GpuCanvas, shared camera maxZoom 1e15 = D2), `MandelbrotControls.tsx` (Iterations /
      Lighting / Color groups on `@repo/ui`), `fractalUniforms.ts`.
    - `core/camera.ts` (ZOOM_WHEEL_SPEED), `core/iterationPolicy.ts`
      (computeMaxIterations), `stores/paramStore.ts` (create/use/set + defaults),
      `stores/mandelbrotStore.ts`.
    - `shaders/mandelbrot/naive.glsl` (= migrated `mandelbrot-original.glsl`).
- `vp check` (package scope): pass — 23 files formatted, 0 lint/type errors.
- `vp build` (package scope): pass — lazy chunks `Mandelbrot` / `MandelbrotControls`
  emitted separately.
- Dev spot-check: user confirmed the dev run works (renders, controls, theme).

## Next action

S2 — double-split precision (see `PLAN.md`).
