# Fracture — DECISIONS (append-only)

New decisions are appended; history is never rewritten. Date format: YYYY-MM-DD.

---

## 2026-09-22 — Project scope & architecture (S0)

- D1 — **One GpuCanvas per experiment; precision is a prop** selecting
  `fragmentShader` + uniform provider. Rationale: single camera, single WebGL
  context, clear ownership — simpler than the original 3× `<Activity>`-warmed
  scenes. Fallback if switch-time shader recompilation jank proves bad in real
  use: revisit Activity pre-warming.
- D2 — **Shared camera per experiment, maxZoom = 1e15** (highest tier). Lower
  tiers render artifacts by design at extreme depth — that is the comparison
  value the workshop exists for.
- D3 — **GLSL chunks via `?raw` concat** (`assemble` helper), no runtime
  branching mega-shader. The two existing DS multiplication implementations
  (bitwise split vs 8193 split) must be reconciled in A4; pick a canonical one
  unless visuals change materially.
- D4 — **Camera readout reactivity**: the live camera must own its change
  signal. Plan: wrap the shared Camera so x/y/zoom setters bump a version
  cookie; readout consumes it via `useSyncExternalStore`. Explicitly rejected:
  copying camera state into a Zustand store per frame (conventions §3.3, §4).
- Exercise: `vp check` scoped to the package dir is the per-session gate.

## 2026-09-22 — Workshop skeleton & naive port layout (S1)

- D5 — **`fractalParamsUniforms` lives in `modules/mandelbrot/`**, not `core/`: it maps
  the param store onto shader uniform names, which is experiment-specific. Move to `core/`
  only if Julia (S6) proves a real shared need.
- D6 — **No precision state yet in S1**: `Mandelbrot.tsx` stays naive-only; the explicit
  precision map + any store field land with S2 when a second precision actually exists.
  Avoids speculative state (conventions §1.5).

## 2026-09-22 — Double-split precision (S2)

- D7 — **Precision lives in a sibling zustand store in `stores/mandelbrotStore.ts`**, not
  as a field in `FractalParams` nor as a third concern in `paramStore`. Rationale: the
  fractal params stay a pure `Record<string, number>` fed to `fractalParamsUniforms`
  (string-typed precision would leak into the uniform map); `paramStore` helpers
  (`createParamStore` / `useParams` / `setParam`) stay generic for Julia (S6). The
  experiment-scoped `mandelbrotStore.ts` module owns both params and precision.

## 2026-09-22 — Perturbation precision (S3)

- D8 — **The glaze `GpuSurface` is exposed through a sibling zustand store**
  (`stores/mandelbrotStore.ts`: `useMandelbrotSurface` / `setMandelbrotSurface`), dereferenced to
  `null` on unmount. Rationale: the surface is a live object owned by `GpuCanvas`; the store
  provides only reachability (conventions §3.2, §12.1). A plain ref would never notify an effect
  that must attach the `webglcontextrestored` listener as soon as the surface appears — the
  surface's mount timing is asynchronous (`useNodeResource` materializes it via reactive state).
  Applies to any later experiment that needs the surface (Perturbation only today).
