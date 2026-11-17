# Pixel Manipulator experiment

A single static page that ports the `pixel-manipulator` experiment and the DOM-free image-processing
engine behind it into `apps/lab/`. No React, no state library, no StyleX and no workspace import aliases.

## Pipeline

`(uploaded ImageData, workflow steps)` → serialize + transfer a `Uint8ClampedArray` → module Web
Worker → `Registry` + `FusionScheduler` + tiled convolution → `ImageData[]` snapshots → fixed preview
canvases / before-and-after compare canvas.

The DOM-free engine now lives once in `apps/lab/lib/pixel-core/`, shared with the `pixel` docs page:

- `lib/pixel-core/processor/**` — `processImage()`, the manifest-derived `Step` union, buffer
  manager, fusion scheduler, step dispatcher, neighborhood tiling and all 18 manipulations.
- `lib/pixel-core/worker/pipeline-worker.ts` — the worker entry point, with a locally declared
  worker scope (the app tsconfig uses DOM types) and a runtime filter on the transferred buffers.
- `lib/pixel-core/worker/serialization.ts` — response validation, copied verbatim.

`lib/pixel-core/worker/process-image-in-worker.ts` keeps the catalog helpers (`getManipulations`,
`getManipulationsByAccess`) and the same serialize/deserialize rules. Its module-level pool became
`createPixelPool()`, which creates the worker with Vite's bundler pattern next to the bridge:

```ts
new Worker(new URL('./pipeline-worker.ts', import.meta.url), { type: 'module' });
```

That keeps the emitted worker chunk correctly hashed for both pages. The pool is the shared
`apps/lab/lib/worker-pool` with `maxPoolSize: 1`, so replies stay in request order; a generation
counter in `main.ts` additionally drops any stale result. This extraction happened in Session 7:
the former `core/processor/**` and `core/worker/**` copies inside this experiment were removed, and
`main.ts` / `presets.ts` now import from `../../lib/pixel-core/**`.

## Porting choices

- All React/state-library glue is gone. `imageSource`, `outputs`, `workflow`, view mode, compare position
  and processing state are module variables in `main.ts`, and the panel uses native DOM controls via
  `ui/controls.ts` plus `ui/shell.ts` and `ui/theme.ts`.
- Every canvas is declared once in `index.html`: one source preview, eight step previews, one compare
  canvas and one hidden canvas reused for file decoding and the sample image. Control changes only
  toggle `hidden`, update `textContent`/`dataset` and repaint existing canvases. The compare renderer
  draws the committed source and result canvases, so it does not build offscreen canvases per render.
- The eight workflow presets, their names, descriptions, steps and option values are copied verbatim
  into `presets.ts`. The manipulation selector is built from the engine catalog, so names, defaults,
  slider ranges and steps still come from each manipulation's UI metadata.
- Upload (file picker and drag-and-drop), add/remove/reorder steps, per-step sliders, explicit
  **Execute workflow**, **Clear workflow**, **Clear outputs**, grid/compare toggle, draggable compare
  handle, PNG download, status line and error box all follow the original experiment's behavior.
- A generation counter discards late worker replies, and the processing overlay is surfaced as
  DOM state instead of a React conditional.
- On `pagehide`, a single `AbortController` removes every listener registered by `main.ts` and
  `pool.teardown()` terminates the worker and rejects queued jobs.

## Non-goals

- This is not the `packages/pixel` documentation site: no overview/internals/API views, no TypeDoc
  pages and no `usePixel()` hook. Only the manipulator experiment is ported.
- No zoom/lightbox modal. The original `ImageLightbox` and its Escape-key hook are not reproduced;
  previews and per-output PNG download remain available.
- The workflow is capped at eight steps because the HTML owns a fixed canvas pool. The original
  legacy store allowed an unbounded list.
- One worker instead of a `navigator.hardwareConcurrency`-sized pool: ordering is deterministic and
  the UI stays off-thread, at the cost of parallel throughput.
- No `maximumPixels` control; the worker keeps its 16,000,000-pixel default (with the engine's
  auto-downscale step for larger sources).
- The shared light/dark theme replaces the original light/dark/system state-library setting.
- `ui/canvas-stage.ts` is deliberately not used: it owns an animated, DPR-scaled render loop, while
  these previews are static `ImageData` paintings at the image's natural resolution.
- No framework code from `packages/*` is imported; the engine files were copied so the old packages
  remain untouched until the final migration session.
