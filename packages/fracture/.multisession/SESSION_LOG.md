# Fracture — SESSION LOG (append-only)

One dated line per session outcome, appended — never rewritten. Verified facts
only (command results, `file:line` refs).

Sample entries:

```
2026-09-22 · S1 · workshop skeleton + naive Mandelbrot
  - experiments.ts + workshopStore added.
  - vp check: pass (package scope).
```

---

2026-09-22 · S0 · baseline & starting point

- `vp check` (package scope): pass — 8 files formatted, 4 linted, 0 errors.
- `vp check` (repo scope): green files but 62 pre-existing lint failures in
  other packages (glaze, glaze3d, mol-demo, automa, ui, art-canvas) — out of
  scope, not actionable.
- Verified glaze API compat for the migration: `GpuSurface` exposes `canvas`
    - `camera` (packages/glaze/src/gpu/GpuSurface.ts:47-48,76); uniforms API is
      `(surface) => Record<string, UniformValue>`; raw textures via
      `canvas.getContext('webgl2')` reuse glaze's context instance.
- Multisession folder created: STATUS / SPEC / PLAN / DECISIONS / SESSION_LOG.

2026-09-22 · S1 · workshop skeleton + naive Mandelbrot

- `experiments.ts` registry + `stores/workshopStore.tsx` (active experiment, art-canvas
  shape); `App.tsx` rewired to ExperimentShell / ControlPanel / Stage / ErrorBoundary,
  theme store kept.
- Ported `modules/mandelbrot/`: `experiment.ts` (lazy entries), `Mandelbrot.tsx` (naive
  via GpuCanvas, shared camera maxZoom 1e15 = D2), `MandelbrotControls.tsx` (Iterations /
  Lighting / Color groups on `@repo/ui`), `fractalUniforms.ts`.
- Extracted `core/camera.ts` (ZOOM_WHEEL_SPEED), `core/iterationPolicy.ts`
  (computeMaxIterations), `stores/paramStore.ts` (create/use/set + defaults),
  `stores/mandelbrotStore.ts`; `shaders/mandelbrot/naive.glsl` (= original shader).
- `vp check` (package scope): pass — 23 files formatted, 0 lint/type errors.
- `vp build`: pass — lazy chunks `Mandelbrot` / `MandelbrotControls` emitted separately.
- Dev spot-check: user confirmed the dev run works (render, controls, theme toggle).

2026-09-22 · S2 · double-split precision

- `src/core/doubleSplit.ts`: ported `splitDouble` (migration `core/doubleSplit.ts`).
- `src/shaders/mandelbrot/double-split.glsl`: ported migration
  `core/mandelbrot-double-split.glsl`; non-comment diff vs source = zero (checked via
  comment-stripped `diff`).
- `stores/mandelbrotStore.ts`: added `MandelbrotPrecision = 'naive' | 'double-split'` +
  `useMandelbrotPrecision` / `setMandelbrotPrecision` (sibling zustand store; params
  store unchanged — D7).
- `Mandebrot.tsx`: single GpuCanvas keeps shared camera (maxZoom 1e15); SHADERS/UNIFORMS
  record select `double-split.glsl` + center→DS-pair provider (`splitDouble`) per
  precision.
- `MandelbrotControls.tsx`: added "Precision" ControlSection with a Segmented
  (Naive (f32) / Double-split).
- `vp check` (package scope): pass — 14 files, 0 lint/type errors (one `--fix` pass
  for formatting).
- `vp run build`: pass — double-split.glsl inlined in `Mandelbrot` lazy chunk
  (57.26 kB).
