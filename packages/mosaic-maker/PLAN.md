# PLAN — Migration Mosaic Maker

## 1. Contexte & objectif

Migrer la mini-app standalone `_TMP/mosaic-maker-to-migrate` (React 19 + Tailwind + `@repo/tlc`) vers le package monorepo `packages/mosaic-maker` (Vite+ + `@repo/ui` StyleX + zustand), en conservant toute la logique métier et en réécrivant uniquement la couche UI. Stack identique, seule la lib UI change.

## 2. Décisions actées

- **Port strict + redesign léger** : comportement identique à la source (sections, actions, sliders 32–256 / 0–64 pas 2, pagination 42 palettes), avec les idioms `@repo/ui` (familles, Readout, etc.).
- **`PalettePicker`** = composant **local** à `mosaic-maker` (composé de StyleX + `Swatch`, comportement radio). Pas de nouvelle primitive `@repo/ui`.
- **Sélecteur de thème** (light/dark/system) du scaffold : **conservé** (`stores/appStore.tsx` + `Segmented`).
- **ErrorBoundary TLC** : **abandonné** (pas d'équivalent `@repo/ui`, pas de convention repo).
- **`zod`** : ajouté au catalog + dépendance de `packages/mosaic-maker` (version `^3.25.76`, déjà dans le store pnpm).

## 3. Plan de tâches

1. [TODO] **Dépendances** — Ajouter `zod` au catalog (`pnpm-workspace.yaml`) + `"zod": "catalog:"` dans `packages/mosaic-maker/package.json` ; `vp install`.
2. [TODO] **Copie logique** — Copier `core/`, `stores/mosaic/`, `utils/` de la source vers `src/` en conservant l'arborescence exacte (imports relatifs `../../core`, `../../utils/…` intacts). ~23 fichiers.
3. [TODO] **`Tile.tsx`** — Réécrire : garder `ShapeRenderer` + SVG, remplacer `cn`/Tailwind par `stylex.props`, taille via `var(--tile-size)` en style inline (pattern rotation conservé).
4. [TODO] **`TileSetControls.tsx`** — Réécrire : toggles contrôlés `<button aria-pressed>` (state venant du store) au lieu du pattern `input + peer-checked`.
5. [TODO] **`PalettePicker.tsx`** (nouveau) — Colonne de 5 tuiles colorées + anneau d'état, radio sémantique, données depuis le store.
6. [TODO] **`MosaicControlsPanel.tsx`** — Réécrire : `ControlPanel` » `ControlSection` ×4, `Button` (familles), `Slider` + hook debounce conservé, footer loading.
7. [TODO] **`MosaicDisplay.tsx`** — Réécrire : container StyleX (grid centré) + `MOSAIC_STYLES` inline (CSS vars) ; intégré dans `Stage label="Mosaic"`.
8. [TODO] **`App.tsx`** — Réécrire : `ShellWrapper` > `ExperimentShell` > `Stage` ; panneau = thème + contrôles ; suppression ErrorBoundary.
9. [TODO] **Nettoyage** — `index.html` (title `Mosaic Maker`), `README.md`, suppression `src/style.css` si remplacé.
10. [TODO] **Vérification** — `vp check` ; `vp -C packages/mosaic-maker dev` (contrôle `/stylex.css` = `@layer`) ; `vp -C packages/mosaic-maker build`.

## 4. Questions ouvertes / points de blocage

- **Aucun pour l'instant.**
- À trancher si rencontré : familles exactes des 4 boutons d'actions, format d'affichage des valeurs sliders (suffixe `px`), style du tile-set actif (ring vs fill).

## 5. Invariants à préserver

- **CSS custom properties = canal état→DOM** : `--color-0..4`, `--tile-size`, `--mosaicGap`, `--rotation-0..3`, écrites via `style.setProperty` sur le nœud mosaic (`updateElementStyles`). Ne pas casser ce contrat.
- **`Tile.colors` = noms de variables CSS**, jamais de valeurs hex.
- **Hook `useSliderState`** (debounce 150ms vers `regenerateTiles`) : conserver.
- **Store zustand `mosaicStore` + actions externes** : conserver le pattern (store non-UI, testable).
- **`computeNumberOfTiles`** dépend de `getComputedStyle` + dimensions DOM : conserver le contrat de lecture des CSS vars.
- Les imports depuis `@repo/ui` doivent utiliser les **sous-paths** (`@repo/ui/components/X`, `@repo/ui/tokens/*.stylex`, `@repo/ui/recipes/*.stylex`) — jamais le barrel (contrainte compilateur StyleX).
- Style de code repo : double quotes, pas de point-virgules (normalisé par `vp check`).

## 6. Journal de session

### 2026-09-18 — Étude + plan (session en lecture seule)

- Étude complète des deux codebases (source `_TMP/mosaic-maker-to-migrate`, cible `packages/mosaic-maker`, design system `@repo/ui`).
- Mapping TLC → `@repo/ui` établi (Shell→ShellWrapper/ExperimentShell, Panel→ControlPanel, Field→ControlField, etc.). Gaps identifiés : `ColorPalette`, ErrorBoundary, sliders values.
- Décisions actées par l'utilisateur (voir §2). Plan détaillé présenté et validé.
- Créé ce document de travail.
