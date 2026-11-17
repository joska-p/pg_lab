# Sequencer (static lab port)

A static, dependency-light port of `packages/sequencer`. A numeric sequence is generated from a
rule and drawn by a stack of independent Canvas 2D layers. The canvas is created once in the HTML
and is never rebuilt when a control changes.

## What was ported

The DOM-free parts are copied from `packages/sequencer/src/**` with only import-path changes:

- `engine/` — `generateSequence` and the nine built-in rules (Recamán, Fibonacci, primes,
  triangular, Collatz, look-and-say, Padovan, squares, Stern–Brocot).
- `core/` — parameter descriptors, the layout computation, the paint pipeline and the ten Canvas 2D
  layers (nine drawing layers plus the Fourier overlay).
- `fourier/` — seeded harmonic-path rule, epicycle DFT worker, LRU cache and the optional orbit
  overlay.

## Rendering and lifecycle choices

`ui/canvas-stage.ts` owns the DPR-aware backing store and the `ResizeObserver`. It is used without
`subscribe()`: the source has no animation loop, so repaints are one-shot and coalesced on the next
`requestAnimationFrame` instead of keeping a RAF loop alive. `destroy()` runs on `pagehide`.

The original sized the canvas in device pixels and had no resize repaint. The port keeps coordinates
in CSS pixels (`render()` takes an explicit `RenderSize`, and three layers read `clientWidth` /
`clientHeight`) while `CanvasStage` applies the DPR transform. This preserves the geometry on HiDPI
screens and after a panel resize. Repainting on theme change is also new: the source read
`getComputedStyle(canvas).color` but never redrew when the theme changed.

Pan/zoom semantics are unchanged: wheel zooms around the cursor with a `[0.1, 5]` clamp and
two-decimal rounding, left drag pans, and Reset restores `{ zoom: 1, panX: 0, panY: 0 }`. The cursor
stays `grab` after a drag instead of being cleared.

## State and UI glue

The two former state stores become two module-level values in `state.ts`. The same actions clamp steps,
regenerate the sequence, toggle/add/remove layers, merge layer parameters and patch the viewport;
a small topic subscription (`sequence` / `layers` / `viewport`) replaces React selectors. The DOM
keeps the shell, sections, labels and mounts; `main.ts` creates each native control once and only
patches values, visibility and text. The layer list uses `replaceChildren()` on a control-only
container, never on an element containing the canvas.

The Fourier worker is kept: `fourier/store.ts` imports the shared `lib/worker-pool/` and creates the
worker with Vite's `new URL(..., import.meta.url)`. The source's DOM `CustomEvent` redraw bridge is
replaced by a direct `setFourierRedraw()` callback. The harmonic-path rule is registered explicitly
at startup rather than as an import side effect of the controls module.

### Deliberate simplifications

- The layer editor shows one shared options panel for the expanded layer instead of one inline
  panel per row. The parameters and their defaults are identical.
- The add-layer menu is an inline list of the remaining layers instead of a floating dropdown.
- UI copy follows the French wording of the other lab pages; rule names, layer names and identifiers
  keep the source wording.

## Run

From `apps/lab`, run `vp dev` and open `/experiments/sequencer/`. Vite discovers the page through
the existing `experiments/**/index.html` collection; no registration is needed.

## Non-goals

- No React, no state library, no JSX, no StyleX and no workspace import alias.
- No `ExperimentShell`, `Stage`, `ControlPanel`, `Select`, `Slider`, `Toggle`, `ErrorBoundary` or
  router from the old package.
- No WebGL: all ten layers are Canvas 2D, so neither `ui/gpu-stage.ts` nor `lib/surface/gpu/` is
  involved.
- No new dependency, no build configuration change and no change outside `apps/lab/`.

## Layout

```text
apps/lab/experiments/sequencer/
├── README.md
├── index.html          static shell, canvas and control sections
├── main.ts             control creation, DOM patching, startup and teardown
├── styles.css          page-specific layout
├── state.ts            module state, actions and topic subscriptions
├── canvas.ts           CanvasStage lifecycle, repaint coalescing, pan/zoom
├── engine/             pure sequence generation and rules
├── core/               parameter guards, render pipeline and Canvas 2D layers
└── fourier/            seeded rule, DFT worker, cache and epicycle overlay
```
