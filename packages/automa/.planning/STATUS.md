# Automa migration — STATUS (lire en premier)

Goal: porter `_TMP/automa-to-migrate` (~1400 lignes, 19 fichiers) vers
`packages/automa` avec `@repo/ui` + nouvelle API glaze. Structure cible:
`ShellWrapper > ErrorBoundary > ExperimentShell(panel) + Stage(canvas)`,
theme switch conservé (pattern `mol-demo`).

State: S4 done (2026-09-22) — App réécrit sur le pattern mol-demo,
`components/controls/ControlPanel.tsx` (Readout Generation + Theme switch),
`PlaybackSection.tsx` porté en avance (Play/Pause/Step/Speed). Test manuel
validé par l'utilisateur: sim evolution live, génération qui s'incrémente,
S3 validé au passage. `vp check` vert. `_TMP` intact.

Next action: S5 (reste des contrôles) — `EditSection` (Randomize/Clear/
Draw/Erase), `RuleSection` (Select + ColorField par état),
`CreatureSection` (Select). Puis test manuel complet.
Rituel fin de session obligatoire: màj ce fichier + 1 ligne datée dans
`SESSIONS.md` + décisions en append dans `DECISIONS.md`.

Note: l'utilisateur lance `vp dev` manuellement — ne pas lancer le serveur
pour lui.
