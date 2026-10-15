# PLAN — Random Art

Point d'entrée pour reprendre le travail. **Se met à jour à la fin de chaque session.**
Les specs (`docs/`) sont un guide, pas un contrat. Ce plan fait foi sur l'état réel du code.

## But

Un atelier d'art génératif pour jouer : des expressions mathématiques produisent des images abstraites, fixes ou animées, qu'on explore, comprend et conserve.

Le brief dit : **« j'explorerai plus les grammaires que les seeds »**. Le plan est ordonné par cette phrase : ce qui permet d'explorer des grammaires passe avant ce qui mesure ou durcit.

Principes : cœur TypeScript pur (pas de DOM, pas de GPU) ; rendu = adaptateur mince sur `@repo/glaze` (D36 révisée) ; glaze n'évolue que pour des besoins réels de randomart.

## État courant

**Fait**

- **Glaze (MP0)** : `ShaderError`, `tryCreateProgram`, fuite des programmes corrigée, `GpuCanvas` garde le dernier bon programme (`onShaderError`, `vertexShader`), `contextOptions`, `Clock.setDuration`.
- **Cœur randomart** : `random` (mulberry32), `catalog` (19 opérateurs, `warp`, `ra_fold2`, `u_phase`, validations, `dependencyClosure`), `expression` (nœuds immuables, `depth`, `nodeCount`), `grammar` (`createGrammar` avec les 8 règles, `minSize`, `staticGrammar`, `animatedGrammar`), `generator` (budget, déterminisme, `GENERATOR_VERSION`, snapshots).
- **Compilateur complet** : `lower` (sondage de multiplicité, hash-consing, contextes internés), `emit` (politiques `none`/`shared`/`all`, atomes, littéraux), `preamble`, `compile`, `MAX_SOURCE_LENGTH`.
- **UI** : `appStore` (Zustand), `Controls` (Regenerate, Static/Animated, Play/Pause/Reset, durée de boucle, Export PNG, erreur shader), `Scene` + `RandomArtCanvas`.
- **Corrigé depuis la revue** : gestes figés de `CpuCanvas`, interactions de bouton sur les champs de saisie, couleur d'erreur de `ColorField`.

**Pas encore fait** : `randomize*`, sérialisation (expression, grammaire, œuvre), `nodeKey`/`equals`/`walk`, inspecteur, rendu paresseux, tests de `emit`, garde-fous GLSL au-delà des tests unitaires.

**Tests** : tous verts au dernier plan connu (120 tests randomart, 273 monorepo). À reconfirmer après le lot A.

## Prochaine action

**Lots C et D** : code fourni dans `lot-c-d/` (rendu paresseux, fuzz pur, tests d'`emit`, mesures, validation glslang), à intégrer puis à valider avec `vp check --fix` et `vp test`. Ensuite **lot E** (inspecter une expression : `nodeKey`, `walk`, formule lisible, vue arbre).

## Lots

L'ordre est une guidance. Chaque lot laisse le repo vert et commitable.

### Lot A — Nettoyage issu de la revue

Patches fournis (`revue-code.patch`, `revue-docs.patch`).

- [ ] **Static/Animated supprimé** : un seul shader, Play lance l'animation (fichiers dans `single-shader/` : `appStore.tsx`, `Controls.tsx`, `RandomArtCanvas.tsx`). Remplace le correctif de `setGrammarMode` : ignorer ce hunk de `revue-code.patch` s'il n'est pas encore appliqué.
- [ ] **`ShapeBatcher.#pushLine`** : tester `length === 0` avant `createLineSegment` (qui lève sur des extrémités confondues). Le `return` existant était du code mort.
- [ ] **`createStandardUniformValues`** : retirer la ternaire tautologique sur `u_resolution`.
- [ ] **`exportPng`** : différer `URL.revokeObjectURL`.
- [ ] **`Catalog.dependencies`** : le rendre obligatoire, puis simplifier les tests :

    ```sh
    sed -i -E 's/\.\.\.\(catalog\.dependencies \? catalog\.dependencies\(\) : \[\]\)/...catalog.dependencies()/g' \
      packages/randomart/src/core/compiler/*.test.ts
    ```

- [ ] **Docs** : `docs/README.md` (patch), puis les amendements de « Docs à amender » plus bas.
- [ ] `vp check --fix` et `vp test` verts.

Note : l'initialisation d'`appStore` à l'import (seed 42, déterministe) ne peut pas échouer autrement qu'en cas de bug, un test suffit. Le vrai risque est dans `regenerate` (voir B2).

### Lot B — Explorer les grammaires (le cœur du brief)

_Code livré dans `lot-b/` (non exécuté). Écarts assumés par rapport à la spec : `randomizeVocabulary` renvoie la grammaire d'entrée si aucune réparation ne la rend utilisable ; le fichier de grammaire vit dans `grammar/serialize.ts` (à déplacer dans `artwork` au lot F) ; les actions d'exploration gardent la seed._

- **B1 — Grammaire dans le store.** Remplacer la constante de grammaire d'`appStore` par `grammar: Grammar` en état, pour que la randomisation puisse la remplacer. Les terminaux de temps (`tsin`, `tcos`) restent **toujours** dans le vocabulaire par défaut : une seed = une expression = un shader. « Animer » n'est pas une propriété de la grammaire mais de la lecture (Play/Pause sur l'horloge, démarrée en pause à la phase 0). Un vocabulaire randomisé peut perdre les terminaux de temps : Play est alors désactivé (`compiledShader.animated`).
- **B2 — `grammar/randomize.ts`.** `randomizeWeights`, `randomizeVocabulary`, `randomizeGrammar` selon `grammar-generator-spec §7` : fonctions pures, `Rng` en entrée, `DEFAULT_KEEP = ['x', 'y']`, réparations, poids dans `[0.01, 100]`. Tests §9 (7 et 13) : résultat toujours valide sur beaucoup de seeds, `preserveTerminalShare`, `keep` respecté.
- **B3 — Actions de store et UI.** Quatre actions alignées sur le glossaire : nouvelle image (seed), nouvelle distribution, nouveau vocabulaire, nouvelle grammaire. Chaque action fait `generate` + `compile` dans un `try/catch` : en cas d'échec (`MAX_SOURCE_LENGTH`, bug), l'état précédent est conservé et l'erreur affichée. Boutons dans `Controls`.
- **B4 — Historique.** Pile des N derniers `(seed, grammar)` avec retour en arrière en un clic. Premier outil pour « ne pas perdre ses découvertes ».
- **B5 — Sérialisation de grammaire.** `serializeGrammar`/`deserializeGrammar` (déjà spécifiées) + export/import d'un fichier JSON versionné. C'est la sauvegarde des grammaires, sans attendre `artwork`.
- **B6 — Indicateur de taille** (optionnel) : afficher `(1 − T) × a` (grammaire §6) pour deviner si les arbres vont grossir.

### Lot C — Rendu paresseux

_Code livré dans `lot-c-d/` (non exécuté). Écart avec le plan initial : glaze change un peu (`GpuCanvas` dessine toujours une fois un programme jamais dessiné, pour éviter qu'un shader remplacé reste invisible derrière `shouldRender`), et `RandomArtCanvas` écoute `webglcontextrestored` pour redessiner. La décision pure est `needsRender` (`renderer/renderGate.ts`)._

Une image statique ou en pause redessine 60 fois par seconde pour rien.

- `RandomArtCanvas` passe `shouldRender` à `GpuCanvas` ; l'état rendu précédent `{ shader, phase, width, height }` est gardé dans une ref, et on ne redessine que si l'un change.
- `preserveDrawingBuffer: true` garde le contenu entre les frames, donc sauter un rendu est sûr, **sauf** après redimensionnement (changer `canvas.width` vide le buffer) et perte de contexte : c'est pour ça que la taille est dans la clé.
- Vérifier à la main : image statique figée, pause, redimensionnement, changement de shader.
- Si la logique devient lourde, extraire une fonction pure `needsRender(prev, next)` testable.

### Lot D — Garde-fous GLSL (sans navigateur)

_Code livré dans `lot-c-d/` (non exécuté) : D1 (`fuzz.test.ts`, 300 cas × 3 politiques, réglable par `VITE_FUZZ_COUNT`), D2 (`emit.test.ts`), D3 (`dump.test.ts` + `scripts/validate-glsl.sh`), D4 (`measure.test.ts`, opt-in par `VITE_MEASURE=1`). Les helpers sont dans `compiler/testing.ts`, hors de l'index du compilateur._

Remplace en grande partie les tests navigateur reportés (friction 1).

- **D1 — Fuzz pur.** 1000 expressions (`staticGrammar` et `animatedGrammar`) × 3 politiques : parenthèses équilibrées, pas de `--`, chaque `v<n>` et `c<n>` déclaré avant usage, source ≤ `MAX_SOURCE_LENGTH`, `validateShaderContract` valide, stats cohérentes.
- **D2 — `emit.test.ts` dédié.** Décisions de variable par politique, ordre de programme, dépendances collectées.
- **D3 — Validation glslang en CI.** Script qui préfixe `#version 300 es` (glaze l'ajoute à l'exécution), compile le fragment avec `glslangValidator` (ou une version wasm) pour le fuzz. Couvre « le pilote accepte le shader » pour la syntaxe et les types, pas les caprices des pilotes.
- **D4 — Mesures de partage** (ex-MP3·S4) : comparer `none`/`shared`/`all` sur le même fuzz (longueur, sommets, variables, temps de `compile`) pour éclairer le défaut.

### Lot E — Inspecter une expression

- `nodeKey`/`equals`, `usedOperators`, `getNode`, `walk` + `Address` (`expression-spec §5–6`).
- Formule lisible en notation fonctionnelle automatique.
- Vue arbre, survol, aperçu d'une sous-expression compilée seule (**signaler** que l'aperçu ignore la déformation des ancêtres).
- Spec explorer `docs/explorer-spec.md`, courte, écrite à ce moment-là avec le vécu des lots B et C.

### Lot F — Persistance

- `serialize`/`deserialize` d'expression avec limites d'import (5 000 nœuds, profondeur 64), erreurs avec adresse.
- `artwork` : `createArtwork`, fichiers `.randomart.json`, bornes, champs inconnus refusés, `checkProvenance`.
- Import/export d'œuvres dans l'UI.

### Lot G — Glaze, rendu épaissi

Seulement si le besoin se confirme en jouant. `RenderTarget` + `readPixels`, `Program.render(target?)`, résolution réduite pendant l'animation, export HD à taille arbitraire, tests navigateur (réévaluer alors la friction 1). Plus tard : compilation asynchrone, export par tuiles, post-traitement.

### Lot H — Calibration (atelier ouvert)

Poids par défaut, contraintes, durée de boucle, répartition du budget du générateur (préférence légère pour les derniers enfants). Sessions libres, déclenchées par une friction.

## Dépendances

```
A ──► B1 ──► B2 ──► B3 ──► B4
              └──────────► B5
C : indépendant (après A)
D : indépendant (D4 après D1)
E : après B (spec explorer) ; F : après E (nodeKey) pour provenance
G : à la demande
```

## Points de friction connus

1. **Tests navigateur** : requis par D31 sur le papier, coûteux en pratique. Remplacés pour l'instant par le lot D ; à réévaluer au lot G.
2. **Découpage de fichiers** : commencer simple, scinder sur friction réelle.
3. **`shared`** : local à randomart tant qu'aucun autre projet n'en a besoin.
4. **Glaze comme socle GPU** : entrée du fragment = `vUv` (conversion `v_p` au début de `main`) ; pas de `readPixels` en v1 (capture du canvas, `preserveDrawingBuffer`).
5. **Phase** : `Clock` timed + loop de glaze via `ClockStore` ; `u_phase = calculatePhase(clock.progress)`. Remplace `phaseAt` de la spec renderer.
6. **Calibration** : valeurs de départ arbitraires (lot H).
7. **Aperçu de sous-expression** : ignore la déformation des ancêtres, à afficher dans l'UI.
8. **Taille de rendu = taille du canvas** jusqu'au lot G.
9. **Un seul shader** (tranché) : plus de mode Static/Animated, qui produisait deux expressions différentes pour une même seed. La grammaire par défaut inclut `tsin`/`tcos` ; l'animation relève de la lecture (horloge en pause à la phase 0). La grammaire passera dans le store au lot B1 pour composer avec la randomisation. Conséquence assumée : à la phase 0, `tsin` vaut 0 et `tcos` vaut 1, et les terminaux de temps (2/9 du poids des terminaux) diluent un peu `x` et `y` par rapport à `staticGrammar`.
10. **Échecs de génération/compilation dans l'UI** (nouveau) : `regenerate` peut en théorie lever (`MAX_SOURCE_LENGTH`) ; chaque action doit conserver l'état précédent et afficher l'erreur.

## Docs à amender (au fil de l'eau)

- `docs/README.md` : fait par `revue-docs.patch`.
- `compiler-spec §4` : remplacer « l'entrée `in vec2 v_p;` … `[-1, 1]²` » par « l'entrée `in vec2 vUv;` (`[0, 1]²`, fournie par glaze) est convertie en tête de `main` par `vec2 v_p = vUv * 2.0 - 1.0;` ; `v_p` est dans `[-1, 1]²` ».
- `compiler-spec §5.4` : pas de `#version` (glaze l'ajoute) ; `const float PI = 3.141592653589793;` au lieu de `#define PI` ; `u_phase` toujours déclaré ; `in vec2 vUv;` au lieu de `in vec2 v_p;`.
- `compiler-spec §8` : « `warp` n'est pas encore dans le catalogue » est périmé.
- `renderer-spec §7` et `§13`, `architecture D36` : marquer comme révisés (glaze, `Clock`).

## Rituel de fin de session

1. `vp check --fix` et `vp test` verts.
2. Mettre à jour « État courant » et « Prochaine action ».
3. Noter toute friction tranchée dans la liste ci-dessus.
4. Commit : le repo est la source de vérité, pas ce plan.
