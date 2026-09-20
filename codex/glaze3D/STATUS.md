# glaze3D — STATUS (entry point, read first)

Goal: `glaze3d` (WebGL2 mini-framework, successeur three.js simple) + `mol-demo`
(registre/viewer molécules sur `glaze3d`, pattern diffraction raw conservé).
Priorité au niveau technique en cas d'arbitrage (cf. `01-objectif.md`).
SSOT: `codex/glaze3D/01-objectif.md`, `02-usecases.md`, `03-specs.md`, `mol-demo.js.txt`.

State: S1 done — maths `math/{vec3,quat,mat4}.ts` + `index.ts`, 13 tests vitest
verts (`vp test` 3 fichiers, `vp check` vert `packages/glaze3d`).
Verified: `perspective/compose/multiply/invert` column-major, `setFromUnitVectors/
angleTo` + cas oppos, `subVectors/lerp/length/normalize`.
Next: S2 — scene graph + camra (`core/object3d.ts`, `core/camera.ts` + tests).
Detail: `PLAN.md` §S1. Decisions: `DECISIONS.md`. Log: `SESSIONS.md`.

Ritual fin de session (obligatoire): MAJ State+Next ici, 1 ligne datée
dans `SESSIONS.md`, append décisions dans `DECISIONS.md`, `vp check`.
