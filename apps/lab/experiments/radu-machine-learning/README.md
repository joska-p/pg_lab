# Radu Machine Learning experiment

A React-free port of `packages/radu-machine-learning` to the static `apps/lab` shell. One page, one
experiment folder: `index.html`, `main.ts`, `styles.css` and co-located pure logic and assets.

## Porting choices

- **Copied unchanged** (relative imports preserved): `data/dataset/ts_objects/features.ts` (the 320
  labelled sketches), `core/types.ts`, `core/api.ts`, `components/chart/{chart-utils,constants,types}.ts`
  and `assets/raduImgUrls.ts` with all 320 SVG files under `assets/radu-img/`. Vite's
  `import.meta.glob(..., { query: '?url' })` keeps those URLs relative to the built page.
- **State and UI glue rewritten**: the two legacy stores and every React component are replaced by
  module variables plus native DOM nodes created once. Selecting a drawing only toggles classes and
  updates text; the canvas, chart and gallery are never rebuilt on a control change.
- **Shell and controls**: `defineShellElement()`, `initTheme()` and `createSelect()` come from
  `apps/lab/ui/`. Shared `tokens.css`, `reset.css`, `shell.css` and `controls.css` are linked from
  the HTML; `styles.css` only adds experiment-specific rules. StyleX palette values became the
  `--pg-bright*` custom properties from the shared token sheet.
- **Sketchpad**: `CanvasStage` owns the 2D context, DPR-aware backing store and `ResizeObserver`, but
  no animation loop is subscribed — drawing is repainted on demand. Pointer events (with pointer
  capture) replace mouse events, so touch works too. Points are stored normalised to `[0, 1]` and
  scaled at paint time, which keeps strokes aligned after a resize; the exported `paths.json` is
  therefore normalised rather than in the old 600×400 pixel space.
- **Chart**: axes, ticks and one dot per sample are built once from the copied pure helpers. A single
  extra "current" dot follows the sketchpad feature counts, and one shared SVG tooltip follows the
  hovered or selected dot. Clicking a dot scrolls to the matching gallery entry.
- **Nearest neighbours**: the React source had no classifier — it only plotted the two features. The
  small pure `core/classify.ts` closes that gap: feature-wise normalised Euclidean distance over
  `[path count, point count]`, distance-weighted vote and a `k` selector (1/3/5). The nearest SVG
  sketches are shown as a preview strip and can be clicked to select/scroll to the original card.
- **Teardown**: every listener registered through `listen()` is removed on `pagehide` and
  `CanvasStage.destroy()` releases the observer and context bookkeeping.

## Non-goals

- No React, no state library, StyleX or workspace import aliases imports, and no changes outside this experiment folder.
- No train/test split, model persistence, backend or inference service: classification is an
  in-memory vote over the copied dataset.
- No compatibility with the old absolute-pixel `paths.json` format, and no import of path files.
- No continuous render loop, animation or shader work; the sketchpad is event-driven.
- No redraw of the 320-card gallery, no pagination or filtering beyond the original student rows.
- No new theme, typography or design tokens; the shared `apps/lab` shell styles are reused as-is.
