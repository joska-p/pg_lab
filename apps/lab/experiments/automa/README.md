# Automa (static lab port)

A static, dependency-light port of the `packages/automa` React experiment. The page runs the same
GPU cellular automaton: a ping-pong state texture is stepped by GLSL, painted with creature stamps,
and displayed through a cell-mesh shader.

## What was ported

`core/` mirrors the source module tree so the original relative imports and `?raw` GLSL imports are
unchanged:

- `core/engine/config.ts`, `grid.ts`, `rng.ts` — grid defaults, seeded generation, deterministic RNG.
- `core/engine/rules/registry.ts` — B/S/C rule parser and the five built-in rules.
- `core/engine/creature/` — all 18 built-in patterns and the creature registry.
- `core/engine/gpu/SimulationEngine.ts` — stepping, painting, creature placement, generation
  tracking and playback clock. It is DOM-free apart from the injected `GpuSurface` resources.
- `core/engine/gpu/shaders/` — the three GLSL fragments (`sim-step`, `gpu-paint`, `cell-mesh`),
  copied verbatim.
- `core/lib/` — color derivation, constants, grid placement and pointer-to-cell coordinates.

The only edits inside `core/` are the three former workspace import aliases, which now point at
`apps/lab/lib/surface/*` by relative path.

## GPU and lifecycle choices

The lab's `GpuSurface` owns the WebGL2 context, frame loop, resize, pointer bookkeeping and context
restoration. `GpuStage` is **not** used: this experiment needs ping-pong render targets, so
`main.ts` creates and owns four resources directly:

- `GpuSurface.createTargetPair(cols, rows)` for the cellular state (`TargetPair.step` handles the
  ping-pong swap and `u_state` binding).
- `createProgram(simStepShader)` and `createProgram(gpuPaintShader)` for the simulation passes.
- `createProgram(cellMeshShader)` for the display pass, rendered with `surface.renderProgram` and the
  same layout/camera uniforms as the React source.

`SimulationEngine.destroy()` releases the simulation programs and target pair; the display program
is released separately. On WebGL context restoration the engine is rebuilt from the current rule,
speed and grid settings, so the grid is reseeded and the generation counter restarts as in the
original `onContextRestored` path. On `pagehide` the frame subscription is removed, the engine and
display program are destroyed, and the surface is destroyed.

The frame loop subscribes only while playing. Control changes while paused repaint through a
one-shot frame subscription, so the grid never keeps an idle RAF loop alive.

## State and UI glue

All former state-library fields are plain module variables in `main.ts`: engine/resources, rule id,
derived state colors, speed, generation, running flag, brush mode and selected creature. Native
listeners replace React handlers; `createSelect` and `createSlider` come from `apps/lab/ui/controls`,
while `pg-shell`, `initTheme` and the shared `pg-canvas-*` classes come from the lab UI kit.

Preserved behavior and defaults: 400×300 grid, density 0.2, seed 42, Conway as the initial rule,
100 ms step interval (50–1000 ms slider), left-drag painting, middle-drag panning, wheel zoom around
the cursor, right-click menu suppression, draw/erase modes, Randomize/Clear, single Step, rule and
creature selection, and generation readout. Creature stamps are centered on the clicked cell and
are clipped to the grid exactly as in the source.

### Deliberate simplifications

- Only the dead (state 0) and alive (state 1) color pickers are shown. The source recomputes all
  derived state colors from those two values on every change, so exposing the derived swatches as
  editable fields had no lasting effect. Derived colors are still uploaded to the shader.
- `Pixel` is an explicit first entry in the pattern select. The source default brush is `pixel` but
  its React select omitted that option, so the visible selection disagreed with the active tool.
- The Step button is disabled while playing (the source has the same guard in its action).
- Shell wrappers, error boundaries, routing, StyleX, Material/React component libraries, the state library and
  any workspace import alias are intentionally absent. No `package.json`, tsconfig or shared UI file was
  changed.
- UI copy follows the French wording of the other static lab pages; code, docs and identifiers use
  English.

## Run

From `apps/lab`, run `vp dev` and open `/experiments/automa/`. The page is picked up by the existing
Vite multi-page input collection; no registration step is needed.

## Non-goals

- No React, no state library, JSX or component tree.
- No `ExperimentShell`, `Stage`, `ControlPanel`, `Button`, `Select`, `Slider`, `ColorField`,
  `ShellWrapper`, `ErrorBoundary` or router/material wrappers from the old package.
- No new experiment registration, workspace dependency, test suite or build configuration: Vite
  discovers this page through the existing `experiments/**/index.html` glob.
- No attempt to preserve transient React-only artifacts such as the mismatched pixel-select label.

## Layout

```text
apps/lab/experiments/automa/
├── README.md
├── index.html          static shell, canvas and controls markup
├── main.ts             module state, native DOM wiring, GPU resource lifecycle
├── styles.css          page-specific layout on top of ui/styles/
└── core/               DOM-free simulation port (engine/, lib/, shaders/)
```
