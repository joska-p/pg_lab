# Fracture — 2D Fractal Workshop — SPEC

Objective: turn `@repo/fracture` from a single Mandelbrot explorer into a workshop
for 2D escape-time fractals — quick experimentation across fractal formulas, precision
strategies, and coloring/lighting.

## Vision (approved with the user)

- Unit of the workshop = a **formula experiment** (Mandelbrot, Julia, …). Precision
  strategy is an **axis inside** an experiment, not a separate experiment.
- Architecture follows the proven `art-canvas` pattern: an experiment registry; each
  experiment is a `modules/<formula>/` folder with lazy `Canvas` + `Controls`.
- Shared pure `core/` (no DOM/WebGL): double-single math, reference orbits, orbit
  textures, iteration policy, camera→complex mappings.
- Shared GLSL chunks (concatenated via `?raw` imports) to remove the 3× duplicated
  `oklchToRgb` / lighting / DS-arithmetic code.
- One shared camera per experiment across precision modes (a single glaze `Camera`
  passed to `GpuCanvas`) so toggling precision keeps position/zoom.

## Scope v1

1. Workshop skeleton: experiment registry + `App.tsx` rewired to `@repo/ui`
   (`ExperimentShell`, `ControlPanel`, `Stage`, `ErrorBoundary`); theme kept as
   scaffolded.
2. Migrate the 3 existing Mandelbrot pipelines into a single `mandelbrot` experiment
   with precision modes:
    - `naive` — float32, maxZoom 1e6
    - `double-split` — double-single (~48 bits), maxZoom 1e11
    - `perturbation` — reference orbit + DS, maxZoom 1e15
3. **One GpuCanvas per experiment**; the precision mode selects `fragmentShader` +
   uniform provider; shared camera (maxZoom = 1e15, the highest tier — lower tiers
   degrade honestly, which is the comparison value).
4. Extract pure core: `doubleSplit`, `iterationPolicy` (`computeMaxIterations`),
   `referenceOrbit` (reference + secondary), `orbitTextures`, `camera`
   (`ZOOM_WHEEL_SPEED` + per-precision center/scale mapping), `paramStore`
   (params + defaults + create/use/set).
5. GLSL dedup via `shaders/chunks/` (`oklch`, `lighting`, `ds-arithmetic`) + an
   `assemble` concat helper.
6. Controls on `@repo/ui` (`ControlPanel` / `ControlSection` / `ControlField`,
   `Slider` / `Select` / `Segmented` with `onValueChange`).
7. Workshop features: precision switcher per experiment; live camera readout
   (center/zoom/maxIterations); camera presets (curated deep-zoom spots +
   "capture current view"); view reset.
8. First new experiment: **Julia** (naive + double-split) with interactive `c`.
   Julia perturbation → backlog.

## Non-goals (v1)

- Julia perturbation; glitch-correction hardening (multi-reference, better fallback).
- Centers beyond float64 (BigInt / decimal).
- Time-based / animated / 3D fractals; orbit-trap palettes; distance-estimator coloring.
- Formal public "framework" API beyond the experiment registry — avoid
  over-abstraction.

## Target folder layout

```
src/
  App.tsx, main.tsx, style.css
  stores/            appStore.tsx, workshopStore.tsx, paramStore.ts, mandelbrotStore.ts
  core/              doubleSplit.ts, iterationPolicy.ts, referenceOrbit.ts,
                     orbitTextures.ts, camera.ts
  shaders/
    chunks/          oklch.glsl, lighting.glsl, ds-arithmetic.glsl
    mandelbrot/      naive.glsl, double-split.glsl, perturbation.glsl
    julia/           naive.glsl, double-split.glsl
    assemble.ts
  modules/
    mandelbrot/      experiment.ts, Mandelbrot.tsx, MandelbrotControls.tsx
    julia/           experiment.ts, Julia.tsx, JuliaControls.tsx
  experiments.ts     (registry)
```

## Conventions to follow

- `codex/docs/coding-conventions.md`: core/shell split; explicit ownership; don't copy
  state merely to observe; the object owning mutable state owns its change signal;
  add indirection only when it solves a real problem.
- Live camera readout (A5) must own its change signal (recommend a versioned camera
  wrapper + `useSyncExternalStore` — see D4).
- Docs/specs in English; discussions in French (AGENTS.md).
