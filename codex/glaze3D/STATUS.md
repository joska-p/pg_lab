# glaze3D — STATUS (entry point, read first)

Goal: `glaze3d` (WebGL2 mini-framework, successeur three.js simple) + `mol-demo`
(registre/viewer molécules sur `glaze3d`, pattern diffraction raw conservé).
Priorité au niveau technique en cas d'arbitrage (cf. `01-objectif.md`).
SSOT: `codex/glaze3D/01-objectif.md`, `02-usecases.md`, `03-specs.md`, `mol-demo.js.txt`.

State: S6 done — `controls/orbit.ts` (`OrbitControls`, cible origine fixe,
sphériques theta/phi/radius, orientation yaw×pitch, damping/inertie,
autoRotate `2π/60/60×speed`, wheel zoom, event `change`, `dispose()`) +
`Quat.multiply/setFromAxisAngle` + 9 tests
(60/60 `vp test` 11 fichiers, `vp check` vert `packages/glaze3d`, 0 erreurs).
Verified: drag → rotation à rayon constant, caméra face origine (`-Z` →
`-pos/r`), inertie post-release, autoRotate 0.75 façon démo, zoom on/off,
`matrixWorldInverse` fraîche pour `drawPattern` (A6).
Next: S7 — mol-demo data layer (`parseMol`, form factors, registre).
Detail: `PLAN.md` §S5. Decisions: `DECISIONS.md`. Log: `SESSIONS.md`.

Ritual fin de session (obligatoire): MAJ State+Next ici, 1 ligne datée
dans `SESSIONS.md`, append décisions dans `DECISIONS.md`, `vp check`.
