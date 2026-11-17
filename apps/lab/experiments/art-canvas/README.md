# Art Canvas (static port)

The original `packages/art-canvas` React app selected one of six shader experiences from a
dropdown. In `apps/lab`, each experience is a standalone page with its own HTML, `main.ts`, CSS and
canvas:

- `draw/` — the minimal animated cosine Shadertoy fragment, with no custom uniform.
- `spirale/` — the Archimedean spiral with its `u_gap` slider.
- `folded-space/` — three repeated-space folds and neon `1/abs(sin)` ridges.
- `atlas/` — the Fibonacci syllabic grid; seed, modulo and complexity are exposed.
- `manual/` — the discrete OKLCH colour band; divisions, chroma and lightness are exposed.
- `seed/` — the full seeded shader assembly pipeline (moods, palettes, modules and templates).

## Porting choices

- The six fragment shader sources are copied verbatim into co-located `shader/` folders and loaded
  with Vite `?raw` imports. The seed pipeline keeps the original relative module layout under
  `seed/core/`.
- `ui/gpu-stage.ts` wraps `GpuSurface`: one program is compiled at a time, the canvas is declared in
  HTML and is never recreated. Changing a uniform repaints a single frame; playback is shared by the
  common `page.ts` bootstrap.
- `page.ts` owns the shell, theme, status/error regions and playback button. The shared canvas CSS
  lives in `ui/styles/controls.css`.
- Native inputs created through `ui/controls.ts` replace the React `Slider`, `Select`, `TextInput`
  and `TextArea` components.

## Non-goals

- No React, Zustand, StyleX, `ErrorBoundary`, `Suspense` or `ExperimentShell`.
- No in-page experiment dropdown: navigation goes through the summary page and the main lab index.
- No URL-driven experiment selection, no shader source preview, and no global cross-page playback
  store. Each page owns its own loop and stops it on `pagehide`.
