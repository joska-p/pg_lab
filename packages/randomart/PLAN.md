# PLAN — Random Art (fil de travail multisession)

Point d'entrée pour reprendre le travail. **Se met à jour à la fin de chaque session.**

## But

Un jouet personnel : un atelier d'art génératif où des expressions mathématiques produisent des
images abstraites, fixes ou animées, qu'on peut explorer, comprendre et conserver.
Le code doit rester **compréhensible** : chaque module une responsabilité, cœur TypeScript pur
sans GPU ni DOM, rendu isolé dans un **adaptateur mince sur `@repo/glaze`**. Les docs (`docs/`)
sont un **guide de travail**, pas une spec figée : la forme du projet s'adapte aux frictions
rencontrées. **D36 est révisée** : on ne réécrit pas un renderer WebGL brut, on réutilise glaze,
et glaze évolue pour répondre aux besoins réels de randomart (sans y ajouter de fonctionnalité
qu'aucune app n'utilise).

## État courant

- **Doc** : complète et relue (specs v0.1–v0.3, décisions D1–D39, tests requis).
- **Glaze** : **MP0 terminé.** `ShaderError` + `tryCreateProgram`, fuite des programmes corrigée,
  `GpuCanvas` qui garde le dernier bon programme (`onShaderError`, `vertexShader`),
  `contextOptions`, `Clock.setDuration`. Tests verts, apps existantes non régressées.
- **Randomart** : squelette React (`src/App.tsx`, `Scene`, `Controls`, `appStore`).
  **MP1·S1 terminé** : arborescence `src/core/*` et `src/renderer/`, `shared` local (`Brand`, `assertFinite`),
  module `random` (`Seed`, `createSeed`, `randomSeed`, `Rng`, `createRng` mulberry32, `next`/`int`/`weighted`).
  **MP1·S2 terminé** : chaîne pure minimale (`catalog` terminaux/arith/trigo/logique, `expression` nœuds immuables validés + métriques, `grammar` contraintes/règles 1-8/minSize/`staticGrammar`/`animatedGrammar`, `generator` budget réel/déterminisme/`GENERATOR_VERSION`). 55 tests unitaires verts avec snapshots sur seeds fixes.
  **MP1·S3 terminé** : adaptateur renderer (`RandomArtCanvas`, `contract`), contrat GLSL fixé (`in vec2 vUv`, `out vec4 o_color`, `vec2 v_p = vUv * 2.0 - 1.0;`), shader de test à la main dégradé `x`/`y`/`u_phase`, temps bouclé 8s (`u_phase = progress % 1`), store UI relié à `ClockStore` et `onShaderError`, `contextOptions` transmis via glaze. 67 tests unitaires randomart verts (220 tests monorepo).
- **Infra** : `strict: true` activé dans `tsconfig.app` (voir friction 10). Tests opérationnels via `vp test`.
- **Plan** : temps via `Clock`/`ClockStore` ; compilateur scindé ; tests navigateur reportés.

## Prochaine action

**MP1·S4** — Compilateur naïf + branchement. Compilation inline des trois arbres, préambule minimal (`PI`, `u_phase`, `vUv`). Brancher generate → compile → `GpuCanvas` ; erreur affichée, image précédente conservée. Première image à l'écran.

## Comment utiliser ce plan

- **Mini-projet (MP)** = un livrable cohérent, vérifiable (`vp check --fix` + `vp test` verts).
- **Session** = une séance qui laisse le repo vert et commitable, et met à jour « État courant ».
- L'ordre est une **guidance, pas un contrat** : MP et sessions peuvent être réordonnés, fusionnés,
  scindés ou abandonnés.
- **N'implémenter un morceau de spec que quand on en a besoin** (`nodeKey`, `serialize`,
  `artwork`… viennent après la première image).
- Les frictions rencontrées sont tranchées sur place et notées en bas.

## Dépendances (qui doit précéder qui)

```
glaze (MP0) ─────────────────────────────► rendu (MP1·S3)

shared ──► random ──► grammar ──► generator ──┐
   │              │                             ├─► compilateur ─► rendu ─► UI
   └──────────────┴─► catalog ──► expression ──┘        │
                                                     artwork
```

- `random`, `catalog`, `shared` sont indépendants du reste.
- `artwork` est de la donnée pure, écrite à tout moment après `expression` + `grammar`.

---

## MP0 — Glaze : usage sans friction ✅ terminé

_Petit et ciblé : uniquement ce qu'il faut pour qu'un shader aléatoire refusé par le pilote ne
casse ni l'app ni la mémoire. Utile à toute app glaze qui recharge des shaders._

- **S1 — Erreurs et cycle de vie des programmes.**
    - `ShaderError extends Error` avec `stage: 'compile' | 'link'` et le journal du pilote, levée
      par `compileProgram` (le message actuel est conservé : rien ne casse).
    - `surface.tryCreateProgram(src, vertex?)` → `{ ok: true, program } | { ok: false, error }`.
      N'attrape **que** `ShaderError` ; tout le reste (WebGL absent, bug) continue de lever.
    - **Fuite** : `Program.destroy()` doit se retirer du `Set` de la surface (hook `onDestroy`
      fourni à la création, ou `surface.destroyProgram(p)`). Aujourd'hui chaque shader reste
      référencé, avec son source, jusqu'au `destroy` de la surface.
    - Tests unitaires avec un mock GL (modèle : `StateBuffer.test.ts`) : échec compile, échec link,
      erreur non-shader relancée, programme détruit retiré de la surface.
- **S2 — `GpuCanvas` et options.**
    - `GpuCanvas` compile le nouveau `fragmentShader` avec `tryCreateProgram` ; succès → swap puis
      destruction de l'ancien ; échec → **l'ancien est conservé** et `onShaderError(error | null)`
      est appelé (`null` après un succès).
    - Prop `vertexShader` (transmise à `tryCreateProgram`). Documenter : le vertex doit utiliser
      `gl_VertexID` (`Program.render` fait `drawArrays(TRIANGLES, 0, 3)` sans attributs).
    - `contextOptions?: WebGLContextAttributes` dans `GpuSurfaceConfig` et `GpuCanvasProps`
      (défauts actuels conservés). randomart : `antialias: false`, `preserveDrawingBuffer: true`.
    - `Clock.setDuration(d)` (+ `ClockStore.setDuration`) : **conserve la progression**
      (`time = progress × nouvelleDurée`), sinon l'image saute à chaque changement.
    - Tests : conservation de la progression, swap/rollback de programme (logique pure extraite
      si le test du composant est trop lourd).

_Fin de MP0 : glaze fait tout ce dont randomart a besoin pour MP1. Rien de plus._

## MP1 — Squelette vertical « première image »

_La chaîne complète, mince mais réelle. On garde dès le départ ce qui coûte cher à corriger
plus tard (déterminisme, `GENERATOR_VERSION`). On triche volontairement sur ce qui se
remplacera proprement ensuite._

| Élément du squelette                                   | Statut lors du durcissement                                      |
| ------------------------------------------------------ | ---------------------------------------------------------------- |
| `random`, `expression`, `generator`, `grammar` (forme) | **gardés** (complétés)                                           |
| rendu (adaptateur sur glaze)                           | **gardé** : `GpuCanvas` + `Clock`/`ClockStore`, adaptateur mince |
| `catalog`                                              | gardé, complété (validations, `dependencyClosure`)               |
| compilateur naïf (inline, sans contextes)              | **remplacé** par le compilateur complet (MP3) — vaut `none`      |

- **S1 — Infra + `shared` + `random`.** ✅ **terminé.**
  Arborescence : `src/core/{shared,random,catalog,expression,grammar,generator,compiler}` + `src/renderer/`.
  `shared` local (`Brand`, `assertFinite`). `Seed`, `createRng` (mulberry32), `next`/`int`/`weighted`.
  Tests : déterminisme, plages, rejets. Tests unitaires passants via `vp -C packages/randomart test`.
- **S2 — La chaîne pure minimale.** ✅ **terminé.** `catalog` (terminaux, arithmétique, trigo, logique ;
  **sans `warp`** ni portées `inner`), `expression` (modèle immuable + `createNode`), `grammar`
  (forme + `staticGrammar`), `generator` (budget réel, ordre de consommation,
  `GENERATOR_VERSION`). Attention : `minSize(d+1)` se calcule avec la plus petite arité du
  **vocabulaire**, pas celle de l'opérateur choisi. Tests : invariants + snapshot sur seeds fixes.
- **S3 — Rendu sur glaze, shader écrit à la main.** ✅ **terminé.** Prouver le GPU avant le compilateur, via
  `fragmentShader` + `onShaderError` (dégradé `x`/`y`). Fixer le **contrat d'entrée** :
  le compilateur émet `in vec2 vUv; out vec4 o_color;` et, **au début de `main`**,
  `vec2 v_p = vUv * 2.0 - 1.0;` (les formules du catalogue utilisent `v_p`, inchangées ; `y`
  vers le haut est déjà garanti). Pas de `#version` dans le source : glaze l'ajoute.
  Temps : `clockOptions = { mode: 'timed', duration, loop: true }`, `onClockStore` pour l'UI,
  `u_phase = surface.clock.progress % 1` dans le callback `uniforms` (le `% 1` car `progress`
  peut valoir 1 après un `seek` en fin de course ; le renderer exige `[0, 1)`).
  Vérification visuelle de l'orientation (pas de test navigateur).
- **S4 — Compilateur naïf + branchement.** Compilation inline des trois arbres, préambule
  minimal (`PI`, `u_phase`, `vUv`). Brancher generate → compile → `GpuCanvas` ; erreur affichée,
  image précédente conservée (gratuit grâce à MP0). **Première image à l'écran.**
- **S5 — Animer et jouer.** `tsin`/`tcos`, play/pause/reset via `ClockStore`, durée de boucle
  réglable (`setDuration`), seed, erreurs affichées, export PNG (`toBlob` : fiable grâce à
  `preserveDrawingBuffer`). Noter les frictions réelles.

_Fin de MP1 : on touche le jouet._

## MP2 — Durcir le cœur

_Compléter les modules purs avec validations, mesures et tests jusqu'aux specs, **au rythme des
besoins**._

- **S1 — `catalog` complet.** Validations de `defineOperator`/`createCatalog`,
  `dependencyClosure`, sondage des entrées. (`warp` + `ra_fold2` attendent MP3·S3.)
- **S2 — `expression` complet.** `nodeKey`/`equals`, metrics, `serialize`/`deserialize` + limites
  d'import. Tests spec §9.
- **S3 — `grammar` complet.** `createGrammar` (les 7 règles), `minSize`/faisabilité,
  sérialisation, `randomize*` + réparations.

## MP3 — Compilateur complet

_Le cœur conceptuel le plus dense, **pris en quatre temps, du plus simple au plus risqué**._

- **S1 — Abaissement sans contextes.** Sondage de multiplicité (D29), hash-consing (D22) dans le
  seul contexte racine, comptage des usages, `stats`. Tests ciblés sur le graphe de sommets.
- **S2 — Émission.** Atomes, littéraux, parenthésage, politiques `none`/`shared`/`all`,
  préambule (fermeture de dépendances), `compile()`, garde-fou `MAX_SOURCE_LENGTH`.
  Tests §8 (1, 2, 4–7).
- **S3 — Contextes et `warp`.** Contextes de coordonnées internés, `innerCoords`, `ra_fold2`,
  `warp` dans le catalogue. Transformateur fictif pour les tests (§8 : 3). C'est le plus gros
  risque : il arrive seulement quand le reste est stable.
- **S4 — Mesures.** Comparer les politiques sur de vraies expressions (source, sommets,
  variables, temps de compilation) pour éclairer le défaut. Fuzz « pur » (sans GPU) sur des
  milliers d'expressions.

## MP4 — Glaze : rendu épaissi (rendu HD, export)

_Ne démarre que si le besoin se confirme en jouant. Surtout du travail **dans glaze**, le
renderer randomart reste mince par-dessus._

- **S1 — Cibles de rendu.** `RenderTarget` générique (texture RGBA8 + FBO, `width`, `height`,
  `resize`, `destroy`, `readPixels()` avec lignes retournées). `Program.render(target?)` :
  viewport et `u_resolution` suivent la taille de la cible (aujourd'hui `viewport` = canvas).
  `surface.renderProgramTo(program, target)`.
- **S2 — Résolution et rendu à la demande.** `surface.setRenderScale(n)` (ou `dpr` mutable) pour
  réduire la résolution quand l'animation ne tient pas la cadence ; `surface.invalidate()` (ou
  flag `resized` dans `shouldRender`) pour qu'une image statique en veille survive à un
  redimensionnement.
- **S3 — Export HD et robustesse.** Export PNG à taille arbitraire via `RenderTarget` +
  `readPixels`, limite de taille, passe finale (`contain`/fond, point d'insertion du
  post-traitement), fuzz de rendu, **décision sur les tests navigateur** (voir friction 1).
- **Plus tard** : compilation asynchrone (`KHR_parallel_shader_compile`), export par tuiles.

## MP5 — Calibration et forme (atelier ouvert)

_Sessions libres, déclenchées par une friction, jamais par obligation._

Idées : calibrer poids/contraintes/`loopMs` par défaut en jouant (D34) ; mesurer le partage
`none`/`shared`/`all` à l'écran (D23) ; observer la répartition du budget (derniers enfants) ;
redécouper un module devenu illisible ; décider la « forme » de l'UI d'après MP1.

## MP6 — Artwork (persistance)

_Sauver et retrouver une œuvre. Donnée pure, indépendante du rendu._

- **S1 — Format.** `createArtwork`, `RenderSettings`/`Provenance`, `serializeArtwork`/
  `parseArtwork`, fichiers de grammaire, bornes, erreurs avec chemin du champ. Tests §8 (1–7, 9).
- **S2 — Provenance.** `checkProvenance`. Tests §8 (8). (À fusionner avec S1 si court.)

## MP7 — L'explorateur (UI complète)

_La spec s'écrit maintenant, éclairée par le vécu du squelette — pas avant._

- **S0 — Spec explorer v0.1.** `docs/explorer-spec.md`, courte, en respectant les contraintes du
  README (l'UI possède le temps via `ClockStore`, erreur affichée + image conservée,
  « animer » = ajouter `tsin`/`tcos`, seed via `randomSeed`, inspecteur = notation
  fonctionnelle). Galerie/historique/randomisation restent des questions ouvertes.
- **S1 — Inspection.** Vue arbre, adresses, survol, aperçu d'une sous-expression compilée seule
  (**signaler** que l'aperçu ignore la déformation des ancêtres), stats du compilateur.
- **S2 — Persistance dans l'UI.** Import/export d'œuvres et de grammaires, provenance, titre.
- **S3 — Exploration.** `randomize*` dans l'UI, historique, calibration interactive.

---

## Points de friction connus (à trancher en route)

1. **Tests navigateur** : la doc les déclare requis (D31, pas d'évaluateur CPU), mais le coût
   (`@vitest/browser-playwright`, Chromium headless, SwiftShader en CI) est lourd pour un jouet.
   **Décision actuelle : reportés.** MP1 = vérification visuelle manuelle, plus les tests purs
   (random, generator, snapshots du compilateur). À réévaluer en MP4·S3, avec au minimum un test
   d'orientation, et le test de plage des opérateurs si on veut garder la garantie de D31.
2. **Découpage de fichiers** : les specs proposent des arborescences détaillées qui contredisent
   la convention du repo (un fichier par défaut). **Commencer simple, scinder sur friction
   réelle.**
3. **`shared`** : local à randomart d'abord ; package du monorepo seulement si un autre projet
   en a besoin.
4. **Glaze comme socle GPU (D36 révisée)** : on réutilise `GpuCanvas`/`GpuSurface`/`Program`/
   `Clock`. Écarts avec la spec et leur résolution :
   (a) entrée du fragment = `vUv`, pas `v_p` → `vec2 v_p = vUv*2.0-1.0;` au début de `main`
   (spec compilateur §4 à amender) ;
   (b) glaze jetait à la compile/link et détruisait l'ancien programme → **MP0** : `ShaderError`,
   `tryCreateProgram`, `GpuCanvas` qui garde le dernier bon programme + `onShaderError` ;
   (c) pas de `readPixels`/export HD → capture canvas en v1 (`preserveDrawingBuffer`), cibles de
   rendu en **MP4**.
5. **Phase / lecture** : **tranché** — `Clock` timed + loop de glaze, piloté par `ClockStore`
   (play/pause/reset/vitesse). `u_phase = surface.clock.progress % 1` dans `uniforms`. Ajout
   nécessaire : `Clock.setDuration` qui conserve la progression (MP0·S2). Remplace
   `phaseAt(elapsedMs, periodMs)` de la spec renderer.
6. **Calibration** (poids, contraintes, `loopMs`, politique de partage) : valeurs de départ
   arbitraires, à ajuster en MP5 en jouant.
7. **Limite connue** : l'aperçu d'une sous-expression ignore la déformation de ses ancêtres —
   à afficher clairement dans l'UI (compilateur §9).
8. **Taille de rendu vs canvas** : en MP1 le rendu se fait directement au canvas (taille CSS ×
   dpr, équivalent de `stretch`). La `RenderSize` indépendante de la spec renderer n'arrive
   qu'avec MP4.
9. **Docs à amender** (au fil de l'eau, pas en bloc) : D36 (architecture), renderer-spec §13
   et §7 (phase), compiler-spec §4 (contrat `vUv`).

## Rituel de fin de session

1. `vp check --fix` et `vp test` verts.
2. Mettre à jour « État courant » et « Prochaine action » en haut de ce fichier.
3. Noter toute friction tranchée dans la liste ci-dessus (ou la créer).
4. Commit : le repo est la source de vérité, pas ce plan.
