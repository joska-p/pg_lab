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

**Pas encore fait** : beaucoup G et H. Trancher `math` (voir « Prochaine action »).

**Tests** : verts après le lot F (`vp check` : 491 fichiers, 0 erreur ; `vpr -r test` : 205 passés, 2 ignorés ; fuzzing 300 cas × 3 politiques).

## Prochaine action

1. **Formule lisible (`math`).** Le catalogue expose un champ `math` par opérateur (maintenu à la main, exercé par un test, pas encore consommé par l'inspecteur, qui affiche `formatFormula`). Trancher : le **dériver** de `glsl` / `coords`, ou le brancher tel quel dans l'inspecteur. Session dédiée.
2. **Jouer avec le lot F** avant d'épaissir le rendu : importer/exporter des vraies œuvres, vérifier que le statut de provenance dit vrai, décider si le titre mérite un champ dans l'UI (actuellement conservé, jamais saisi).

## Dette connue (petite, non bloquante)

- **`math`** : dupliqué à la main à côté de `glsl` ; peut dériver. À dériver ou supprimer (voir « Prochaine action »).
- **Poids typés** : `Grammar.weights` est `Readonly<Record<string, number>>`. Le registre étant statique, `Partial<Record<OperatorId, number>>` rendrait `defaultGrammar` exhaustif. Différé.
- `ShapeBatcher.compileProgram` ne supprime pas ses shaders après le link, et fuit le vertex shader si le fragment échoue.
- `compiler/compile.ts` : en-tête obsolète (« no inner/warp contexts ») ; `compiler/compiler.ts` (couche de compatibilité) est devenu inutile.
- `Inspector` appelle `compileNodePreview` pendant le rendu sans `try/catch`.
- `Controls` : bornes 16 et 400 en dur (utiliser `MAX_DEPTH` / `MAX_NODES`) ; durée de boucle et import de fichier en `<input>` bruts au lieu de composants `ui`.

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
5. **Phase** : `Clock` timed + loop de glaze via `ClockStore` ; `u_phase = calculatePhase(clock.progress)`. Remplace `phaseAt` de la spec renderer.
6. **Calibration** : valeurs de départ arbitraires (lot H).
7. **Aperçu de sous-expression** : ignore la déformation des ancêtres, affiché dans l'UI.
8. **Taille de rendu = taille du canvas** jusqu'au lot G.
9. **Un seul shader** (tranché) : plus de mode Static/Animated. La grammaire par défaut inclut `tsin`/`tcos` ; l'animation relève de la lecture (horloge en pause à la phase 0). À la phase 0, `tsin` vaut 0 et `tcos` vaut 1, et les terminaux de temps diluent un peu `x` et `y`.
10. **Échecs de génération/compilation dans l'UI** (tranché) : chaque action passe par `commit`, qui conserve l'état précédent et affiche l'erreur.
11. **Historique et contraintes** (tranché) : une série de modifications de contraintes = une seule entrée (`coalesce` dans `commit`) ; toute autre action referme la série.

## Rituel de fin de session

1. `vp check --fix` et `vp test` verts.
2. Mettre à jour « État courant » et « Prochaine action ».
3. Noter toute friction tranchée dans la liste ci-dessus.
4. Commit : le repo est la source de vérité, pas ce plan.
