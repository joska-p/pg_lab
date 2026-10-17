# PLAN — Random Art

Point d'entrée pour reprendre le travail. **Se met à jour à la fin de chaque session.**
Les specs (`docs/`) sont un guide, pas un contrat. Ce plan fait foi sur l'état réel du code.

## But

Un atelier d'art génératif pour jouer : des expressions mathématiques produisent des images abstraites, fixes ou animées, qu'on explore, comprend et conserve.

Le brief dit : **« j'explorerai plus les grammaires que les seeds »**. Le plan est ordonné par cette phrase : ce qui permet d'explorer des grammaires passe avant ce qui mesure ou durcit.

Principes : cœur TypeScript pur (pas de DOM, pas de GPU) ; rendu = adaptateur mince sur `@repo/glaze` (D36 révisée) ; glaze n'évolue que pour des besoins réels de randomart.

## État courant

**Fait**

- **Glaze (MP0)** : `ShaderError`, `tryCreateProgram`, fuite des programmes corrigée, `GpuCanvas` garde le dernier bon programme (`onShaderError`, `vertexShader`, `shouldRender` avec premier rendu garanti), `contextOptions`, `Clock.setDuration`.

- **Lot I — Galerie, jalon I1 fait** (2026-10-17) : le renderer de lot est extrait du banc et la vue **planche** existe.

    - _Cœur de rendu_ : `src/renderer/batch.ts` — `createBatchRenderer(catalog)` possède **une** surface offscreen réutilisée (canvas hors écran ajouté au DOM pour avoir un `clientWidth`, `GpuSurface`, contexte 2D de readback) ; `render(requests, size) → RenderedBatch[]` (une cellule = `{ error, image: RgbImage | null }`) ; `destroy()`. L'échec par cellule est une **valeur** (génération, compilation, refus du driver), jamais une exception — sauf la construction de la surface. L'API `window.benchApi` ne bouge pas : `src/bench/page.ts` devient un **adaptateur de fil** (~93 lignes : `deserializeGrammar`/`serializeGrammar` + base64) au-dessus du renderer partagé. **Vérifié A/B (`git stash`) : `pixels.bin` et `dataset.json` byte-identiques à HEAD** (12 grammaires × 8 seeds @ 64 px). Bench et galerie rendent donc **les mêmes pixels**.

    - _Échantillonnage_ : `SampleOptions.channels` (défaut `RAW_CHANNELS` — le dataset garde son tirage historique, test inchangé) ; la galerie passe `DEFAULT_CHANNELS`, pour explorer la structure lisible du mode Play plutôt que le pastel du dataset.

    - _Galerie_ (`src/components/gallery/`) :
        - `planche.ts` : assemblage pur et testé (grille N rangées × k colonnes, colonnes = la plus large, cellules vides au fond, alpha opaque).
        - `Planche.tsx` : **un** canvas, **un** `putImageData` d'une image assemblée (friction 15).
        - `lot.ts` : `isFlat` via `describeImage().flatShare ≥ 0.9` (filtre de **bug** opt-in, pas un jugement).
        - `GalleryPanel.tsx` : lot 8 × 8 par défaut, cellules 32/64/128 px (défaut 64), `New batch` / `Redraw`, seed affichée, compteurs cellules/échecs affichés (le filtre "Hide flat cells" masque les cellules plates).
        - `GalleryStage.tsx` : la planche est affichée dans le **Stage** (au lieu du panneau), avec une gestion centralisée du rendu et une meilleure expérience utilisateur.

    - _Cycle de vie_ : le renderer est un objet vivant possédé par le **store** (`galleryStore.ts`) et réutilisé pour toute la durée de la session (créé au premier lot, jamais détruit). Le mode est géré par le store, et la planche est affichée dans le Stage pour une meilleure organisation.

    - _Tests_ (278 passés, +5) : `planche.test.ts` (dimensions, placement, padding, lot vide) et `sample.test.ts` (modèle de canaux personnalisé). `vp check` : 0 erreur.

- **Rangement `dataset` / `lab`** (2026-10-17, prérequis de l'épic — voir « Lot I ») : un mot par foyer. `src/lab/` → `src/core/analysis/` ; `scripts/lab/` → `scripts/bench/` ; `src/dataset/page.ts` → `src/bench/page.ts` ; `dataset.html` → `bench.html` ; `scripts/generate-dataset.mjs` → `scripts/bench/generate.mjs` ; `src/core/dataset/sample{,.test}.ts` → `src/core/grammar/sample{,.test}.ts` (exportés par le baril `grammar`) ; `window.datasetApi` → `window.benchApi`. **Cause racine** : le motif `.gitignore` `dataset/` (non ancré) masquait trois choses sans rapport — l'artefact, `src/dataset/` et `src/core/dataset/` — si bien que `sample.ts`, son test et la page de rendu par lot n'avaient **jamais été dans git** ; le motif est désormais ancré (`/dataset/`). Le `tsc -b` repasse : la page appelait encore `compile(…, { color: grammar.color })`, API supprimée au lot J.

**Pas encore fait** : lot G (rendu épaissi, à la demande) ; **lot I « galerie + recettes »** — **cadré le 2026-10-17, I0 et I1 faits, I2..I5 à coder** (voir la section « Lot I » et « Prochaine action »). Les **lots H et J sont clos**.

## Prochaine action

1. **Lot J — Channels** (couleur + partage de structure) : **fait** le 2026-10-17 (voir « Fait »). Un seul pipeline à trois canaux ; modèle `correlated`/palette supprimé.

2. **Lot I — Galerie + recettes : cadré le 2026-10-17** (section « Lot I » ci-dessus). **I0 fait** (rangement du vocabulaire) et **I1 fait** (renderer de lot partagé + vue planche, voir « Fait ») ; la planche est affichée dans le **Stage** (`GalleryStage.tsx`) et gérée par un **store dédié** (`galleryStore.ts`). Reste à implémenter **I2..I5**.
