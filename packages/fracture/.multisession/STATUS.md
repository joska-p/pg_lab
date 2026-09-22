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
- S2 in progress: double-split precision ported.
    - `core/doubleSplit.ts` (= migrated `splitDouble`).
    - `shaders/mandelbrot/double-split.glsl` (= migrated `mandelbrot-double-split.glsl`,
      semantics unchanged by diff).
    - `stores/mandelbrotStore.ts` now also owns `MandelbrotPrecision` ('naive' |
      'double-split') + `useMandelbrotPrecision` / `setMandelbrotPrecision` (D7).
    - `Mandelbrot.tsx` = single GpuCanvas, shared camera (maxZoom 1e15); SHADERS/UNIFORMS
      maps select shader + provider by precision (naive panOffset ↔ double-split
      center→DS-pair with drift fix).
    - `MandelbrotControls.tsx` gains a "Precision" Segmented (Naive f32 / Double-split).
- `vp check` (package scope): pass — 14 files, 0 lint/type errors (after `--fix` format).
- `vp run build`: pass — double-split.glsl inlined into the `Mandelbrot` lazy chunk.
- Dev spot-check: user validated S2 — precision switch keeps position/zoom; zoom > 1e6
  stays sharp in double-split.
- S3 done: perturbation precision ported.
    - `core/referenceOrbit.ts` (= migrated `perturbationOrbit.ts` minus `computeMaxIterations`
      already owned by `core/iterationPolicy.ts`): `ReferenceOrbit`, `computeReferenceOrbit`,
      `computeSecondaryOrbit`.
    - `core/orbitTextures.ts` (= migrated `createOrbitTextures.ts`): raw RG32F textures, lazy
      create/upload/dispose, recreated when orbit length changes.
    - `shaders/mandelbrot/perturbation.glsl` (= migrated `mandelbrot-perturbation.frag`, semantics
      unchanged by comment-stripped diff).
    - `stores/mandelbrotStore.ts`: `MandelbrotPrecision` now `'naive' | 'double-split' |
      'perturbation'`; added `surfaceStore` — `useMandelbrotSurface` / `setMandelbrotSurface` hold
      the glaze `GpuSurface` as a stable reference (reachability, §3.2), dereferenced on unmount.
    - `Mandelbrot.tsx`: `perturbationUniforms` provider (camera→center/viewScale mapping = D2;
      NaN-sentinel view-changed recompute; primary+secondary CPU orbits; split scales; textures
      via `canvas.getContext('webgl2')` reusing glaze's context). `webglcontextrestored` listener
      re-uploads the last orbits via the store's surface. Refactor: `WORLD_SCALE` constant shared
      by double-split + perturbation.
    - `MandelbrotControls.tsx`: Precision Segmented now Naive / Double-split / Perturbation.
- `vp check` (package scope): pass — 0 lint/type errors (after `--fix` format).
- `vp run build`: pass — `Mandelbrot` lazy chunk 68.80 kB (perturbation.glsl inlined).
- Dev spot-check: user validated S3 — deep zoom to 1e13–1e15 renders; ds ↔ perturbation switch
  keeps position/zoom; dispose clean on experiment switch.

## Next action

S4 — GLSL dedup: extract `shaders/chunks/{oklch,lighting,ds-arithmetic}.glsl` + `assemble.ts`,
refactor the 3 shaders to consume the chunks, resolve D3 (bitwise vs 8193 DS split) — see
`PLAN.md`.
