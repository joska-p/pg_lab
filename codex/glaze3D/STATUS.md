# glaze3D — STATUS (entry point, read first)

Goal: `glaze3d` (WebGL2 mini-framework, successeur three.js simple) + `mol-demo`
(registre/viewer molécules sur `glaze3d`, pattern diffraction raw conservé).
Priorité au niveau technique en cas d'arbitrage (cf. `01-objectif.md`).
SSOT: `codex/glaze3D/01-objectif.md`, `02-usecases.md`, `03-specs.md`, `mol-demo.js.txt`.

State: S2 done — `core/{object3d,camera,index}.ts`, 11 tests
(24/24 `vp test` 5 fichiers, `vp check` vert `packages/glaze3d`).
Verified: hiérarchie add/remove/clear+reparent, `updateMatrixWorld`
translation+scale, lumière attachée caméra (4,3,11)+offset → monde
correcte, `matrixWorldInverse` = inverse, projection 40°/0.01/200.
Next: S3 — renderer squelette (`renderer/renderer.ts`, triangle dur).
Detail: `PLAN.md` §S1. Decisions: `DECISIONS.md`. Log: `SESSIONS.md`.

Ritual fin de session (obligatoire): MAJ State+Next ici, 1 ligne datée
dans `SESSIONS.md`, append décisions dans `DECISIONS.md`, `vp check`.
