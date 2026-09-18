# PLAN — Mosaic Maker (audit follow-up)

## 1. Contexte & objectif

Suite à l'audit `$impeccable audit` (score 15/20, Good), on corrige les findings par étapes, à raison d'une seule tâche par session. Objectif : monter les dimensions faibles (Responsive 2/4) sans casser le contrat CSS-vars ni l'esprit "jouet".

## 2. Décisions actées

- Plan d'actions validé dans l'ordre : harden → adapt → animate → clarify → layout → polish, puis re-audit.
- Le contrat CSS-vars (`--tile-size`, `--mosaicGap`, `--color-0..4`, `--rotation-*`) reste la seule interface logique ↔ rendu.
- `shuffleColors` / `shuffleRotations` restent des mutations DOM directes sans re-render React.
- Clés de tuiles par index (`String(i)`) conservées : le remontage complet à chaque regenerate est l'effet "jouet" voulu.
- Label tile-set masqué < 640px conservé (densité voulue, `aria-label` présent).
- Palettes `nice-color-palettes` = contenu dynamique, jamais des tokens de marque.
- Chrome reste neutre gruvbox ; la couleur vit dans les tuiles + 4 familles d'actions.

## 3. Plan de tâches

- [x] **T1 — Resize → regenerate (P1)** — DONE (2026-09-18) — `ResizeObserver` sur `mosaicRef` avec debounce 150ms → `regenerateTiles()`. Fichiers : `MosaicDisplay.tsx`, `actions.ts`. Reprise à froid : vérifier panel hide/show + resize fenêtre ne laissent plus de grille clairsemée.
- [x] **T2 — Masquage SR mosaïque + statut loading (P1/P2)** — DONE (2026-09-18) — `aria-hidden` grille + `aria-hidden`/`focusable=false` svg, résumé `role="img"` local, `role="status"` loading. Fichiers : `MosaicDisplay.tsx`, `Tile.tsx`, `App.tsx`, `MosaicControlsPanel.tsx`.
- [x] **T3 — Dernier tile-set indésélectionnable (P1)** — DONE (2026-09-18) — Dernière option active `disabled` + `title`, hint `role="status"` quand un seul reste, garde `actions.ts:52` conservée. Fichier : `TileSetControls.tsx`.
- [ ] **T4 — Touch-targets 44px (P2)** — SKIPPED (2026-09-18, décision utilisateur) — Boutons jugés assez gros en l'état, densité panel préservée. Ne pas rouvrir sauf régression signalée.
- [x] **T5 — Reduced-motion fill + spinner (P2)** — DONE (2026-09-18, avec T6) — `0ms` sous `prefers-reduced-motion` sur `shapeStyles` (`Tile.tsx`), `animationName: none` sur spinner local (`MosaicControlsPanel.tsx`). `Button.tsx` lib intouché (état `loading` inutilisé dans mosaic).
- [x] **T6 — Labels palettes (P2)** — DONE (2026-09-18, avec T5) — `aria-label="Color palettes"`, chaque option "Palette N of M". Fichier : `PalettePicker.tsx`.
- [x] **T7 — Grille `gridTemplateRows` + check responsive (P2)** — DONE (2026-09-18) — `gridTemplateRows: repeat(auto-fit...)` supprimé (`MosaicDisplay.tsx`), rows implicites dimensionnées par les tuiles. `vp check` + build OK, validation responsive par raisonnement (viewport réels non testés, pas d'outillage screenshot dans la session).
- [ ] **T8 — Polish final + re-audit (P3)** — TODO — `color-scheme` dynamique (retirer le dur de `style.css:6`), micro-fixes restants, puis relancer `$impeccable audit` et noter le nouveau score ici.

## 4. Questions ouvertes / points de blocage

- **Q1 — Stratégie resize :** tranché en T1 : observer le conteneur mosaïque (couvre panel hide/show + resize fenêtre + tout changement layout), debounce 150ms conservé (cohérent avec sliders). Pas de `window.resize`.
- **Q2 — Touch-targets :** hit-area invisible (ex. `touch.hit` recipe) vs agrandissement visuel des boutons/swatches ? (impact visuel direct sur densité panel).
- **Q3 — Fix `Button` dans `@repo/ui` vs surcharge locale mosaïque ?** Toucher la lib affecte les autres jouets. Trancher : local d'abord ?
- **Q4 — Format du résumé SR du Stage :** tranché en T2 : "Procedural mosaic, N tiles" (singulier géré), label statique sans live region (évite le spam SR à chaque regenerate/resize), wrapper local `role="img"` dans `App.tsx` plutôt que `role` sur `Stage` (lib `@repo/ui` intouchée, landmark `section` conservé).
- **Q5 — `color-scheme` initial :** suivre le store (`dark` défaut) ou `light dark` système ? (impact flash au premier rendu).

## 5. Invariants à préserver

- Logique pure sans UI : `src/core`, `src/stores/mosaic`, `src/utils` restent testables sans DOM/React.
- Vars CSS = contrat unique ; ne jamais passer couleurs/tailles par props React autres que vars.
- Package indépendant : aucune dépendance à `PG_LAB` ou apps sœurs ; `@repo/ui` seul lien autorisé.
- Chrome neutre ; aucun 5ᵉ accent décoratif ; aucune palette mosaïque canonisée.
- Copy UI en anglais, action-oriented.
- Contrôles keyboard-opérables, focus visible, touch-first, `prefers-reduced-motion` respecté.
- Ne jamais refaire une tâche DONE ; une seule tâche par session.

## 6. Journal de session

- **2026-09-18 — Audit + création PLAN.md** — Audit 15/20 (A11y 3, Perf 3, Responsive 2, Theming 4, Integrity 3), détecteur 0 alerte. PLAN.md créé, 8 tâches découpées. Micro-décision : fichier à `packages/mosaic-maker/PLAN.md`. Aucun code modifié.
- **2026-09-18 — T1 Resize → regenerate** — `ResizeObserver` sur conteneur mosaïque dans `MosaicDisplay.tsx` (debounce 150ms → `regenerateTiles()`, garde anti-boucle par comparaison `clientWidth/Height`, `disconnect` + `clearTimeout` au cleanup). `actions.ts` inchangé (déjà bon). `vp check` OK. Q1 tranchée.
- **2026-09-18 — T2 Masquage SR + statut loading** — Grille `aria-hidden` (`MosaicDisplay.tsx`), svg décoratifs `aria-hidden` + `focusable="false"` (`Tile.tsx`), wrapper local `role="img"`/`aria-label` "Procedural mosaic, N tiles" via `MosaicStage` (`App.tsx`, `Stage` lib intouchée), `role="status"` sur loading footer (`MosaicControlsPanel.tsx`). `vp check` OK. Q4 tranchée.
- **2026-09-18 — T3 Dernier tile-set verrouillé** — `disabled` natif + `title` sur la dernière option active, hint visible `role="status"` ("Keep at least one tile type selected.") quand il n'en reste qu'une, garde silencieuse `actions.ts:52` conservée en défense. `vp check` OK.
- **2026-09-18 — T4 skippée + T5/T6** — T4 skippée sur décision utilisateur (boutons assez gros, densité préservée). T5 : `0ms` reduced-motion sur `shapeStyles` (`Tile.tsx`), `animationName: none` spinner local (`MosaicControlsPanel.tsx`), lib `Button.tsx` intouchée. T6 : `aria-label="Color palettes"` + "Palette N of M" par option (`PalettePicker.tsx`, `title` palette id conservé). `vp check` OK.
- **2026-09-18 — T7 Lignes grille** — `repeat(auto-fit...)` en axe block se résolvait contre la hauteur du conteneur et entrait en conflit avec `placeContent: center` ; rows implicites désormais dimensionnées par les svg (taille fixe `--tile-size`), rendu identique en desktop. Colonnes `auto-fit` inchangées (fluide 720px/360px), grille actions 2 col. OK (libellés courts). `vp check` + build OK.
