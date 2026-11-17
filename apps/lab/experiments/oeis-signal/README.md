# OEIS Signal (static port)

The original React experiment streamed one value per animation frame from an OEIS-like integer
module into a canvas. This port keeps the naturals module (`a(n) = n`) and makes the rendering
explicitly switchable between two views.

## Porting choices

- The pure registry, module implementations, types and polyline renderer are copied into
  `core/`, `modules/` and `viz/` with their original relative imports. A `polyline.test.ts` is kept
  beside the renderer.
- Zustand selectors/actions are replaced by module-level state and native `<select>`/`<input>`
  controls from `ui/controls.ts`.
- `ui/canvas-stage.ts` owns the frame loop, DPR-aware sizing, `ResizeObserver`, single-frame paints
  and teardown. The canvas is declared in HTML and never recreated; changing the mode, term count
  or rate restarts the signal in place.
- Two visualisations are provided: `points` accumulates stroked circles, while `polyline` reuses the
  original fitted polyline renderer. The theme selector accepts light, dark and system values.

## Non-goals

- No React, Zustand, StyleX or shared playback store.
- No network access to OEIS: only the bundled naturals module is available.
- No export/recording of the generated image; only the live canvas is rendered.
- Manual visual verification is required for aesthetic parity; no browser is installed in the
  verification environment.
