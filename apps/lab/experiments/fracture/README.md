# Fracture — static port

This folder is a dependency-free static port of `packages/fracture`. It is a
single page with a single WebGL2 canvas declared in `index.html`; the canvas is
never removed or recreated when the experiment or any control changes.

## Layout

- `index.html` — shell, stage, canvas and all panel markup.
- `main.ts` — module-level state, native DOM controls, camera input, render
  scheduling and lifecycle. It is the only "glue" file.
- `styles.css` — page-specific section/readout styling; stage, panel, canvas
  and control styling come from `ui/styles/`.
- `core/` — DOM-free code copied from the React package:
    - `camera.ts`, `doubleSplit.ts`, `iterationPolicy.ts`, `orbitTextures.ts`,
      `presets.ts`, `referenceOrbit.ts` (verbatim),
    - `shaders/assemble.ts` and `shaders/chunks/*.glsl` (verbatim),
    - `modules/*/*.glsl`, the five shader bodies imported with `?raw`,
    - `params.ts`, `experiments.ts`, `uniforms.ts`, `perturbationRuntime.ts` —
      legacy state/React state and per-scene uniform builders rewritten as
      plain data and pure functions.

## Porting choices

- **`GpuStage`** owns one compiled program at a time. Switching experiments
  calls `setFragment()` with that pipeline's assembled shader; the same canvas
  and `GpuSurface` are reused. A single uniform provider dispatches to the
  copied uniform builder for the active experiment, so control changes only
  need `renderOnce()`.
- **On-demand rendering** matches the source's `useDemandRender` policy: the
  stage is paused by default and paints once after mount, after every control
  or camera change, on WebGL context restore, and on canvas resize (via a
  `ResizeObserver`, which also covers dragging the shell panel). The panel's
  Play/Pause button is an optional static-page affordance for continuous
  rendering; paused is the default and preserves source behaviour.
- **State** is one `FractalParams` object and one `Camera2D` per experiment,
  held in module variables instead of five legacy stores. Each tier keeps its
  original zoom ceiling (1e6 / 1e11 / 1e15). The shared slider ranges, Julia
  constant defaults (-0.8, 0.156), presets, iteration policy, optics/lighting
  parameters and shader chunk assembly are unchanged.
- **Camera interaction** reproduces `useCameraControls`: left/middle-button
  pan with pointer capture and cursor-anchored wheel zoom at speed 1.2. The
  curated presets, "Capture current view" and "Reset view" use the original
  `cameraToComplex` / `complexToCamera` mapping. Captured views are tracked per
  experiment (the React version reset them when switching modules).
- **Perturbation orbits** are computed lazily on view changes with the original
  CPU reference-orbit code. `PerturbationRuntime` replaces the React refs that
  held the RG32F textures; textures are rebuilt from cached CPU orbits after a
  context loss and disposed on `pagehide`.

## Non-goals

- No React, no state library, no workspace import alias imports or change outside this folder.
- No dev perf HUD (`lib/perf.ts`), no perf counters, no `PerfSnapshot` polling,
  and no StrictMode loop diagnostics.
- No lazy-loaded component boundaries or per-module control components: the
  panel is one static markup tree with shared controls.
- No new experiments, shader features, colour schemes or camera projections.
- No persistence of parameters, presets or camera state across reloads.

## Verification

Run `vp -C apps/lab check <paths-in-this-folder>` after editing these files
(for example `vp -C apps/lab check experiments/fracture/main.ts`). The Vite
config picks up `index.html` automatically from the experiments directory.
