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
    - _Lab dans randomart_ : `@repo/lab` **supprimé** (retiré du lockfile). `descriptors`/`pca` (+ tests) dans `randomart/src/lab/` ; scripts Node (`dataset`, `png`, `contact-sheet`, `features`, `pca-report`, `auto`) et leurs artefacts (`features.json`, `pca.json`, `sheet.png`) dans `randomart/scripts/lab/` ; `tsconfig` inclut `scripts`. Sortie identique (vérifié : `features.json` regeneré == fichier commité, seule l'indentation du formateur diffère).

**Pas encore fait** : lot G (rendu épaissi, à la demande) ; **nouvel épic « galerie + recettes »** (voir « Prochaine action »). Le **lot H est clos** (poids, contraintes, durée et budget mesurés).

**Tests** : verts (242 passés, 10 sautés — `measure`/`dump` + les trois sondes de champ/budget, opt-in ; `vp check` : 0 erreur) ; 900 shaders validés par `glslangValidator` (`scripts/validate-glsl.sh`).

## Prochaine action

1. **Conceptualiser l'épic « galerie + recettes »** (décision utilisateur 2026-10-17, **à cadrer dans une session dédiée — rien commencé**) : un moyen de générer des lots d'images (planches-contact) soi-même — dans l'app et/ou via un script —, de les **classer** (notation manuelle et/ou métrique automatique), puis d'en **déduire de bonnes recettes** (grammaires) — une boucle d'apprentissage légère (« mini réseau de neurones ») qui ajuste les poids/contraintes vers les images jugées bonnes. Points à trancher en conceptualisation : modèle d'apprentissage (bandit/évolution vs petit modèle), format de stockage des lots et des notes. Tranché le 2026-10-17 : l'analyse (descriptors, PCA) et le banc headless vivent désormais **dans randomart** (`src/lab/`, `scripts/lab/`) ; le rendu des lots sera **in-app GPU** (motif de `dataset/page.ts`), les scripts restant le banc hors-ligne. Matière première : `src/lab/`, `scripts/lab/`, et les trois sondes jetables ci-dessous.
2. **Politique throw vs repair** : **fait le 2026-10-16** — politique tranchée dans `shared/index.ts`, site par site dans les commentaires, audit dans `findings.md` §8. Restes hors périmètre : F14/F15, F16/F30 ; trouvailles différées (F1, F2, F9, F10) hors périmètre.

## Sondes jetables (non commitées)

Trois fichiers de mesure **non suivis**, laissés pour la prochaine session (matière première de l'épic ci-dessus) :

- `src/core/compiler/fieldDist.measure.test.ts` — évaluateur CPU du champ + métriques (plage, aplatissement local, corrélation opérateur↔aplat, comparaison de jeux de poids). `VITE_MEASURE=1 vp test fieldDist --disableConsoleIntercept`.
- `src/core/compiler/fieldRender.measure.test.ts` — même évaluateur + encodeur PNG minimal, pour écrire des planches-contact dans `/tmp/opencode/field/`. `VITE_MEASURE=1 vp test fieldRender --disableConsoleIntercept`.
- `src/core/generator/budget.measure.test.ts` — stats d'arbre (taille, profondeur, taux d'atteinte de `maxDepth`/`maxNodes`) et biais du partage de budget par index d'enfant. `VITE_MEASURE=1 vp test budget --disableConsoleIntercept`.

(`--disableConsoleIntercept` : sans lui, Vite+ avale les `console.log` des tests.)

Dette intrinsèque : l'évaluateur **réimplémente à la main** la sémantique des opérateurs (le même risque de dérive que l'ex-`math`). À remplacer par une source unique (sémantique évaluable → GLSL) ou à assumer, lors de la conceptualisation.

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

## Dépendances

```
A..F : faits
G : à la demande
H : fait (poids, contraintes, durée, budget mesurés)
I (galerie + recettes) : à conceptualiser (lab rapatrié dans `src/lab` + `scripts/lab`)
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

## Rituel de fin de session

1. `vp check --fix` et `vp test` verts.
2. Mettre à jour « État courant » et « Prochaine action ».
3. Noter toute friction tranchée dans la liste ci-dessus.
4. Commit : le repo est la source de vérité, pas ce plan.
