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
