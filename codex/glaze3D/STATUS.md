# glaze3D — STATUS (entry point, read first)

Goal: `glaze3d` (WebGL2 mini-framework, successeur three.js simple) + `mol-demo`
(registre/viewer molécules sur `glaze3d`, pattern diffraction raw conservé).
Priorité au niveau technique en cas d'arbitrage (cf. `01-objectif.md`).
SSOT: `codex/glaze3D/01-objectif.md`, `02-usecases.md`, `03-specs.md`, `mol-demo.js.txt`.

State: S8 done — mol-demo viewer 3D (`lib/buildMolMesh.ts`: sphères
`r*0.45` 32×20 + cylindres `0.065` 16 segs, midpoint+`setFromUnitVectors`,
`clear()` au switch, bonds dégénérés sautés + `components/MolCanvas.tsx`:
`PerspectiveCamera(40,1,0.01,200)` pos `(4,3,11)` + 1 ambient 0.5 + 3
directional caméra, `Renderer` + `OrbitControls` (pan/zoom false, autoRotate
0.75, damping 0.07) + RAF `controls.update+render` + `resizeMol`) + exports
`glaze3d` (`./core/geometry/material/math/renderer/controls`, miroir
`@repo/ui`) + 37 tests (`vp test` 37/37 5 fichiers, `vp check` vert
`mol-demo`+`glaze3d`, build OK, 0 erreurs).
Verified: build `mol-demo` OK (69 modules), switch rebuild sans fantômes
(test clear), drag/damping/autoRotate via `OrbitControls` S6.
Next: S9 — pattern diffraction + intégration caméra (`PatternCanvas`,
`computeNorm32`, lecture `matrixWorldInverse.elements`).
Detail: `PLAN.md` §S5. Decisions: `DECISIONS.md`. Log: `SESSIONS.md`.

Ritual fin de session (obligatoire): MAJ State+Next ici, 1 ligne datée
dans `SESSIONS.md`, append décisions dans `DECISIONS.md`, `vp check`.
