# Automa migration — STATUS (lire en premier)

Goal: porter `_TMP/automa-to-migrate` (~1400 lignes, 19 fichiers) vers
`packages/automa` avec `@repo/ui` + nouvelle API glaze. Structure cible:
`ShellWrapper > ErrorBoundary > ExperimentShell(panel) + Stage(canvas)`,
theme switch conservé (pattern `mol-demo`).

State: S2 done (2026-09-21) — `stores/automa/actions.ts`,
`lib/coordinates.ts`, `hooks/useCellPainting.ts` portés
(`CanvasInteractions` void, imports éclatés), `vp check` vert.
`_TMP` intact. Voir `AUDIT.md`, `PLAN.md`, `DECISIONS.md`.

Next action: exécuter S3 (canvas GPU `CellMesh`).
Rituel fin de session obligatoire: màj ce fichier + 1 ligne datée dans
`SESSIONS.md` + décisions en append dans `DECISIONS.md`.
