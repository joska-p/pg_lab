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
- **Cœur randomart** : `random`, `catalog` (19 opérateurs dont `warp`), `expression` (+ `nodeKey`, `equals`, `walk`, `getNode`, `formatFormula`), `grammar` (`createGrammar`, `minSize`, `defaultGrammar`, `fitConstraints`, `describeGrammar`, `randomizeWeights`, sérialisation de grammaire), `generator`.
- **Compilateur complet** : `lower`, `emit`, `preamble`, `compile`, `MAX_SOURCE_LENGTH`.
- **UI** : `appStore` (grammaire en état, historique de 30 entrées, `commit` unique, `actionError`), `Controls` (nouvelle image, nouveaux poids, reset, export/import de grammaire, contraintes, historique, lecture, export PNG), `Inspector` (arbre, formule, stats, aperçu), `Scene` + `RandomArtCanvas`.
- **Lot A** : fait (un seul shader, `pushLine`, uniforms, `revokeObjectURL`, `Catalog.dependencies` obligatoire, docs amendées).
- **Lot B** : fait (B1 à B5 ; B6 = `describeGrammar`, affiché dans `Controls`). Un seul randomiseur (`randomizeWeights`) : poids et vocabulaire ne font qu'un (poids 0 = hors vocabulaire, plancher `0.001`, D33/D40/D41), contraintes éditées par l'UI.
- **Lot C** : fait (`needsRender`, `shouldRender`, redessin après `webglcontextrestored`).
- **Lot D** : fait (`fuzz.test`, `emit.test`, `dump.test` + `scripts/validate-glsl.sh`, `measure.test`).
- **Lot E** : fait (inspecteur, `docs/explorer-spec.md`).
- **Revue de code** : `fitConstraints` corrigé (maxDepth l'emporte) et testé ; l'édition de contraintes ne crée plus qu'une entrée d'historique par série de modifications ; état mort d'`appStore` retiré.
- **Refonte du catalogue** : `catalog.ts` (447 lignes, définition et validation mélangées) remplacé par un **registre statique** de specs (`operators/*.ts`, `dependencies.ts`) et deux classes : `Operator` (spec instanciée ; sonde les multiplicités **une fois**, à la construction) et `Catalog` (registre + fermeture des dépendances). Supprimés : `name` dans la spec (la clé du registre fait foi), `family` (→ `group`), `inputs: InputDef[]` (→ listes nommées `inputs` + `inner`), `output`, `ValueType`, `withOutput`, `cost`, `createCatalog`, `defineDependency`. Renommés : `innerCoords` → `coords`, `scope` par entrée → `inner`. Les `args` et `params` sont nommés (`args.a`, `args.dx`). Le compilateur ne sonde plus (`probeMultiplicities` / `probeInnerMultiplicities` supprimés ; `lower` réassemble `[...inputs, ...inner]`). `formatGlslFloat` déplacé dans `catalog/format.ts`.
- **Ménage post-plan** (commits `34fa6c7`, `292e540`) : règle `no-use-before-define` activée et définitions réordonnées ; `Inspector` passé dans `Controls` (l'`ErrorBoundary` englobe alors tout le panneau).
- **Lot F** (persistance) : `expression/serialize.ts` (`serialize`/`deserialize`, limites `MAX_IMPORT_NODES` = 5 000 et `MAX_IMPORT_DEPTH` = 64, profondeur vérifiée **avant** de construire les nœuds, erreurs avec adresse type `g.in[1]`) ; module `artwork/` (`types`, `create`, `serialize`, `provenance`) : `createArtwork` (bornes `render` et `title`, défauts 1024² / 8 000 ms), fichiers `.randomart.json` (`serializeArtwork`/`parseArtwork`, ~1 Mo, champs inconnus refusés avec leur chemin), `checkProvenance` (`none` / `matches` / `differs` / `version-mismatch` par `nodeKey` des trois canaux). Les fonctions de fichier de grammaire ont **déménagé** de `grammar/serialize.ts` vers `artwork/serialize.ts`. UI : `appStore` a `provenanceCheck` en état, `HistoryEntry` porte `expression` + `provenanceCheck` pour les imports (restauration **sans régénérer**, l'expression est la référence — D1), `publishArtwork` (taille de rendu ignorée — friction 8 ; `loopMs` adopté dans les bornes de l'UI [1, 60] s), export/import d'œuvre dans `Controls` (statut de provenance affiché).
- **Types brandés (système glaze)**, commit `b866126` : `Brand` vient de glaze (une seule source) ; helpers centralisés dans `shared` (`assertStrictlyPositive`, `assertInteger`, `assertIntegerInRange`, préfixe `Randomart:`) ; `Phase` + `createPhase` (ex-`calculatePhase`) ; `RenderKey` entièrement brandé ; `Constraints` / `RenderSettings` brandés (`ConstraintsInput` / `RenderSettingsInput` bruts en entrée, `createConstraints` / `createRenderSettings` façon ZoomClamp). Détails et IDs : `docs/findings.md` §7.
- **Politique throw vs repair** (2026-10-16, décision documentée dans `shared/index.ts` + site par site dans les commentaires ; audité dans `findings.md` §8) : les identités/contenus/structures → throw (`createSeed`, poids, règle 3, `createRenderSettings` pour appelants vouched) ; les quantités d'édition → réparer via les `fit*` (`createConstraints` est maintenant une usine de réparation — clamp + round + « rendre égales » avec maxDepth qui gagne ; `createGrammar` délègue ses contraintes à `fitConstraints`, les règles 5/7 ne rejettent plus ; nouveau `fitRenderSettings` consommé par `parseArtwork`) ; non-fini → défaut du concept (F12 : plus de « NaN → min » ; `DEFAULT_CONSTRAINTS` 3/8/60 partagé avec `defaultGrammar`) ; titre réparé (vide → absent, trop long → tronqué) ; F17 réglé (`weighted` en une seule passe) ; F21 (fallback `1` de l'UI supprimé), F22 (le drag-along du store requalifié en geste d'intention, l'invariant vit au cœur) ; F19/F20 (une seule paire de bornes = celles de l'œuvre [0.5, 120] s, adoption inconditionnelle du `loopMs` du fichier, `<input>` aligné sur `MIN_LOOP_MS`/`MAX_LOOP_MS`).
- **Inspecteur réduit + vocabulaire manuel** (2026-10-16, décisions utilisateur) :
    - _Inspecteur_ : n'affiche plus que la **formule par canal** (`formatFormula`) ; arbre cliquable, sélection, preview de sous-expression et stats compilateur retirés. L'état `selected` et `compileNodePreview` disparaissent du store — la dette « `compileNodePreview` sans `try/catch` » est résorbée. `docs/explorer-spec.md` reste un guide, pas un contrat.
    - _Panneau `Vocabulary`_ (dans `Controls`) : par opérateur, groupé par `group`, une case = activé et un champ de poids. **SSOT** : la case et le poids sont la _même_ donnée — `weight > 0` est le vocabulaire (`getVocabulary`), il n'existe aucun état « enabled » séparé. Désactiver écrit `weight 0` ; réactiver entre à `1` (valeur neutre, même convention que le repair du randomiseur). Nouvelle action `setOperatorWeight` (store) : répare comme les contraintes (arrondi 3 décimales, clamp `[0, MAX_WEIGHT]`, édition non finie ignorée — F21). Le **dernier terminal actif** est verrouillé par un prédicat _dérivé_ `isLastTerminal(catalog, weights, name)` (cœur, près de `getVocabulary` ; `MIN_ACTIVE_WEIGHT` remonte dans `types.ts`) : case désactivée + plancher de poids positif. L'invariant « au moins un terminal » reste dans `createGrammar` (F22) — l'UI décline un geste sans issue, elle ne porte pas la règle ; trois tests dans `grammar.test.ts`, dont un qui couple le prédicat à la règle 3.
    - _Mariage random/manuel_ : « New weights » appelle `randomizeWeights(…, { changeRate: 0 })` — le vocabulaire est gelé, la redistribution se fait **dans** la sélection manuelle (jamais d'activation/désactivation). Deux écrivains (`setOperatorWeight`, `randomizeWeights`) sur un seul `grammar.weights`. La coalescence d'historique, ex-`constraintEditId`, devient `grammarEditId` (elle couvre aussi les poids).
- **Modèle de couleur** (2026-10-17, décision utilisateur) : nouveau module `core/color/` (`ColorModel`, `PALETTES` — spectrum/ember/forest/ice/mono —, `paletteGlsl`, `PALETTE_IDS`, `isPaletteId`). Deux modes : **`unrelated`** (trois arbres indépendants → RGB brut, comportement historique ; défaut de `createGrammar`) et **`correlated`** (**un seul** champ → palette via `ra_pal` ; `DEFAULT_COLOR`, donc `defaultGrammar`). Le mode `correlated` avec la palette `mono` (`vec3(t)`) donne exactement r=g=b. En corrélé le générateur réutilise le **même** nœud pour r/g/b (`lower` hash-consolide → un seul vertex, aucun travail dupliqué) et le compilateur émet `float t = clamp(<champ> * 0.5 + 0.5, 0.0, 1.0); o_color = vec4(ra_pal(t), 1.0);` ; en non corrélé il écrit toujours `vec3 rgb`. `CompileOptions.color` pilote l'émission ; `buildPreamble` accepte des fonctions GLSL supplémentaires. La couleur vit **dans** la `Grammar` (donc sérialisée avec le fichier de grammaire et portée par la provenance d'œuvre) ; `GENERATOR_VERSION` → 2 (les anciennes œuvres restent lisibles, la provenance signale le décalage de version). Un identifiant de palette inconnu est du **contenu** → throw (politique throw-vs-repair), à la construction comme à la lecture du fichier. UI : `Controls` (Segmented Unrelated/Correlated + Select palette, visible en corrélé), `Inspector` (le champ affiché **une** fois en corrélé, avec la palette). Fuzz/dump/mesure exercent désormais **les deux** modèles (alternance sur `i`). Constat visuel : le corrélé donne des structures lisibles (bandes, diagonales, formes organiques) là où l'indépendant dérive en pastel/aplats.
- **Ménage de fin de revue** : `compiler/compiler.ts` (couche de compatibilité morte) supprimé, l'import de `compiler.test.ts` recâblé sur `compile.ts` + `format.ts` ; en-têtes « spec § » obsolètes retirés (`lower`, `emit`, `compile`, `preamble`, `format`) ; `emit` n'utilise plus d'assertion non-nulle (`!`) mais lève une erreur explicite si un vertex n'a ni variable ni texte.

- **`math` supprimé** (2026-10-17) : le champ `math` (formule lisible maintenue à la main par opérateur, à côté de `glsl`) n'avait **aucun consommateur** — l'`Inspector` n'affiche que `formatFormula` (notation fonctionnelle dérivée de l'arbre). Retiré de `OperatorSpec`/`defineOperator`, de `Operator` (méthode `math`), des 5 fichiers d'opérateurs, des tests et des docs (`catalog-spec.md`, `expression-spec.md` §10). SSOT : `glsl` ; la formule lisible reste **dérivée**, jamais un second texte à maintenir.
- **Lot H — calibration des poids par défaut** (2026-10-17) : `defaultGrammar` recalibré pour la structure (x/y 4, max 2, min 1.5 ; const/add/gt/tsin/tcos 0.5 ; mul 0.75 ; select/mix/warp 0.5 ; le reste 1). **Prémisse du plan corrigée** : « la palette sature quand le champ sort de `[-1, 1]` » est **faux** — le champ est borné à `[-1, 1]` par construction (chaque opérateur préserve la plage ; le `clamp` final de `compile.ts` est donc **mort**), et un remap monotone (`tanh`/échelle) ne peut pas créer de structure sur un champ constant. Les aplats viennent d'un champ **constant** produit par les opérateurs saturants (`tsin`/`tcos` — constantes spatiales, `0`/`1` à la phase 0, qui annulent des sous-arbres `mul` —, `gt`, `add`, `const`). Effet mesuré sur le corpus fuzz : aplatissement local moyen 59 % → 41 %, aplats quasi uniformes 42 % → 19 %. Snapshot du générateur mis à jour.
- **Lot H clos — contraintes, budget, durée** (2026-10-17, mesure via la sonde `budget.measure.test.ts`, 5 000 seeds) : **aucun changement de valeur**, la mesure justifie les défauts.
    - _Budget_ : le partage `m + floor(libre/(k−i))` favorise le dernier enfant d'au plus 2 % (part moyenne du 2ᵉ enfant 0,509 vs 0,491 ; il est le plus grand dans 35 % des nœuds binaires). Correction inutile — banale et coûteuse.
    - _Contraintes_ (`3/8/60`) : arbre corrélé de 17,7 nœuds (p95 39, p99 49) et profondeur 6,3 (p95 8). `maxDepth` est la vraie borne (43 % des arbres l'atteignent) ; `maxNodes` un plafond de sûreté presque jamais touché. Les valeurs restent.
    - _Durée de boucle_ (`DEFAULT_LOOP_MS = 8000`) : `tsin`/`tcos` sont exactement périodiques en `u_phase`, donc toute durée boucle proprement — c'est une préférence de lecture, bornée `[500, 120000]` ms et exposée dans l'UI.
- **Dette soldée** (2026-10-17) :
    - _Poids typés_ : `Grammar.weights` est `GrammarWeights = Readonly<Partial<Record<OperatorId, number>>>` (registre statique → une faute de nom est une erreur de compilation, `defaultGrammar` protégé) ; lecture unique via `weightOf` (absent = 0), plus de `Record<string, number>` ad hoc.
    - _Fuite `ShapeBatcher.compileProgram`_ (glaze) : supprime les deux shaders après le link et libère le vertex shader si le fragment échoue — même motif que `shader/compileProgram`.
    - _`clamp` final **conservé** et documenté_ (tranché) : il est prouvé mort par le contrat des opérateurs, mais sert de garde bon marché au bord du rendu (le compilateur accepte n'importe quel catalogue).

- **Deux modes + lab rapatrié** (2026-10-17, décisions utilisateur) :
    - _Split play/lab_ : `Controls` devient un orchestrateur mince (bascule `Segmented` Play/Lab, état de vue **local** — conventions §3 —, défaut Play ; l'`ErrorBoundary` de panneau reste autour des deux modes). `play/PlayPanel` = le jouet (nouvelle image, shuffle de grammaire complète, select de recettes, Play/Pause, export PNG) ; `lab/LabPanel` = l'atelier actuel (vocabulaire, poids, contraintes, couleur, historique, fichiers, inspecteur), inchangé fonctionnellement.
    - _Cœur_ : `randomGrammar` (vocabulaire + poids + contraintes tirés d'un coup, `includeTime` false pour les datasets phase 0) extrait dans `core/grammar/randomGrammar.ts` et **consommé par `sampleGrammars`** — une seule source pour le tirage, dataset inchangé (tests verts). `grammarPresets`/`presetIdOf` : recettes figées (Structure/Mono/Ember/Raw RGB) qui réutilisent les poids calibrés du défaut et ne changent que le **modèle de couleur** (qui fait partie de la grammaire) ; recettes provisoires, à remplacer par celles trouvées au lab. Store : `applyGrammar` (recette, même seed) et `shuffleGrammar` (grammaire complète, même seed).
    - _Lab dans randomart_ : `@repo/lab` **supprimé** (retiré du lockfile). `descriptors`/`pca` (+ tests) dans `randomart/src/core/analysis/` ; scripts Node (`dataset`, `png`, `contact-sheet`, `features`, `pca-report`, `auto`) et leurs artefacts (`features.json`, `pca.json`, `sheet.png`) dans `randomart/scripts/bench/` ; `tsconfig` inclut `scripts`. Sortie identique (vérifié : `features.json` regeneré == fichier commité, seule l'indentation du formateur diffère).
- **Lot J — Channels** (2026-10-17, décision utilisateur) : un **seul pipeline couleur** à trois canaux remplace le modèle `correlated`/palette. Deux axes orthogonaux portés par la grammaire :
    - `channels.space` (`srgb` | `oklch` | `oklab` | `hsl`) : interprétation du triplet `(r,g,b)` avant sortie, conversion appliquée **une fois** en fin de `main` (coût constant, pas de LUT). Chaque espace est émis en point d'entrée autonome `vec3 ra_<space>(vec3 raw)` (`colorSpaceGlsl`), porté depuis `_TMP/oldy/randomart/src/core/glsl-color-spaces.ts` (conversions + remaps). `space` est du **contenu** → throw si inconnu.
    - `channels.shareDepth` : profondeur du **tronc partagé** entre les trois canaux. `0` = arbres indépendants (l'ex-`unrelated`) ; `≥ maxDepth` = un seul arbre → `r = g = b` **par identité** (les sous-arbres entièrement partagés renvoient le même objet nœud, `lower` hash-consolide). Sous le tronc, chaque canal diverge sur **opérateurs + paramètres**. C'est **l'axe de corrélation** (uncorrelated ↔ correlated). C'est une **quantité d'édition** → réparée (arrondi + clamp `[0, maxDepth]`, non-fini → défaut ; le store ignore une édition non finie, F21).
    - Défauts : `DEFAULT_CHANNELS = { space: 'oklch', shareDepth: 2 }` (`defaultGrammar`) ; repli de `createGrammar` sur `RAW_CHANNELS = { space: 'srgb', shareDepth: 0 }` (le dataset garde le tirage historique). `GENERATOR_VERSION` → **3**.
    - Supprimés : `color.kind`, `PALETTES`, `paletteGlsl`, `DEFAULT_COLOR`, la branche `correlated` du générateur, `extraFunctions` du préambule, les champs `palette` de sérialisation, le Select palette de l'UI. Renommés : `color` → `channels`, `ColorModel` → `ChannelModel`, `setColorModel` → `setChannels`. Recettes (`presets.ts`) refaites autour des canaux : **Structure** (oklch/2), **Mono** (oklch/maxDepth), **OKLab** (oklab/2), **Raw RGB** (RAW_CHANNELS).
    - Mesure du tronc (500 seeds × 9 partages, `budget.measure` réutilisée) : partage 0 → 52,7 nœuds / 34,0 vertices ; 2 → 53,4 / 34,3 ; 8 → 13,0 / 13,0 (tout partagé). **Correction du plan** : le tronc n'est **pas** « gratuit » — il est **négligeable** au défaut (`shareDepth = 2`) et **économise** des vertices quand il absorbe tout (D43).
    - Tests : modèle (`color.test.ts` : défauts, réparation, partage du générateur, compilation, sérialisation), invariants `generator.test.ts` (sur tous les `shareDepth`), snapshot régénéré, attentes de `compiler.test.ts` alignées ; fuzz/dump/mesure exercent les espaces.

- **Lot I — Galerie, jalon I1 fait** (2026-10-17) : le renderer de lot est extrait du banc et la vue **planche** existe.
    - _Cœur de rendu_ : `src/renderer/batch.ts` — `createBatchRenderer(catalog)` possède **une** surface offscreen réutilisée (canvas hors écran de `taille`px, ajouté au DOM pour avoir un `clientWidth`, `GpuSurface`, contexte 2D de readback) ; `render(requests, size) → RenderedBatch[]` (une cellule = `{ error, image: RgbImage | null }`) ; `destroy()`. L'échec par cellule est une **valeur** (génération, compilation, refus du driver), jamais une exception — sauf la construction de la surface. L'API `window.benchApi` ne bouge pas : `src/bench/page.ts` devient un **adaptateur de fil** (~120 lignes : `deserializeGrammar`/`serializeGrammar` + base64) au-dessus du renderer partagé. **Vérifié A/B (`git stash`) : `pixels.bin` et `dataset.json` byte-identiques à HEAD** (12 grammaires × 8 seeds @ 64 px). Bench et galerie rendent donc **les mêmes pixels**.
    - _Échantillonnage_ : `SampleOptions.channels` (défaut `RAW_CHANNELS` — le dataset garde son tirage historique, test inchangé) ; la galerie passe `DEFAULT_CHANNELS`, pour explorer la structure lisible du mode Play plutôt que le pastel du dataset.
    - _Galerie_ (`src/components/gallery/`) : `planche.ts` (assemblage **pur** et testé : grille N rangées × k colonnes, colonnes = la plus large, cellules vides au fond, alpha opaque) ; `Planche.tsx` (**un** canvas, **un** `putImageData` d'une image assemblée — friction 15) ; `lot.ts` (`isFlat` via `describeImage().flatShare ≥ 0.9` : filtre de **bug** opt-in, pas un jugement) ; `GalleryPanel.tsx` (lot 8 × 8 par défaut, cellules 16/32/64 px, `New batch` / `Redraw`, seed affiché, compteurs cellules/échecs/aplats masqués). `Controls` passe à **trois** modes (Play / Gallery / Lab), le mode reste de l'état de vue **local**.
    - _Cycle de vie_ : le renderer est un objet vivant possédé par le **panneau** (ref + cleanup au démontage, conventions §7) ; le lot est de l'état de vue local — le carnet (I2) lui donne une identité et une mémoire.
    - _Limite assumée_ : la planche vit dans le panneau (320 px, `maxWidth: 100%`) comme le prévoyait la liste de fichiers du lot I ; la passer dans le Stage demanderait un mode partagé et un store — c'est I2+ (friction 17).
    - _Tests_ (278 passés, +5) : `planche.test.ts` (dimensions, placement, padding, lot vide) et `sample.test.ts` (modèle de canaux personnalisé). `vp check` : 0 erreur.

- **Lot I — Galerie, jalon I1 fait** (2026-10-17) : le renderer de lot est extrait du banc et la vue **planche** existe.
    - _Cœur de rendu_ : `src/renderer/batch.ts` — `createBatchRenderer(catalog)` possède **une** surface offscreen réutilisée (canvas hors écran de `taille`px, ajouté au DOM pour avoir un `clientWidth`, `GpuSurface`, contexte 2D de readback) ; `render(requests, size) → RenderedBatch[]` (une cellule = `{ error, image: RgbImage | null }`) ; `destroy()`. L'échec par cellule est une **valeur** (génération, compilation, refus du driver), jamais une exception — sauf la construction de la surface. L'API `window.benchApi` ne bouge pas : `src/bench/page.ts` devient un **adaptateur de fil** (~120 lignes : `deserializeGrammar`/`serializeGrammar` + base64) au-dessus du renderer partagé. **Vérifié A/B (`git stash`) : `pixels.bin` et `dataset.json` byte-identiques à HEAD** (12 grammaires × 8 seeds @ 64 px). Bench et galerie rendent donc **les mêmes pixels**.
    - _Échantillonnage_ : `SampleOptions.channels` (défaut `RAW_CHANNELS` — le dataset garde son tirage historique, test inchangé) ; la galerie passe `DEFAULT_CHANNELS`, pour explorer la structure lisible du mode Play plutôt que le pastel du dataset.
    - _Galerie_ (`src/components/gallery/`) : `planche.ts` (assemblage **pur** et testé : grille N rangées × k colonnes, colonnes = la plus large, cellules vides au fond, alpha opaque) ; `Planche.tsx` (**un** canvas, **un** `putImageData` d'une image assemblée — friction 15) ; `flats.ts` (`isFlat` via `describeImage().flatShare ≥ 0.9` : filtre de **bug** opt-in, pas un jugement) ; `GalleryPanel.tsx` (lot 8 × 8 par défaut, cellules 16/32/64 px, `New batch` / `Redraw`, seed affiché, compteurs cellules/échecs/aplats masqués). `Controls` passe à **trois** modes (Play / Gallery / Lab), le mode reste de l'état de vue **local**.
    - _Cycle de vie_ : le renderer est un objet vivant possédé par le **panneau** (ref + cleanup au démontage, conventions §7) ; le lot est de l'état de vue local — le carnet (I2) lui donne une identité et une mémoire.
    - _Limite assumée_ : la planche vit dans le panneau (320 px, `maxWidth: 100%`) comme le prévoyait la liste de fichiers du lot I ; la passer dans le Stage demanderait un mode partagé et un store — c'est I2+ (friction 17).
    - _Tests_ (278 passés, +5) : `planche.test.ts` (dimensions, placement, padding, lot vide) et `sample.test.ts` (modèle de canaux personnalisé). `vp check` : 0 erreur.

- **Rangement `dataset` / `lab`** (2026-10-17, prérequis de l'épic — voir « Lot I ») : un mot par foyer. `src/lab/` → `src/core/analysis/` ; `scripts/lab/` → `scripts/bench/` ; `src/dataset/page.ts` → `src/bench/page.ts` ; `dataset.html` → `bench.html` ; `scripts/generate-dataset.mjs` → `scripts/bench/generate.mjs` ; `src/core/dataset/sample{,.test}.ts` → `src/core/grammar/sample{,.test}.ts` (exportés par le baril `grammar`) ; `window.datasetApi` → `window.benchApi`. **Cause racine** : le motif `.gitignore` `dataset/` (non ancré) masquait trois choses sans rapport — l'artefact, `src/dataset/` et `src/core/dataset/` — si bien que `sample.ts`, son test et la page de rendu par lot n'avaient **jamais été dans git** ; le motif est désormais ancré (`/dataset/`). Le `tsc -b` repasse : la page appelait encore `compile(…, { color: grammar.color })`, API supprimée au lot J.

**Pas encore fait** : lot G (rendu épaissi, à la demande) ; **lot I « galerie + recettes »** — **cadré le 2026-10-17, I0 et I1 faits, I2..I5 à coder** (voir la section « Lot I » et « Prochaine action »). Les **lots H et J sont clos**.

**Tests** : verts (278 passés, 10 sautés — `measure`/`dump` + les trois sondes de champ/budget, opt-in ; `vp check` : 0 erreur) ; 900 shaders validés par `glslangValidator` (`scripts/validate-glsl.sh`).

## Prochaine action

1. **Lot J — Channels** (couleur + partage de structure) : **fait** le 2026-10-17 (voir « Fait »). Un seul pipeline à trois canaux ; modèle `correlated`/palette supprimé.
2. **Lot I — Galerie + recettes : cadré le 2026-10-17** (section « Lot I » ci-dessous). **I0 fait** (rangement du vocabulaire) et **I1 fait** (renderer de lot partagé + vue planche, voir « Fait ») ; restent **I2..I5**. Tranché : élites + recherche guidée (**pas** de modèle entraîné) ; carnet JSON à **métadonnées seules** (pixels dérivés) ; notation **0–5** par rangée + « garder » par cellule ; rendu par lot in-app GPU sur **une** surface offscreen réutilisée ; l'analyse (`src/core/analysis/`) et le banc (`scripts/bench/`) fournissent la matière et le résumé (« pourquoi »). Prochaine étape : **I2 — Carnet** (`src/core/notebook/`, persistance IndexedDB, notation dans le store). Matière première : `src/core/analysis/`, `scripts/bench/`, et les trois sondes jetables ci-dessous.
3. **Politique throw vs repair** : **fait le 2026-10-16** — politique tranchée dans `shared/index.ts`, site par site dans les commentaires, audit dans `findings.md` §8. Restes hors périmètre : F14/F15, F16/F30 ; trouvailles différées (F1, F2, F9, F10) hors périmètre.

## Sondes de mesure (opt-in)

Trois fichiers de mesure, **committés** (entrés avec le lot J) mais exécutés seulement sous `VITE_MEASURE=1` — matière première de l'épic ci-dessus :

- `src/core/compiler/fieldDist.measure.test.ts` — évaluateur CPU du champ + métriques (plage, aplatissement local, corrélation opérateur↔aplat, comparaison de jeux de poids). `VITE_MEASURE=1 vp test fieldDist --disableConsoleIntercept`.
- `src/core/compiler/fieldRender.measure.test.ts` — même évaluateur + encodeur PNG minimal, pour écrire des planches-contact dans `/tmp/opencode/field/`. `VITE_MEASURE=1 vp test fieldRender --disableConsoleIntercept`.
- `src/core/generator/budget.measure.test.ts` — stats d'arbre (taille, profondeur, taux d'atteinte de `maxDepth`/`maxNodes`) et biais du partage de budget par index d'enfant. `VITE_MEASURE=1 vp test budget --disableConsoleIntercept`.

(`--disableConsoleIntercept` : sans lui, Vite+ avale les `console.log` des tests.)

Dette intrinsèque, à trancher au lot I : l'évaluateur **réimplémente à la main** la sémantique des opérateurs (le même risque de dérive que l'ex-`math`). À remplacer par une source unique (sémantique évaluable → GLSL) ou à assumer explicitement.

## Dette connue (petite, non bloquante)

- **`randomizeWeights` : chemin de bascule dormant** : l'UI ne l'appelle plus qu'avec `changeRate: 0` (vocabulaire gelé) ; le toggle aléatoire et `DEFAULT_KEEP` (D39) ne vivent plus que dans le cœur et ses tests. Conservés pour un éventuel geste « grammaire pleine au hasard ».
- `LabPanel` : durée de boucle et import de fichier en `<input>` bruts au lieu de composants `ui` (les bornes numériques viennent maintenant des constantes du cœur — `MAX_DEPTH`/`MAX_NODES`/`MIN_LOOP_MS`/`MAX_LOOP_MS`). Laissé de côté : churn UI probablement remplacé par l'épic galerie.

_(Soldés le 2026-10-17 : poids typés, fuite `ShapeBatcher`, `clamp` final — voir « Fait ».)_

## Lots

L'ordre est une guidance. Chaque lot laisse le repo vert et commitable. Lots A à F : voir « Fait » ci-dessus.

### Lot F — Persistance (fait)

- `serialize`/`deserialize` d'expression avec limites d'import (5 000 nœuds, profondeur 64), erreurs avec adresse.
- `artwork` : `createArtwork`, fichiers `.randomart.json`, bornes, champs inconnus refusés, `checkProvenance`.
- Déplacer le fichier de grammaire de `grammar/serialize.ts` vers `artwork`.
- Import/export d'œuvres dans l'UI.

### Lot G — Glaze, rendu épaissi

Seulement si le besoin se confirme en jouant. `RenderTarget` + `readPixels`, `Program.render(target?)`, résolution réduite pendant l'animation, export HD à taille arbitraire, tests navigateur (réévaluer alors la friction 1). Plus tard : compilation asynchrone, export par tuiles, post-traitement.

### Lot H — Calibration (fait)

Poids par défaut, contraintes, durée de boucle, répartition du budget du générateur. Calibré au lot H (mesure via sonde) : poids recalibrés pour la structure, contraintes et durée conservées (mesure à l'appui), partage du budget conservé (biais ≤ 2 %).

### Lot J — Channels (couleur + partage de structure) — fait

But : un **seul pipeline couleur** à trois canaux. Supprimer le modèle `correlated`/palette (`float → vec3`) au profit de deux axes orthogonaux portés par la grammaire :

- `channels.space` : interprétation du triplet `(r,g,b)` avant sortie — `srgb` | `oklch` | `oklab` | `hsl`. Conversion appliquée **une fois** en fin de `main` (coût constant, indépendant de la taille de l'expression ; pas de LUT).
- `channels.shareDepth` : profondeur du **tronc partagé** entre les trois canaux. `0` = arbres indépendants (le `unrelated` actuel) ; `≥ maxDepth` = un seul arbre → `r=g=b` (l'effet « mono » d'aujourd'hui, sans palette). C'est **l'axe de corrélation** (uncorrelated ↔ correlated).

Décisions validées (2026-10-17) :

- Supprimer `color.kind`, `PALETTES`, `paletteGlsl`, `DEFAULT_COLOR`, la branche `correlated` du générateur, le paramètre `extraFunctions` du préambule, les champs `palette` de sérialisation et le Select palette de l'UI.
- Renommer `color` → `channels` dans la grammaire ; `ChannelModel = { space, shareDepth }`. Champ nommé **`shareDepth`** (tranché).
- Sous le tronc, chaque canal diverge sur **opérateurs + paramètres** (couleur partout ; ne diverger que sur les valeurs laisserait des zones grises).
- Espaces de couleur portés depuis `_TMP/oldy/randomart/src/core/glsl-color-spaces.ts` (fonctions de conversion + remaps : `L = clamp(x*0.5+0.5)`, `C = abs(y)*0.4`, `H = (z*0.5+0.5)*2π`, etc.).
- Défauts : `space = 'oklch'`, `shareDepth = 2`.
- Pas de rétro-compatibilité fichier requise.
- Coût du tronc partagé **mesuré** (500 seeds × 9 partages) : négligeable au défaut (34,0 → 34,3 vertices du partage 0 au partage 2) et **gain** quand le tronc absorbe tout (partage 8 → 13,0). `lower.ts` hash-consolide en plus **entre canaux**.

Interaction `shareDepth` / `minDepth` : tant que `shareDepth ≤ minDepth`, le tronc est pur opérateurs (pas de feuille précoce) ; au-delà il contient des feuilles → moins de couleur ; `≥ maxDepth` → `r=g=b`. Plage utile `0 … minDepth`.

Jalons (chaque étape laisse `vp check` vert) :

1. `core/color/` : `ChannelModel` + registre d'espaces (GLSL `vec3 → vec3` + remaps) ; palettes retirées.
2. Générateur : `shareDepth` (squelette partagé, divergence opérateurs + params), budget et `minDepth` respectés par canal.
3. Compilateur : branche unique ; injection des fonctions d'espace ; `o_color = vec4(<space>ToSrgb(vec3(r, g, b)), 1.0)`.
4. Grammaire + sérialisation : champ `channels`, validation (`space ∈ set`, `shareDepth` entier réparé dans `[0, maxDepth]`).
5. UI : Select espace + contrôle `shareDepth` ; Select palette retiré.
6. Tests : snapshot par espace ; `r=g=b` si `shareDepth ≥ maxDepth` ; tronc hash-consé une seule fois ; fuzz/measure/dump mis à jour.

Fichiers : `src/core/color/index.ts`, `src/core/generator/generator.ts`, `src/core/compiler/{compile,preamble,types}.ts`, `src/core/grammar/{types,grammar,presets}.ts`, `src/core/artwork/serialize.ts`, `src/core/compiler/testing.ts`, `src/components/{Controls,lab/LabPanel}.tsx`, `src/stores/appStore.tsx`.

Référence : `_TMP/oldy/randomart/src/core/glsl-color-spaces.ts` (conversions + remaps) ; `tree.ts` / `prng.ts` de l'ancien (`createDualRng` / `createCorrelatedRng`) — attention : l'ancien « corrélé » n'est **pas** une palette, c'est un partage de flux RNG ; c'est l'idée d'origine de ce lot.

### Lot I — Galerie + recettes (cadré 2026-10-17, à coder)

But : rendre jouable l'exploration des **grammaires** (et non des seeds) — générer des lots d'images, les **noter**, puis en **déduire des recettes**. C'est la v2 promise par le brief §4 (« la liste de grammaires sauvegardées et leur comparaison viennent en v2 »).

Garde-fou : le brief §8 exclut « un algorithme qui prétend identifier les plus belles images ». Donc **l'humain note, l'algorithme propose et résume** — jamais l'inverse.

Unité de jugement : **une rangée = (grammaire, k seeds)**. C'est déjà l'unité du banc : `sampleGrammars` = une grammaire × k seeds, `sheet.png` = une ligne par grammaire, `features.json` = moyenne/écart **par grammaire**. On note la grammaire, pas l'image ; « garder » une cellule produit une **œuvre** (la boucle 1 servie par la boucle 2).

Pipeline : **proposer → rendre → noter → élire → résumer → recette**.

Vocabulaire (**un mot = un sens, un foyer = un mot** ; appliqué par le jalon I0) :

| Mot                              | Sens unique                                                         | Foyer                                               |
| -------------------------------- | ------------------------------------------------------------------- | --------------------------------------------------- |
| **dataset**                      | l'artefact du banc : grammaires × seeds × pixels, sur disque        | `dataset/` (ignoré par `/dataset/`)                 |
| **bench**                        | la chaîne **hors-ligne** qui produit et analyse le dataset          | `scripts/bench/`, `src/bench/page.ts`, `bench.html` |
| **sampling**                     | tirer des grammaires (vocabulaire + poids + contraintes)            | `src/core/grammar/sample.ts`                        |
| **analysis**                     | mesures **pures** d'une image (descripteurs, PCA)                   | `src/core/analysis/`                                |
| **batch**                        | un lot rendu : N candidats × k seeds                                | `src/renderer/batch.ts`                             |
| **planche**                      | la grille affichée                                                  | `src/components/gallery/`                           |
| **notebook**                     | le carnet : lots + notes + élites + recettes                        | `src/core/notebook/`                                |
| **lab** / **gallery** / **play** | les trois modes UI (atelier de grammaire / galerie de lots / jouet) | `src/components/{lab,gallery,play}/`                |

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
1. **I1 — Rendre un lot** : `src/renderer/batch.ts` (surface offscreen réutilisée + readback → `RgbImage[]`, extrait de `bench/page.ts`) ; vue **planche** (N rangées × k cellules) ; `bench/page.ts` réduit à un pilote.
2. **I2 — Carnet** : `src/core/notebook/` (`types`, `serialize`/`parse` sur le modèle d'`artwork`, bornes et refus de champ inconnu) ; persistance IndexedDB (métadonnées + vignettes) ; export/import de fichier ; action de notation dans le store.
3. **I3 — Proposer** : `src/core/notebook/propose.ts` — élites (seuil / top-k), **mutation** (`randomizeWeights`, `spread` = intensité), **crossover** (mélange de poids entre deux élites), **redémarrage** (`randomGrammar`) ; bouton « Nouvelle génération » ; contraintes héritées des parents, gigue réparée par `fitConstraints`.
4. **I4 — Résumer** : descripteurs in-app sur les cellules rendues (réutilise `src/core/analysis/`) ; rapport **notes ↔ descripteurs ↔ opérateurs** (reprise de `scripts/bench/pca-report.ts`, mais pilotée par la note au lieu de l'index de grammaire). **Lecture seule.**
5. **I5 — Recettes** : promotion d'un candidat noté en `GrammarPreset` (« Garder comme recette »), persistée dans le carnet et proposée dans le Select du mode Play — c'est la promesse de `presets.ts` (« recettes provisoires, à remplacer par celles trouvées au lab »).

Fichiers : `src/renderer/batch.ts` (nouveau), `src/core/notebook/{index,notebook,propose}.ts` (nouveau), `src/core/analysis/` (réutilisé), `src/components/gallery/{GalleryPanel,Planche}.tsx` (nouveau), `src/components/Controls.tsx` (3ᵉ mode du `Segmented`), le store du carnet (nouveau store, §5.3 : un domaine cohérent — le carnet ne partage pas l'autorité d'écriture de `appStore`), `src/core/grammar/presets.ts` (recettes promues).

Questions laissées ouvertes (à trancher en codant) : clé des vignettes (grammaire canonique + version ; `signature` de `presets.ts` est privée et devra être promue en clé de grammaire) ; granularité de la note au fil des générations (par lot ou par candidat) ; ce que devient l'historique de 30 entrées face au carnet ; dette de l'évaluateur CPU des sondes (il réimplémente la sémantique des opérateurs — à solder ou à assumer).

## Dépendances

```
A..F : faits
G : à la demande
H : fait (poids, contraintes, durée, budget mesurés)
I (galerie + recettes) : cadré (analyse dans `src/core/analysis`, banc dans `scripts/bench`) — I0 fait, I1..I5 à coder
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
