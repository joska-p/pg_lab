# Automa migration — STATUS (lire en premier)

Goal: porter `_TMP/automa-to-migrate` (~1400 lignes, 19 fichiers) vers
`packages/automa` avec `@repo/ui` + nouvelle API glaze. Structure cible:
`ShellWrapper > ErrorBoundary > ExperimentShell(panel) + Stage(canvas)`,
theme switch conservé (pattern `mol-demo`).

State: S1 done (2026-09-21) — `src/engine/` (tout, shaders inclus),
`src/lib/` (constants, gridPlacement, colors), `src/stores/automa/`
(store, selectors) copiés, imports glaze éclatés (`core/render`,
`core/time`, `core/geometry`), `vp check` vert. `_TMP` intact (SSOT en
lecture seule). Voir `AUDIT.md` (inventaire), `PLAN.md` (6 sessions), `DECISIONS.md`.

Next action: exécuter S2 (actions glaze + coordinates + useCellPainting).
Rituel fin de session obligatoire: màj ce fichier + 1 ligne datée dans
`SESSIONS.md` + décisions en append dans `DECISIONS.md`.
