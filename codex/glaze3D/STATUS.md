# glaze3D — STATUS (entry point, read first)

Goal: `glaze3d` (WebGL2 mini-framework, successeur three.js simple) + `mol-demo`
(registre/viewer molécules sur `glaze3d`, pattern diffraction raw conservé).
Priorité au niveau technique en cas d'arbitrage (cf. `01-objectif.md`).
SSOT: `codex/glaze3D/01-objectif.md`, `02-usecases.md`, `03-specs.md`, `mol-demo.js.txt`.

State: S3 done — `renderer/{renderer,index}.ts` + 3 tests
(27/27 `vp test` 6 fichiers, `vp check` vert `packages/glaze3d`).
Verified: `DEPTH_TEST` on, `setSize/setPixelRatio` → drawingbuffer+viewport,
`render` MAJ matrices + clear + `drawArrays(TRIANGLES,0,3)`, pixel centre
(255,76,51,255) via harness headless SwiftShader.
Next: S4 — géométries (`geometry/{geometry,sphere,cylinder}.ts`, S6
parallélisable).
Detail: `PLAN.md` §S3. Decisions: `DECISIONS.md`. Log: `SESSIONS.md`.

Ritual fin de session (obligatoire): MAJ State+Next ici, 1 ligne datée
dans `SESSIONS.md`, append décisions dans `DECISIONS.md`, `vp check`.
