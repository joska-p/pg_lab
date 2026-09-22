# Automa migration — STATUS (lire en premier)

Goal: porter `_TMP/automa-to-migrate` (~1400 lignes, 19 fichiers) vers
`packages/automa` avec `@repo/ui` + nouvelle API glaze. Structure cible:
`ShellWrapper > ErrorBoundary > ExperimentShell(panel) + Stage(canvas)`,
theme switch conservé (pattern `mol-demo`).

State: S5 done (2026-09-22) — controles complets portés:
`EditSection` (Randomize/Clear/Draw/Erase, grille2 stylex), `RuleSection`
(Select label + `ColorField` par état, `createCssColor` via glow),
`CreatureSection` (Select), branchés dans `ControlPanel`. Familles: Play
`aurora`, Randomize `neon-violet`, Clear `error`, Draw actif `solder`,
Erase actif `error`, Rule `amber`, Pattern `aqua`. Test manuel complet
validé par l'utilisateur. `vp check` vert. `_TMP` intact.

Next action: S6 (polish + clôture) — `style.css` final, `vp check` +
build verts, test manuel complet, supprimer refs `_TMP`, màj `README.md`
si besoin.
Rituel fin de session obligatoire: màj ce fichier + 1 ligne datée dans
`SESSIONS.md` + décisions en append dans `DECISIONS.md`.

Note: l'utilisateur lance `vp dev` manuellement — ne pas lancer le serveur
pour lui.
