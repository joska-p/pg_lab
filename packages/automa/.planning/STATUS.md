# Automa migration — STATUS (lire en premier)

Goal: porter `_TMP/automa-to-migrate` (~1400 lignes, 19 fichiers) vers
`packages/automa` avec `@repo/ui` + nouvelle API glaze. Structure cible:
`ShellWrapper > ErrorBoundary > ExperimentShell(panel) + Stage(canvas)`,
theme switch conservé (pattern `mol-demo`).

State: S3 done (2026-09-21) — `components/canvas/CellMesh.tsx` porté
(GpuCanvas + `?raw` + pan button 1 + painting), monté temporairement
dans `Stage` pour test manuel. `vp check` vert. `_TMP` intact.

Next action: test manuel `vp dev` (grille qui évolue), puis S4
(Shell App + panel + génération).
Rituel fin de session obligatoire: màj ce fichier + 1 ligne datée dans
`SESSIONS.md` + décisions en append dans `DECISIONS.md`.
