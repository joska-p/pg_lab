# glaze3D-perf — Plan multisession

Source of truth: `STATUS.md` (goal/state/next), `DIAG.md` (numbers),
`codex/glaze3D/mol-demo.js.txt` (origin behavior), closed predecessor
`codex/glaze3D/archive/PLAN-S0-S10.md` (context only, do not reopen).

Conventions: start by reading `STATUS.md` alone, then the section below
for the active step. End ritual: MAJ `STATUS.md` State+Next, 1 dated line
in `SESSIONS.md`, append `DECISIONS.md` on arbitration, `vp check` green
in every touched package. Broken tests never block iteration (see
`DECISIONS.md` iteration rule): note them, fix in P6. Live smoothness
checks are the user's (agent delivers `vp check` + a short manual
protocol per step). Evidence (`file:line` + command output) before
synthesis; a step is done only on its DoD. Packages: `glaze3d` =
`packages/glaze3d`, `mol-demo` = `packages/mol-demo`.

Dependency map: P0 (numbers) → P1 (renderer) + P2 (loops) in any order →
P3 (draw calls, needs P1 numbers) → P4 (budgets) → P5 (layout, independent,
any time after P0) → P6 (close).

## P0 — Baseline + instrumentation (mol-demo only)

What: dev-only timing (renderer ms, pattern ms, fps) + mesh count +
canvas buffer sizes; fill `DIAG.md` table for SF6 vs C60. Change app code
as little as possible (temporary HUD behind a flag is fine, or external
profiling via DevTools/Spector.js).
DoD: `DIAG.md` table filled with two cases; H1–H5 confirmed or corrected
in writing; `vp check` green in `mol-demo`. Broken tests (if any) noted
only.

## P1 — Renderer hot path (glaze3d only)

Files: `packages/glaze3d/src/renderer/renderer.ts` (only).
What: `useProgram` once per frame; hoist global uniforms (projection,
lights, ambient) to once per frame; per mesh only modelView, normal,
diffuse/specular/shininess; reuse temporaries (no `new` per mesh per
frame); cheap normal-matrix path for rigid transforms; `OrbitControls`
temporaries if trivially adjacent (else leave to P2). No API change.
DoD: `vp check` green in `glaze3d`; manual protocol for the user (open
SF6 + C60 on the dev server, compare smoothness); before/after row
appended in `DIAG.md`; broken tests noted, not fixed here.

## P2 — Single loop + controls allocs (glaze3d + mol-demo)

Files: `packages/glaze3d/src/controls/orbit.ts`,
`packages/mol-demo/src/components/MolCanvas.tsx`,
`packages/mol-demo/src/components/PatternCanvas.tsx`.
What: one RAF owner (viewer renders every frame, pattern redraws on
demand: `change` → dirty + existing 33ms throttle + `angleTo<0.003`
early-out kept); controls reuse `Quat`/vector temporaries, no per-frame
alloc in the autoRotate path. Keep the `ViewerHandle` contract
(`matrixWorldInverse.elements` read, `glaze3d` unaware of pattern).
DoD: one RAF in steady state verified by code reading; `vp check` green
in both packages; manual protocol for the user; delta row in `DIAG.md`;
broken tests noted, not fixed here.

## P3a — Draw-call strategy spike (decision, no ship code or throwaway)

What: compare on measured P1/P2 numbers — (i) shared geometries per
radius, (ii) static merge per molecule (rigid: bake transforms, 1–2
buffers, rotation via group), (iii) instancing (1 draw spheres + 1 draw
cylinders). Prototype cheapest discriminating test only.
DoD: decision + rationale appended in `DECISIONS.md` with numbers;
`vp check` green if any throwaway code was added then removed.

## P3b — Implement P3a decision (glaze3d + mol-demo)

Files: per decision; likely `renderer.ts` + `lib/buildMolMesh.ts` (+ tests).
What: implement the chosen strategy behind the existing API if possible
(`buildMolMesh(molGroup, mol)` signature kept unless the decision says
otherwise and records why).
DoD: `vp check` green in both packages; switch molecule SF6↔C60 with no
ghosts/leaks (code-level + user live check); delta row in `DIAG.md`;
broken tests noted, not fixed here. If still far from origin smooth,
record what remains rather than expanding scope.

## P4 — Tessellation + pixel budgets (mol-demo, maybe glaze3d)

Files: `packages/mol-demo/src/lib/buildMolMesh.ts`,
`MolCanvas.tsx`, `PatternCanvas.tsx` (BUF), maybe segment constants.
What: sphere/cylinder segment config (e.g. spheres `32x20` → `20x14` or
`16x12`, cylinders `16` → `10-12`, mobile/desktop split kept via
`maxAtoms` pattern); pixelRatio clamp review; antialias /
`powerPreference` review. Pattern `BUF 900` touched only with a measured
reason.
DoD: manual protocol for the user (no visible loss at 420px stage);
`vp check` green in `mol-demo`; delta row in `DIAG.md`; broken tests
noted, not fixed here.

## P5 — Overlay layout (mol-demo only, independent)

Files: `packages/mol-demo/src/App.tsx` (+ style colocated).
What: single `.mol-stage` parent: pattern canvas absolute background
(`pointer-events:none`), molecule canvas centered foreground, drop
`.mol/.sdf` + drag handlers on the parent (as origin
`mol-demo.js.txt:798-816`), label readable above. Current side-by-side
flex (`App.tsx:40-71`) goes away. No `ui` package change.
DoD: matches origin composition (molecule over projection); drop works
from anywhere over the stage; drag-rotate unaffected (pattern ignores
pointer); `vp check` green in `mol-demo`; user visual OK (user checks
live on the dev server).

## P6 — Closeout (tests live here, nowhere else)

What: repair tests broken during P1–P5, then full `vp check` + `vp test` +
`mol-demo` build green; final before/after summary in `DIAG.md`;
`STATUS.md` → done with pointer to any leftover; last `SESSIONS.md` line.
