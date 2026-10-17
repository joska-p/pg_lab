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

- **Lot I — Galerie, jalon I2 fait** (2026-10-17) : carnet persistant (Notebook), notation et export/import.

    - _Cœur pur_ (`src/core/notebook/`) : `types.ts`, `notebook.ts`, `serialize.ts` — modèle du carnet (`Notebook`, `NotebookBatch`, `NotebookCandidate`, `NotebookRecipe`) avec format canonique (`randomart-notebook`, v1, 2 espaces, pas de pixels). Validation stricte sur le modèle d'`artwork` (`rejectUnknownKeys`, bornes de taille de fichier, notes 0–5 entières). Tests unitaires exhaustifs (`notebook.test.ts`).
    - _Clé d'identité_ : `grammarSignature` exporté depuis `src/core/grammar/` pour l'identification canonique de grammaire et les clés de vignettes.
    - _Persistance_ (`src/storage/notebookDb.ts`) : stockage IndexedDB léger pour les métadonnées du carnet et le cache de vignettes (avec dégradation gracieuse sans erreur hors-navigateur).
    - _Store & UI_ (`galleryStore.ts`, `GalleryPanel.tsx`, `GalleryStage.tsx`) : le store possède le `Notebook` vivant ; chaque nouveau tirage crée un `NotebookBatch` persisté ; navigation entre lots ; notation 0–5 de rangée/candidat avec boutons et raccourcis clavier (`0`–`5`, `↑`/`↓`, `j`/`k`) ; surbrillance de la sélection sur le canvas Planche ; bouton « Keep as artwork » ouvrant la cellule dans le Lab (`openCellInLab`) ; export et import complet du carnet JSON (`randomart-notebook.json`).
    - _Tests_ : 289 passés (34 suites, +11 tests), `vp check` : 0 erreur.

**Pas encore fait** : lot G (rendu épaissi, à la demande) ; **lot I « galerie + recettes »** — **cadré le 2026-10-17, I0, I1 et I2 faits, I3..I5 à coder** (voir la section « Lot I » ci-dessous). Les **lots H et J sont clos**.

### Lot I — Galerie + recettes (cadré le 2026-10-17, I0..I2 faits, I3..I5 à coder)

Un moyen d'explorer **par le regard** plutôt que par la formule : générer des lots d'images (planches-contact), les **classer** (notation manuelle), et en **déduire de bonnes recettes** (élites + recherche guidée, puis promotion en presets).

Vocabulaire tranché (un mot = un foyer) :

| Mot                                 | Foyer                                                            | Emplacement                                 |
| ----------------------------------- | ---------------------------------------------------------------- | ------------------------------------------- |
| **dataset**                         | l'artefact de mesures hors-ligne (banc)                          | `dataset/` (ignoré de git, sauf `.gitkeep`) |
| **bench**                           | la chaîne hors-ligne : page headless + scripts                   | `src/bench/`, `scripts/bench/`              |
| **analysis**                        | les métriques pures (descripteurs, PCA, statistiques)            | `src/core/analysis/`                        |
| **batch**                           | l'exécution d'un lot d'images (GPU)                              | `src/renderer/batch.ts`                     |
| **planche**                         | la grille affichée                                               | `src/components/gallery/`                   |
| **notebook**                        | le carnet : lots + notes + élites + recettes                     | `src/core/notebook/`                        |
| **lab** / **gallery** / **history** | les trois modes UI (atelier de grammaire / galerie / historique) | `src/components/{lab,gallery,history}/`     |

Décisions tranchées (2026-10-17) :

- **Modèle d'apprentissage : élites + recherche guidée. Pas de modèle entraîné.** Les primitives existent déjà : `randomizeWeights` est un opérateur de **voisinage** (`spread` = amplitude, `changeRate: 0` = redistribution dans un vocabulaire gelé), `randomGrammar` est un **redémarrage**, et un crossover = mélange de poids entre deux élites. L'épic ajoute une **sélection** (la note) et une **mémoire** (l'élite), pas un moteur de recherche. Explicable, fonctionne dès ~10 notes, aucune prétention à mesurer la beauté. Un petit modèle linéaire descripteurs → note ne viendra — s'il vient — que comme **rapport** (I4), jamais comme juge.
- **Format : carnet JSON à métadonnées seules.** `format: "randomart-notebook"`, `version: 1`, `generatorVersion`, `batches[]` (`id`, `createdAt`, `parentIds`, `candidates[]` = `{ id, grammar, seeds, rating?, note? }`), `recipes[]`. **Pas de pixels** : ils sont dérivés (grammaire + seed + version) et cachés en IndexedDB pour l'affichage. Réutilise `serializeGrammar`/`deserializeGrammar` et les bornes/refus de champ inconnu d'`artwork/serialize.ts`. Le format `randomart-dataset` (avec pixels) reste le **banc hors-ligne** : les deux partagent la sérialisation de grammaire, pas leur cycle de vie (le dataset est un banc régénérable, le carnet est des données utilisateur).
- **Notation : 0–5 entier par rangée** (raccourcis clavier), plus « garder » par cellule → œuvre. Assez fin pour classer et pour corréler (I4) ; un binaire perdrait le degré.
- **Rendu par lot : une seule surface offscreen réutilisée + readback**, la planche étant assemblée en `putImageData` sur un canvas d'affichage. **Pas de N `<canvas>`** : la limite de contextes WebGL (~8–16) interdit une cellule par canvas (8 candidats × 9 seeds = 72 cellules).
- **Le renderer de lot est commité** : `src/bench/page.ts` (ex-`src/dataset/page.ts`, désormais dans git) devient un **pilote mince** de `src/renderer/batch.ts`, que la galerie consomme aussi. Un seul renderer, deux pilotes.
- **Filtre « aplat »** (opt-in, via les descripteurs) pour masquer les candidats morts (champ constant → image plate) : c'est un filtre de **bug**, pas un jugement esthétique.
- **Pas de lot G d'abord** : le readback passe par la capture canvas (friction 4) ; la migration vers `RenderTarget`/`readPixels` de glaze reste un suivi.

Jalons (chacun laisse `vp check` + `vp test` verts) :

0. **I0 — Rangement** : **fait le 2026-10-17** (vocabulaire ci-dessus appliqué ; `sample.ts`, `sample.test.ts` et la page de rendu par lot entrent enfin dans git — voir « Fait »).
1. **I1 — Rendre un lot** : **fait le 2026-10-17** (`src/renderer/batch.ts`, vue **planche**, `GalleryPanel`, `GalleryStage`, `galleryStore.ts`).
2. **I2 — Carnet** : **fait le 2026-10-17** (`src/core/notebook/` : `types`, `notebook`, `serialize`, tests ; `storage/notebookDb.ts` : persistance IndexedDB ; export/import JSON et notation rangée/candidat dans le store et l'UI).
3. **I3 — Proposer** : `src/core/notebook/propose.ts` — élites (seuil / top-k), **mutation** (`randomizeWeights`, `spread` = intensité), **crossover** (mélange de poids entre deux élites), **redémarrage** (`randomGrammar`) ; bouton « Nouvelle génération » ; contraintes héritées des parents, gigue réparée par `fitConstraints`.
4. **I4 — Résumer** : descripteurs in-app sur les cellules rendues (réutilise `src/core/analysis/`) ; rapport **notes ↔ descripteurs ↔ opérateurs** (reprise de `scripts/bench/pca-report.ts`, mais pilotée par la note au lieu de l'index de grammaire). **Lecture seule.**
5. **I5 — Recettes** : promotion d'un candidat noté en `GrammarPreset` (« Garder comme recette »), persistée dans le carnet et proposée dans le Select du mode Play — c'est la promesse de `presets.ts` (« recettes provisoires, à remplacer par celles trouvées au lab »).

Fichiers : `src/renderer/batch.ts`, `src/core/notebook/{index,types,serialize,notebook,propose}.ts`, `src/storage/notebookDb.ts`, `src/core/analysis/`, `src/components/gallery/{GalleryPanel,GalleryStage,Planche}.tsx`, `src/stores/galleryStore.ts`, `src/core/grammar/presets.ts`.

## Prochaine action

1. **Lot I, Jalon I3 — Proposer** :
    - `src/core/notebook/propose.ts` : sélection des élites (seuil ou top-k des candidats notés), opérateurs génétiques (mutation de poids via `randomizeWeights`, crossover entre élites, redémarrage `randomGrammar`).
    - Héritage et réparation des contraintes (`fitConstraints`).
    - Bouton UI « Nouvelle génération » dans `GalleryPanel` pour explorer à partir des élites plutôt que repartir de zéro.

## Dépendances

```
A..F : faits
G : à la demande
H : fait (poids, contraintes, durée, budget mesurés)
I (galerie + recettes) : en cours (I0, I1, I2 faits ; I3..I5 à coder)
J (channels) : fait (un pipeline couleur, tronc partagé)
```

## Points de friction connus

1. **Tests navigateur** : requis par D31 sur le papier, coûteux en pratique. Remplacés pour l'instant par le lot D ; à réévaluer au lot G.
2. **Découpage de fichiers** : commencer simple, scinder sur friction réelle.
3. **`shared`** : local à randomart tant qu'aucun autre projet n'en a besoin.
4. **Glaze comme socle GPU** : entrée du fragment = `vUv` (conversion `v_p` au début de `main`) ; pas de `readPixels` en v1 (capture du canvas, `preserveDrawingBuffer`).
5. **Phase** : `Clock` timed + loop de glaze via `ClockStore` ; `u_phase = createPhase(clock.progress)` (marque `Phase`). Remplace `phaseAt` de la spec renderer.
6. **Calibration** : valeurs de départ arbitraires (lot H). Tranché au lot H : poids calibrés à la mesure, contraintes et durée mesurées et conservées.
7. **Aperçu de sous-expression** : ignore la déformation des ancêtres, affiché dans l'UI.
8. **Taille de rendu = taille du canvas** jusqu'au lot G.
9. **Un seul shader** (tranché) : plus de mode Static/Animated. La grammaire par défaut inclut `tsin`/`tcos` ; l'animation relève de la lecture (horloge en pause à la phase 0). À la phase 0, `tsin` vaut 0 et `tcos` vaut 1, et les terminaux de temps diluent un peu `x` et `y`.
10. **Échecs de génération/compilation dans l'UI** (tranché) : chaque action passe par `commit`, qui conserve l'état précédent et affiche l'erreur.
11. **Historique et contraintes** (tranché) : une série de modifications de contraintes = une seule entrée (`coalesce` dans `commit`) ; toute autre action referme la série. Étendu aux poids (`grammarEditId`).
12. **Vocabulaire manuel** (tranché) : réactiver un opérateur le remet à `1` — le poids précédent est perdu (pas d'état « last weight ») ; le champ de poids est désactivé tant que l'opérateur est off (case d'abord). Aucun « lock » par opérateur : c'est le vocabulaire lui-même qui contraint « New weights ». Le dernier terminal actif est verrouillé (case désactivée, plancher `MIN_ACTIVE_WEIGHT`) — prédicat dérivé, pas d'état.
13. **Un mot = un foyer** (tranché 2026-10-17) : « dataset » ne désigne plus que l'**artefact** du banc ; « bench » la chaîne hors-ligne ; « analysis » les mesures pures ; « lab »/« gallery »/« play » les modes UI ; « batch »/« planche » le lot rendu et sa grille ; « notebook » le carnet. Corollaire : un motif `.gitignore` qui vise la racine du paquet doit être **ancré** (`/dataset/`) — le motif non ancré `dataset/` avait masqué du **code source** (`src/core/dataset/`, `src/dataset/`), qui n'a donc jamais été versionné.
14. **Galerie : capture canvas avant le lot G** (tranché) : le readback par lot passe par `drawImage` + `getImageData` sur une surface offscreen réutilisée (friction 4) ; la migration vers `RenderTarget`/`readPixels` de glaze est un suivi (lot G).
15. **Galerie : pas de N canvas** (tranché) : une planche = **une** surface offscreen + **un** canvas d'affichage (`putImageData`) ; la limite de contextes WebGL (~8–16) interdit une cellule par canvas.
16. **Galerie : l'humain juge** (tranché) : la note est manuelle ; les descripteurs et la PCA ne servent qu'à **filtrer** (aplats) et à **expliquer** (rapport I4). Aucun score automatique de beauté (brief §8).

## Rituel de fin de session

1. `vp check --fix` et `vp test` verts.
2. Mettre à jour « État courant » et « Prochaine action ».
3. Noter toute friction tranchée dans la liste ci-dessus.
4. Commit : le repo est la source de vérité, pas ce plan.
