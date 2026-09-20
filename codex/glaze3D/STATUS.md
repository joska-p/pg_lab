# glaze3D — STATUS (entry point, read first)

Goal: `glaze3d` (WebGL2 mini-framework, successeur three.js simple) + `mol-demo`
(registre/viewer molécules sur `glaze3d`, pattern diffraction raw conservé).
Priorité au niveau technique en cas d'arbitrage (cf. `01-objectif.md`).
SSOT: `codex/glaze3D/01-objectif.md`, `02-usecases.md`, `03-specs.md`, `mol-demo.js.txt`.

State: S4 done — `geometry/{geometry,sphere,cylinder,index}.ts` + 3 tests
(38/38 `vp test` 9 fichiers, `vp check` vert `packages/glaze3d`, 0 erreurs).
Verified: sphère 32×20 = 693 verts / 3840 indices, cylindre 16 segs = 70
verts / 192 indices fermé, normales unitaires, indices bornés, `Uint32`
si >65536 verts, winding outward vérifié (pôles dégénérés standard).
Next: S5 — shading Phong + renderer complet (S6 parallélisable).
Detail: `PLAN.md` §S3. Decisions: `DECISIONS.md`. Log: `SESSIONS.md`.

Ritual fin de session (obligatoire): MAJ State+Next ici, 1 ligne datée
dans `SESSIONS.md`, append décisions dans `DECISIONS.md`, `vp check`.
