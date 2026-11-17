# Randomart experiment

A minimal, React-free randomart playground built on the static shell and the copied foundations in
`apps/lab/lib/`.

## Pipeline

`(grammar preset, seed, color space)` → `generate()` → `compile(expression, { space })` →
`GpuSurface.tryCreateProgram()` → `renderProgram()` on `onFrame()`.

The canvas is created once in `index.html`. Controls only swap the compiled `Program` and update
targeted DOM properties (`textContent`, `value`, `hidden`, `classList`, `dataset`). The formula and the
generated GLSL source are shown in `<details>` panels and refreshed in place.

## Controls

- **Grammaire** — a preset from `GRAMMAR_PRESETS`; adopting a preset also selects its suggested color
  space.
- **Graine** — free text validated with `parseSeed`; **Nouvelle graine** draws a fresh random seed.
- **Espace de couleur** — one of `COLOR_SPACES`.
- **Lecture / Pause** — subscribes to or unsubscribes from `GpuSurface.onFrame()`. With no
  subscriber left, `FrameLoop` stops on its own.
- **Régénérer** — replays the current draft and reinstalls the program.

While paused, a change still triggers a single frame so the result stays visible without resuming
the loop.

## Failures

- No WebGL2: a readable message is shown in the stage; the CPU-side formula and stats remain
  available.
- `ShaderError` (compile or link) and any generation/compilation error: the loop is stopped, the old
  program is released, and the message is shown in the stage. Fixing a control rebuilds the artwork.

`GpuSurface.destroy()` is called on `pagehide`.

## Non-goals

- No grammar editor: presets only, no weights or fine-grained operator controls.
- No post-processing, feedback passes or offscreen/batch rendering.
- No PNG or any other export.
- No framework imports from the former workspace packages.
