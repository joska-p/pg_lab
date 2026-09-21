# glaze3D-perf — STATUS (entry point, read first)

Goal: make `mol-demo` smooth like the origin demo + overlay layout
(molecule centered OVER the background projection, not side by side).
Two packages in scope: `packages/glaze3d` (lib) + `packages/mol-demo`
(viewer). `packages/ui` is out of scope (`Stage` is a plain flex column,
`packages/ui/src/components/Stage.tsx:7-22` — layout is `App.tsx`-local).

State: P0 ready — baseline not measured yet. Closed predecessor:
`codex/glaze3D/` S0–S10 done, plan archived to
`codex/glaze3D/archive/PLAN-S0-S10.md`.
SSOT: `codex/glaze3D-perf/PLAN.md`, `DIAG.md`, `DECISIONS.md`,
`codex/glaze3D/mol-demo.js.txt` (origin, 855 lines).

Verified: none yet (new project, no code touched).
Next: P0 baseline + instrumentation (measure first, change nothing).

Detail: `PLAN.md`. Analysis: `DIAG.md`. Log: `SESSIONS.md`.

Session ritual (mandatory): update State+Next here, 1 dated line in
`SESSIONS.md`, append decisions in `DECISIONS.md`, `vp check` green in
every touched package. Broken tests are noted, fixed in P6; live checks
are the user's on the dev server.
