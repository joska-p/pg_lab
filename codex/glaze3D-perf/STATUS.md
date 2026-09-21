# glaze3D-perf — STATUS (entry point, read first)

Goal: make `mol-demo` smooth like the origin demo + overlay layout
(molecule centered OVER the background projection, not side by side).
Two packages in scope: `packages/glaze3d` (lib) + `packages/mol-demo`
(viewer). `packages/ui` is out of scope (`Stage` is a plain flex column,
`packages/ui/src/components/Stage.tsx:7-22` — layout is `App.tsx`-local).

State: P2 code done + instrumentation repaired (fps EMA → windowed
throughput, pattern proj/norm/gl spans, RAF loop counter) after user
report: fps readout was wrong (<1 fps felt in all cases, origin smooth
on same machine). P2-fix: `PatternCanvas` cleanup no longer
`loseContext()` (StrictMode dev double-mount forced the CPU fallback),
HUD shows gpu/cpu path + stale flag, CPU fallback bounded (BUF 320/256

- 500 ms throttle). Live-verified by user: path `gpu`, `loops` 1,
  pattern 0.98 ms (cid-702) / 5.32 ms (cid-115374, norm-dominated),
  viewer smooth even spun hard. P5 overlay done in code
  (`App.tsx`: single `.mol-stage` relative parent, pattern absolute
  background `pointer-events:none`, molecule absolute foreground,
  drop handlers on parent, name label overlay): `vp check` green,
  `vp test` 47 passed. P5-fix: overlay reorder had blanked the pattern
  (PatternCanvas effect ran while viewerRef null → callback never
  registered; HUD `pattern 0.00ms gpu idle`, `pat - -`) — handle now
  stable (App owns object, canvases mutate fields), user re-check
  pending. Closed predecessor:
  `codex/glaze3D/` S0–S10 done, plan archived to
  `codex/glaze3D/archive/PLAN-S0-S10.md`.
  SSOT: `codex/glaze3D-perf/PLAN.md`, `DIAG.md`, `DECISIONS.md`,
  `codex/glaze3D/mol-demo.js.txt` (origin, 855 lines).

Verified: `vp check` green in `mol-demo` (27 files) + `glaze3d` (30
files); `vp test` 47 + 60 passed, nothing broken.
Next: P5-fix done in code — user live re-check pending (pattern visible
over `?perf=1`: pattern ms > 0, `pat` WxW, molecule name; molecule over
projection, drop anywhere, drag-rotate). Then P6 closeout. P1/P3/P4
stay parked (pattern ≤5.3 ms, no budget fix needed).

Detail: `PLAN.md`. Analysis: `DIAG.md`. Log: `SESSIONS.md`.

Session ritual (mandatory): update State+Next here, 1 dated line in
`SESSIONS.md`, append decisions in `DECISIONS.md`, `vp check` green in
every touched package. Broken tests are noted, fixed in P6; live checks
are the user's on the dev server.
