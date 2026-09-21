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
