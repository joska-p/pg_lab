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
