# Automa migration — PLAN (6 sessions, 1 session = 1 étape vérifiable)

Règle: `_TMP/automa-to-migrate` = lecture seule, jamais modifié.
Chaque session: lire `STATUS.md` puis uniquement le(s) fichier(s) de son
domaine. Finir par le rituel (STATUS + `SESSIONS.md` + `DECISIONS.md`).

## S1 — Scaffold moteur + lib (sans UI)

Copier vers `packages/automa/src`: `engine/` (tout, shaders inclus),
`lib/constants.ts`, `lib/gridPlacement.ts`, `lib/colors.ts`,
`stores/automa/` (3 fichiers). Réécrire imports glaze éclatés (voir
`AUDIT.md` §2). Rien d'autre.
Vérif: `vp check` vert dans `packages/automa`.

## S2 — SimulationEngine + actions glaze

Porter `engine/gpu/SimulationEngine.ts`, `stores/automa/actions.ts`,
`lib/coordinates.ts`, `hooks/useCellPainting.ts` (sauf le retour
`boolean` → `void`, `onEnd(event)` — noter, appliquer en S3 si préféré).
Vérif: `vp check` vert, `tick/paint/placeCreature` compilent contre
`StateBuffer`+`GpuSurface` actuels.

## S3 — Canvas GPU

Créer `components/canvas/CellMesh.tsx` porté: `GpuCanvas fragmentShader
uniforms onFrame onMount initialCamera={{minZoom:1,maxZoom:64}}
canvasInteractions={{pan:{button:1},...painting}}`. Finaliser
`useCellPainting` en `void`. Import shader `?raw` (pattern art-canvas).
Vérif: `vp dev` dans `packages/automa` affiche la grille qui évolue.

## S4 — Shell App + panel + génération

Réécrire `App.tsx` sur le pattern `mol-demo`: `ShellWrapper >
ErrorBoundary > ExperimentShell panel={<ControlPanel title>…</ControlPanel>}

- Stage > CellMesh`. Garder le theme switch existant dans le panel.
Créer `components/controls/ControlPanel.tsx`avec`ControlSection`s +
`Readout label="Generation" value={useGeneration()}`.
  Vérif: layout 2 zones + toggle panel + génération qui s'incrémente.

## S5 — Contrôles (le gros UI)

Porter `PlaybackSection` (Button family + Slider `onValueChange`),
`EditSection` (grille 2 col stylex, families sympas), `RuleSection`
(Select `onValueChange` + `ColorField` par état), `CreatureSection`
(Select). Familles libres mais cohérentes (décision D4).
Vérif: test manuel — play/pause/step/speed/random/clear/draw/erase/
pattern/rule/couleurs.

## S6 — Polish + clôture

`style.css` final, `vp check` + `build` verts, test manuel complet,
supprimer les refs `_TMP`, màj `README.md` si besoin.
Vérif: `vp check`, `vp run build` (ou `build` package), STATUS=done.
