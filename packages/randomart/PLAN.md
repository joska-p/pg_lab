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

**Pas encore fait** : lots G et H.

**Tests** : verts (242 passés, 2 sautés — `measure`/`dump`, opt-in ; `vp check` : 0 erreur) ; 900 shaders validés par `glslangValidator` (`scripts/validate-glsl.sh`).

## Prochaine action

1. **Calibrer le champ (lot H)** : la palette **sature** quand le champ sort de `[-1, 1]` (aplats rouges/magenta). Piste : normaliser le champ avant la palette (échelle ou `tanh`) pour occuper toute la rampe. À trancher en jouant, pas avant.
2. **Politique throw vs repair** : **fait le 2026-10-16** — politique tranchée dans `shared/index.ts`, site par site dans les commentaires, audit dans `findings.md` §8. Restes hors périmètre de l'audit : F14/F15 (marque vs duck-typing dans `createExpression`/`nodeCount`) et F16 (normalisation `−0 → 0`)/F30 (style de spécificateurs de module). Les trouvailles différées comme « à réécrire » (F1 historique, F2 export HD/AA, F9 double-fit, F10 blocage vite) restent hors périmètre.

## Dette connue (petite, non bloquante)

- **Poids typés** : `Grammar.weights` est `Readonly<Record<string, number>>`. Le registre étant statique, `Partial<Record<OperatorId, number>>` rendrait `defaultGrammar` exhaustif. Différé.
- **`randomizeWeights` : chemin de bascule dormant** : l'UI ne l'appelle plus qu'avec `changeRate: 0` (vocabulaire gelé) ; le toggle aléatoire et `DEFAULT_KEEP` (D39) ne vivent plus que dans le cœur et ses tests. Conservés pour un éventuel geste « grammaire pleine au hasard ».
- `ShapeBatcher.compileProgram` ne supprime pas ses shaders après le link, et fuit le vertex shader si le fragment échoue.
- `Controls` : durée de boucle et import de fichier en `<input>` bruts au lieu de composants `ui` (les bornes numériques viennent maintenant des constantes du cœur — `MAX_DEPTH`/`MAX_NODES`/`MIN_LOOP_MS`/`MAX_LOOP_MS`).
- **Palette saturante** : la rampe `spectrum` (et les autres) borne le champ à `[-1, 1]` avant la palette ; un champ hors bornes donne un aplat. Voir « Prochaine action » 2.

## Lots

L'ordre est une guidance. Chaque lot laisse le repo vert et commitable. Lots A à F : voir « Fait » ci-dessus.

### Lot F — Persistance (fait)

- `serialize`/`deserialize` d'expression avec limites d'import (5 000 nœuds, profondeur 64), erreurs avec adresse.
- `artwork` : `createArtwork`, fichiers `.randomart.json`, bornes, champs inconnus refusés, `checkProvenance`.
- Déplacer le fichier de grammaire de `grammar/serialize.ts` vers `artwork`.
- Import/export d'œuvres dans l'UI.

### Lot G — Glaze, rendu épaissi

Seulement si le besoin se confirme en jouant. `RenderTarget` + `readPixels`, `Program.render(target?)`, résolution réduite pendant l'animation, export HD à taille arbitraire, tests navigateur (réévaluer alors la friction 1). Plus tard : compilation asynchrone, export par tuiles, post-traitement.

### Lot H — Calibration (atelier ouvert)

Poids par défaut, contraintes, durée de boucle, répartition du budget du générateur (préférence légère pour les derniers enfants). Sessions libres, déclenchées par une friction.

## Dépendances

```
A..F : faits
G : à la demande
H : libre
```

## Points de friction connus

1. **Tests navigateur** : requis par D31 sur le papier, coûteux en pratique. Remplacés pour l'instant par le lot D ; à réévaluer au lot G.
2. **Découpage de fichiers** : commencer simple, scinder sur friction réelle.
3. **`shared`** : local à randomart tant qu'aucun autre projet n'en a besoin.
4. **Glaze comme socle GPU** : entrée du fragment = `vUv` (conversion `v_p` au début de `main`) ; pas de `readPixels` en v1 (capture du canvas, `preserveDrawingBuffer`).
5. **Phase** : `Clock` timed + loop de glaze via `ClockStore` ; `u_phase = createPhase(clock.progress)` (marque `Phase`). Remplace `phaseAt` de la spec renderer.
6. **Calibration** : valeurs de départ arbitraires (lot H).
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
