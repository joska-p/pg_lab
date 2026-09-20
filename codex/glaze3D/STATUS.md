# glaze3D — STATUS (entry point, read first)

Goal: `glaze3d` (WebGL2 mini-framework, successeur three.js simple) + `mol-demo`
(registre/viewer molécules sur `glaze3d`, pattern diffraction raw conservé).
Priorité au niveau technique en cas d'arbitrage (cf. `01-objectif.md`).
SSOT: `codex/glaze3D/01-objectif.md`, `02-usecases.md`, `03-specs.md`, `mol-demo.js.txt`.

State: S7 done — mol-demo data layer (`lib/{parseMol,formFactors,atoms,
molecules,index}.ts`: parse V2000 + centroïde, FF H→Xe + `FF_TBL/ff`,
palette CPK + fallback, registre 6 SDF `MOLECULES`, `validate/switch/
parseAndValidate/loadMolecule`) + assets `public/molecules/` (6 SDF PubChem
9→56 atomes) + `MoleculeList`/`moleculeStore` (Segmented + Readout) + 34 tests
(`vp test` 34/34 4 fichiers, `vp check` vert `packages/mol-demo`, 0 erreurs).
Verified: 6 vrais SDF parsés+validés (counts conformes registre), spot-check
`ff(C,Q_MIN)≈6`/`ff(H,Q_MIN)≈1`, refus inconnu + >60 garde l'ancien.
Next: S8 — mol-demo viewer 3D (`MolCanvas`, `buildMolMesh`, lumières).
Detail: `PLAN.md` §S5. Decisions: `DECISIONS.md`. Log: `SESSIONS.md`.

Ritual fin de session (obligatoire): MAJ State+Next ici, 1 ligne datée
dans `SESSIONS.md`, append décisions dans `DECISIONS.md`, `vp check`.
