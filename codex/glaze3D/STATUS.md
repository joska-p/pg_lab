# glaze3D — STATUS (entry point, read first)

Goal: `glaze3d` (WebGL2 mini-framework, successeur three.js simple) + `mol-demo`
(registre/viewer molécules sur `glaze3d`, pattern diffraction raw conservé).
Priorité au niveau technique en cas d'arbitrage (cf. `01-objectif.md`).
SSOT: `codex/glaze3D/01-objectif.md`, `02-usecases.md`, `03-specs.md`, `mol-demo.js.txt`.

State: S5 done — `material/phong.ts` (Phong+ShaderMaterial, hex|tuple) +
renderer Phong complet (1 ambient + 4 dir compile-time, VAO/buffers par
géométrie, normalMatrix inverse-transpose) + 16 tests
(51/51 `vp test` 10 fichiers, `vp check` vert `packages/glaze3d`, 0 erreurs).
Verified: sphère 8×6 + cylindre éclairés via `drawElements`, uniforms
(`uDiffuse`/`uShininess`/`uAmbientColor`/`uDirColors`/`uDirDirections`),
headlamp attachée caméra → direction `normalize(worldPos)` en vue,
custom shader sur 2e programme, clamp 6→4 dirs, skip mesh nu, `Uint32`→`UNSIGNED_INT`.
Next: S6 — orbit controls (ne dépend que de S1+S2).
Detail: `PLAN.md` §S5. Decisions: `DECISIONS.md`. Log: `SESSIONS.md`.

Ritual fin de session (obligatoire): MAJ State+Next ici, 1 ligne datée
dans `SESSIONS.md`, append décisions dans `DECISIONS.md`, `vp check`.
