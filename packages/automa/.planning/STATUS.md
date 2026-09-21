# Automa migration — STATUS (lire en premier)

Goal: porter `_TMP/automa-to-migrate` (~1400 lignes, 19 fichiers) vers
`packages/automa` avec `@repo/ui` + nouvelle API glaze. Structure cible:
`ShellWrapper > ErrorBoundary > ExperimentShell(panel) + Stage(canvas)`,
theme switch conservé (pattern `mol-demo`).

State: plan prêt, audité. Aucun fichier migré. `_TMP` intact (SSOT en
lecture seule). `packages/automa` = squelette theme-demo.
Voir `AUDIT.md` (inventaire), `PLAN.md` (6 sessions), `DECISIONS.md`.

Next action: exécuter S1 (scaffold moteur+lib, rewrite imports glaze).
Rituel fin de session obligatoire: màj ce fichier + 1 ligne datée dans
`SESSIONS.md` + décisions en append dans `DECISIONS.md`.
