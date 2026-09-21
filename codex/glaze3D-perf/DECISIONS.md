# glaze3D-perf — Decisions (append-only, never rewrite)

- 2026-09-21 (P0): new project `codex/glaze3D-perf/` for the two follow-ups
  of closed `codex/glaze3D/` S0–S10; old plan archived to
  `codex/glaze3D/archive/PLAN-S0-S10.md`. Scope = `glaze3d` + `mol-demo`
  only, `ui` out of scope.
- 2026-09-21 (P0): carried over — lib > viewer on API arbitration
  (`codex/glaze3D/01-objectif.md:40-45`); nuance for perf: viewer-measured
  numbers drive lib changes, API shape still favors reuse (B8, no
  molecule-specific API in `glaze3d`).
- 2026-09-21 (P0): carried over — WebGL2 only, right-handed, angstrom
  units (`codex/glaze3D/03-specs.md:9-13`); `matrixWorldInverse` stays the
  pattern integration contract (read `elements`, `glaze3d` never knows the
  pattern); light budget 1 ambient + 4 directional compile-time.
- 2026-09-21 (P0): measure before optimizing — no perf step is done without
  a before/after number recorded in `DIAG.md` (fps + frame time, SF6 vs
  C60). Conventions: start by reading `STATUS.md` only; evidence
  (`file:line` + command output) before synthesis; `vp check` green per
  touched package.
- 2026-09-21 (P0): iteration rule — existing tests must not slow down perf
  iteration. If a perf experiment breaks tests, note it and move on; fix
  tests afterwards (P6 or dedicated session), not during the experiment.
- 2026-09-21 (P0): live verification (dev server, visual smoothness) is done
  by the user, not the agent. Agent steps end with `vp check` + a short
  manual protocol (what to open, what to compare); no agent-run dev server
  or visual sign-off required in step DoDs.
- 2026-09-21 (P0): baseline proxies — registry has no SF6/C60 SDFs, so P0
  uses cid-702 (9a/8b, 17 meshes) as the small case and cid-115374
  (56a/58b, 114 meshes) as the large case; scaling argument unchanged
  (6.7x meshes, ~270 vs ~1820 GL state calls/frame).
- 2026-09-21 (P0): instrumentation choice — dev-only `?perf=1` HUD with
  module-level counters polled at 2 Hz (no Zustand, no per-frame React
  work, zero cost when flag absent); render-ms measured around
  `renderer.render`, pattern-ms around project+norm+draw; EMA smoothing.
- 2026-09-21 (P2): single RAF owner = viewer loop; pattern registers
  `requestPatternDraw` on the mol-demo-local `ViewerHandle` (contract
  kept: `matrixWorldInverse.elements` read, `glaze3d` unaware). Throttle
  33 ms + `angleTo<0.003` early-out unchanged. Controls allocs fixed with
  instance temporaries (no API change).
- 2026-09-21 (P2): reprioritization on live evidence — renderer ~0.2-0.7
  ms/frame is exonerated, so P1 (uniform hoisting) and P3 (draw-call
  strategy) drop below the pattern budget in impact; after the P2 live
  delta, next is the pattern per-redraw cost (BUF 900 fullscreen shader
  - norm), currently P4 territory. Possible environment factor: 900x900
    x60-iteration fragment cost at ~2 s smells like software GL on the
    user's machine — confirm via `?norotate=1` + re-measure before sizing
    the budget fix.
- 2026-09-21 (P2): fps EMA was wrong by construction (instantaneous
  1000/dt EMA reads ~60 between blocking stalls, 227 on overlapping
  samples) — replaced by windowed throughput computed on HUD poll;
  pattern section split into proj/norm/gl spans; RAF loop counter added
  (`loops` — >1 in steady state means a lifecycle bug). Origin shader is
  line-identical to ours (same FS, BUF 900, throttle), so the stall is in
  our CPU-side section or GL setup until the spans say otherwise.
- 2026-09-21 (P2-fix): root cause of the stall — dev StrictMode mounts,
  cleans up, and remounts `PatternCanvas` on the same canvas element, and
  the cleanup called `loseContext()`; the remount then got a lost WebGL2
  context, `makeProgram` threw, and the app fell back to `drawPatternCPU`
  at 900x900 (500–1600 ms scaling with atom count — matches the user
  numbers). Cleanup now deletes program + LUT texture only, plus an
  `isContextLost()` guard. HUD reports the active path (`gpu`/`cpu`) and
  a `idle` flag when no redraw happened for >750 ms (stale EMA).
- 2026-09-21 (P2-fix): CPU fallback budget — a fallback that burns the
  main thread is not a fallback. CPU path now renders at BUF 320 desktop
  / 256 mobile (~8x fewer pixels) with a 500 ms throttle (GPU keeps
  900/600 + 33 ms): the viewer stays interactive, the pattern updates at
  ~2 Hz. If WebGL2 is truly absent this is the honest trade-off; the
  normal case must read `gpu` in the HUD.
- 2026-09-21 (P2-fix): live numbers close the perf half — render ≤0.54
  ms, pattern ≤5.32 ms (norm-dominated, linear in atoms, amortized by
  the 33 ms throttle), GL draw ≤0.10 ms. P1 (uniform hoisting), P3
  (draw-call strategy), and P4 (tessellation/pixel budgets) stay parked:
  no budget fix without a measured need. Remaining work toward the goal
  is P5 overlay layout.
- 2026-09-21 (P5): overlay composition — one `.mol-stage` relative parent
  (`App.tsx` only): pattern absolute background with
  `pointer-events:none` (drag-rotate + drop bubble to the parent, as
  origin `mol-demo.js.txt:798-816`), molecule absolute foreground
  (transparent clear, so the pattern shows through; `resizeMol` reads the
  stage rect so the camera aspect follows it), molecule-name label as an
  absolute overlay with text-shadow for readability. No `ui` change.
- 2026-09-21 (P5-fix): shared-handle ownership — the `ViewerHandle` object
  is owned by `App` and mutated (never replaced) by both canvases, so
  `requestPatternDraw` registration is mount-order independent. Replacing
  the object couples correctness to sibling order (P5's reorder silently
  dropped the callback: blank pattern, HUD `pattern 0.00ms idle`,
  `pat -`); mutating fields keeps each canvas's contribution across
  StrictMode remounts.
