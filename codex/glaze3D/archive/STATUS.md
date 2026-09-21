# glaze3D — STATUS (entry point, read first)

Goal: `glaze3d` (WebGL2 mini-framework, successeur three.js simple) + `mol-demo`
(registre/viewer molécules sur `glaze3d`, pattern diffraction raw conservé).
Priorité au niveau technique en cas d'arbitrage (cf. `01-objectif.md`).
SSOT: `codex/glaze3D/01-objectif.md`, `02-usecases.md`, `03-specs.md`, `mol-demo.js.txt`.

State: S10 done — revue visuelle utilisateur OK 2026-09-21 (`mol-demo`
fonctionne: viewer 3D + pattern + registre + drop). Projet glaze3D clos.
Suites identifiées (ne pas traiter ici, sessions futures dédiées) :
(a) performance — démo origine smooth, app actuelle inutilisable en l'état,
gros travail en perspective ;
(b) layout — molécule centrée PAR-DESSUS la projection en arrière-plan,
pas côte à côte (conforme démo origine).
Verified: `vp check` vert (glaze3d 30 fichiers + mol-demo 25),
`vp test` 60/60 (11 fichiers) + 47/47 (7 fichiers),
`vp run mol-demo#build` OK. Écart DoD: `vp run -r build` rouge sur
4 packages hors scope (ui/glaze3d/glaze `vp pack` sans `src/index.ts`,
playground `tsc -b` exit 137) — pré-existant, aucun fichier S1-S10
en cause (`git status` = 5 fichiers mol-demo seuls).
Next: projet clos — suites reprises dans `codex/glaze3D-perf/`
(P0 diagnostic perf puis P5 layout overlay). Plan S0–S10 archivé :
`codex/glaze3D/archive/PLAN-S0-S10.md`.
Detail: `PLAN.md` §S10. Decisions: `DECISIONS.md`. Log: `SESSIONS.md`.

Ritual fin de session (obligatoire): MAJ State+Next ici, 1 ligne datée
dans `SESSIONS.md`, append décisions dans `DECISIONS.md`, `vp check`.
