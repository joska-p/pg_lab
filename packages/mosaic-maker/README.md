# @repo/mosaic-maker

> Mini-app « Mosaic Maker » : génère des mosaïques procédurales de tuiles (SVG) pilotées par des variables CSS.

- Stack : Vite+ + React 19 + `@repo/ui` (StyleX) + zustand.
- Logique pure dans `src/core`, `src/stores/mosaic`, `src/utils` (store non-UI, testable).
- Contract CSS : les couleurs (`--color-0..4`), la taille (`--tile-size`), le gap (`--mosaicGap`) et les rotations (`--rotation-0..3`) sont écrites sur le nœud mosaic via `style.setProperty`.
