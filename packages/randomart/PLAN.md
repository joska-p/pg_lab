# PLAN — Random Art (fil de travail multisession)

Point d'entrée pour reprendre le travail. **Se met à jour à la fin de chaque session.**

## But

Un jouet personnel : un atelier d'art génératif où des expressions mathématiques produisent des
images abstraites, fixes ou animées, qu'on peut explorer, comprendre et conserver.
Le code doit rester **compréhensible** : chaque module une responsabilité, cœur TypeScript pur
sans GPU ni DOM, rendu isolé dans un **adaptateur mince sur `@repo/glaze`** (comme les autres
apps du monorepo). Les docs (`docs/`) sont un **guide de travail**, pas une spec figée — la
forme du projet s'adapte aux frictions rencontrées. **D36 tombe** : on ne réécrit pas un renderer
WebGL brut, on réutilise glaze.

## État courant

- **Doc** : complète et relue (specs v0.1–v0.3, décisions D1–D39, tests requis).
- **Code** : squelette React uniquement (`src/App.tsx`, `Scene`, `Controls`, `appStore`).
  `Scene` utilise déjà `GpuCanvas` d'`@repo/glaze` — c'est le bon socle, on va le brancher
  sérieusement (l'app ne fait encore rien avec).
- **Infra** : aucune infra de test (`vp test` = Vitest, à configurer). Aucun module du cœur.
- **Démarrage retenu** : squelette vertical d'abord (pixels rapides), durcissement ensuite.
  La variante bottom-up des specs reste documentée plus bas.

## Prochaine action

**MP1·S1** — infra de test + `shared` + `random`. Objectif du mini-projet : une image générée à
l'écran en ~5 séances.

## Comment utiliser ce plan

- **Mini-projet (MP)** = un livrable cohérent, vérifiable (`vp check --fix` + `vp test` verts).
- **Session** = une séance de travail qui laisse le repo vert et commitable, et qui met à jour
  « État courant » en haut de ce fichier.
- L'ordre est une **guidance, pas un contrat**. Les MP peuvent être réordonnés, fusionnés,
  scindés ou abandonnés. Les sessions aussi.
- Les points de friction connus sont listés en bas : quand une session en découvre un, on le
  tranche sur place et on le note ici.

## Dépendances (qui doit précéder qui)

```
shared ──► random ──► grammar ──► generator ──┐
   │              │                             ├─► compilateur ─► renderer ─► UI
   └──────────────┴─► catalog ──► expression ──┘        │               │
                                                     artwork ◄────────┘
```

- `random`, `catalog`, `shared` sont indépendants du reste.
- `renderer` n'importe du compilateur que le **type** `CompiledShader`.
- `artwork` est de la donnée pure, indépendante du rendu — peut être écrit à tout moment
  après `expression` + `grammar`.

---

## Deux démarrages possibles

**Recommandé : squelette vertical (MP1).** On fait marcher toute la chaîne, mince mais réelle,
et on voit des images en ~5 séances. Les décisions de forme (boucle d'animation, erreurs,
confort d'exploration) ne se voient qu'à l'écran ; et le « compilateur naïf » du squelette est
exactement la politique `none` du vrai compilateur, donc rien n'est jeté.

**Variante : bottom-up des specs.** Construire chaque module complet et testé dans l'ordre des
specs, l'image arrive en dernier. Cohérent avec la doc, mais les abstractions denses du
compilateur (hash-consing, contextes) se construisent sans le retour d'expérience des pixels.
Si cette variante est préférée, réordonner : MP2 → MP3 → MP4 ci-dessous, avant MP1.

---

## MP1 — Squelette vertical « première image » (recommandé)

_La chaîne complète, mince mais réelle. On garde dès le départ ce qui coûte cher à corriger
plus tard (déterminisme, `GENERATOR_VERSION`). On triche volontairement sur ce qui se
remplacera proprement ensuite._

| Élément du squelette                                   | Statut lors du durcissement                                                                                                  |
| ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| `random`, `expression`, `generator`, `grammar` (forme) | **gardés** (complétés)                                                                                                       |
| rendu (adaptateur sur glaze)                           | **gardé** : `GpuCanvas` + `Program` + `Clock` fournissent compile/boucle/resize/perte de contexte ; l'adaptateur reste mince |
| `catalog`                                              | gardé, complété (`warp`, validations, `dependencyClosure`)                                                                   |
| compilateur naïf (inline)                              | **remplacé** par le compilateur complet (MP3) — il vaut la politique `none`                                                  |

- **S1 — Infra + `shared` + `random`.** Activer `vp test` (bloc `test` de `vite.config.ts`,
  premier test qui passe). Arborescence : `src/core/{shared,random,catalog,expression,grammar,
  generator,compiler}` + `src/renderer/`. `shared` local (type `Brand`, `assertFinite`).
  `Seed`, `createRng` (mulberry32), `next`/`int`/`weighted`. Tests : déterminisme, plages,
  rejets. Arbitrer l'approche des tests navigateur (voir « Points de friction », ne pas
  bloquer ici).
- **S2 — La chaîne pure minimale.** `catalog` (opérateurs de départ de la spec — terminaux,
  arithmétique, trigo, logique ; **sans `warp`** ni portées `inner`), `expression` (modèle
  immuable + `createNode`), `grammar` (forme + préréglage `staticGrammar`), `generator`
  (algorithme à budget réel, ordre de consommation, `GENERATOR_VERSION`).
  Tests : invariants du générateur (profondeur, vocabulaire, `maxNodes`) + snapshot sur seeds
  fixes. Peut se scinder en deux séances si c'est trop long.
- **S3 — Rendu sur glaze, shader écrit à la main.** Helpers purs (`phaseAt`, `containRect`) ;
  puis **prouver le GPU avec un fragment shader écrit à la main** passé à `GpuCanvas` (dégradé
  `x`/`y`, « comme mes autres apps ») avant que le compilateur existe : ça isole les inconnues.
  Trancher ici trois décisions de forme :
  (1) contrat d'entrée du compilateur : `in vec2 vUv` + variable dérivée `p = vUv*2.0-1.0`
  (les formules du catalogue utilisent `p.x`/`p.y`, inchangées) ;
  (2) sémantique `setShader` en résultat — gérer le programme sur la surface (pattern automa)
  plutôt que laisser `GpuCanvas` recompiler dans un effet (glaze jette à l'échec) ;
  (3) qui possède la phase : `Clock` de glaze (`mode: 'timed'`, `loop`, `progress` ≈ `[0,1)`)
  ou boucle maison — l'UI reste propriétaire du temps (D28).
  Premiers tests navigateur (orientation, phase).
- **S4 — Compilateur naïf + branchement.** Compilation inline des trois arbres (équivaut à la
  politique `none`, sans partage ni contextes), préambule minimal conforme au contrat glaze
  (`vUv`, `u_phase`, `PI`). Brancher generate → compile → `GpuCanvas` (uniforms fournissent
  `u_phase` ; erreur affichée, image précédente conservée). **Première image générée à l'écran.**
- **S5 — Animer et jouer.** `tsin`/`tcos` (ou déjà en S2), boucle `rAF` dans l'UI (D28),
  play/pause, seed, erreurs de shader affichées (image précédente conservée, D27), export PNG.
  On peut jouer. Noter les frictions réelles rencontrées.

_Fin de MP1 : on touche le jouet. Les modules purs sont minces mais honnêtes ; le rendu repose
sur glaze, prêt à être épaissi (passe hors-écran) si besoin._

## MP2 — Durcir le cœur

_Compléter les modules purs avec validations, mesures et tests jusqu'aux specs._

- **S1 — `catalog` complet.** Validations de `defineOperator`/`createCatalog`,
  `dependencyClosure`, `warp` + `ra_fold2`, sondage des entrées. Tests spec §9.
- **S2 — `expression` complet.** `nodeKey`/`equals`, metrics (`depth`, `nodeCount`,
  `usedOperators`, `getNode`, `walk`), `serialize`/`deserialize` + limites d'import. Tests §9.
- **S3 — `grammar` complet.** `createGrammar` (les 7 règles), `minSize`/faisabilité,
  sérialisation, `randomize*` (`weights`/`vocabulary`/`grammar`) + réparations.
  (Ces trois séances peuvent être fusionnées/séparées selon le rythme.)

## MP3 — Compilateur complet

_Le cœur conceptuel le plus dense, à prendre en deux temps._

- **S1 — Abaissement.** Sondage de multiplicité (D29), hash-consing (D22), contextes de
  coordonnées internés, comptage des usages, `stats`. Tests ciblés sur le graphe de sommets.
- **S2 — Émission.** Atomes, littéraux, parenthésage, politiques `none`/`shared`/`all`,
  préambule (fermeture de dépendances), `compile()`. `warp` devient compilable. Tests §8 (1–7)
  avec transformateur fictif.
- **S3 — Mesures.** Comparer les politiques sur de vraies expressions (source, sommets,
  variables) pour éclairer le choix du défaut. Fuzz « pur » sur des milliers d'expressions.

## MP4 — Épaissir le rendu (glaze)

_Le squelette rend à l'écran directement ; cette phase ajoute ce que seul le besoin réclame._

- **S1 — Passe hors-écran si le besoin se confirme.** Expression → texture via `StateBuffer`
  (pattern automa) + passe finale (`contain`/fond, point d'insertion du post-traitement),
  re-rendu paresseux. Sinon, garder cette capacité en réserve.
- **S2 — Sémantique et robustesse.** Mettre en forme le `setShader` en résultat (jamais
  d'exception, ancien programme conservé), limite de taille, fuzz de rendu (les mille shaders
  du compilateur), tests navigateur finaux, décision CI headless.
- **Export** : capture du canvas (`toBlob`) dès MP1·S5 ; `readPixels`/export haute résolution
  = un ajout à glaze (bénéfice partagé) à décider ici.

## MP5 — Calibration et forme (atelier ouvert)

_Sessions libres, déclenchées par une friction, jamais par obligation._

Idées : calibrer poids/contraintes par défaut en jouant (D34) ; mesurer le partage
`none`/`shared`/`all` à l'écran (D23) ; observer la répartition du budget (derniers enfants) ;
redécouper un module devenu illisible ; décider la « forme » de l'UI d'après MP1.

## MP6 — Artwork (persistance)

_Sauver et retrouver une œuvre. Donnée pure, indépendante du rendu._

- **S1 — Format.** `createArtwork`, `RenderSettings`/`Provenance`, `serializeArtwork`/
  `parseArtwork`, fichiers de grammaire, bornes, erreurs avec chemin du champ. Tests §8 (1–7, 9).
- **S2 — Provenance.** `checkProvenance` (`none`/`matches`/`differs`/`version-mismatch`).
  Tests §8 (8). (À fusionner avec S1 s'il est court.)

## MP7 — L'explorateur (UI complète)

_La spec s'écrit maintenant, éclairée par le vécu du squelette — pas avant._

- **S0 — Spec explorer v0.1.** Écrire `docs/explorer-spec.md` en respectant les contraintes
  du README (boucle d'animation dans l'UI, erreur affichée + image conservée, « animer » =
  ajouter `tsin`/`tcos`, seed via `randomSeed`, inspecteur = notation fonctionnelle). Courte ;
  galerie/historique/randomisation restent des questions ouvertes.
- **S1 — Inspection.** Vue arbre en notation fonctionnelle, adresses, survol, aperçu d'une
  sous-expression compilée seule (contexte racine — **signaler** que l'aperçu ignore la
  déformation des ancêtres), stats du compilateur.
- **S2 — Persistance dans l'UI.** Import/export d'œuvres et de grammaires, indicateur de
  provenance, titre.
- **S3 — Exploration.** `randomize*` dans l'UI, historique des œuvres, calibration interactive
  si le besoin se confirme.

---

## Points de friction connus (à trancher en route)

1. **Tests navigateur** : la doc les déclare requis (D31, pas d'évaluateur CPU). Coût réel :
   installer `@vitest/browser-playwright` + headless Chromium (SwiftShader pour WebGL en CI).
   Alternative jouet : vérification manuelle au début. Décision recommandée : trancher
   l'approche en **MP1·S1**, implémenter en **MP1·S3**.
2. **Découpage de fichiers** : les specs proposent des arborescences détaillées qui contredisent
   la convention du repo (un fichier par défaut). **Commencer simple, scinder sur friction
   réelle.**
3. **`shared`** : local à randomart d'abord ; package du monorepo seulement si un autre projet
   en a besoin.
4. **Glaze comme socle GPU (D36 révisée)** : on réutilise `GpuCanvas`/`GpuSurface`/`Program`/
   `Clock`/`StateBuffer` au lieu d'un renderer WebGL brut. Trois écarts actés avec glaze :
   (a) entrée du fragment shader = `vUv` (pas `v_p`) → `p = vUv*2.0-1.0` dans le préambule ;
   (b) glaze jette à la compile/link → notre adaptateur gère la sémantique résultat + image
   conservée (ne pas laisser `GpuCanvas` recompiler dans son effet) ;
   (c) pas de `readPixels`/export HD dans glaze → capture canvas en v1, ajout possible à glaze.
5. **Phase / lecture** : le `Clock` de glaze (`timed` + `loop`, `progress` ≙ `[0,1)`) peut
   fournir `u_phase` (l'UI reste propriétaire du temps via `clockStore`) — à trancher en MP1·S3.
6. **Calibration** (poids, contraintes, `loopMs`, politique de partage) : valeurs de départ
   arbitraires, à ajuster en MP5 en jouant.
7. **Limite connue** : l'aperçu d'une sous-expression ignore la déformation de ses ancêtres —
   à afficher clairement dans l'UI (compilateur §9).

## Rituel de fin de session

1. `vp check --fix` et `vp test` verts.
2. Mettre à jour « État courant » et « Prochaine action » en haut de ce fichier.
3. Noter toute friction tranchée dans la liste ci-dessus (ou la créer).
4. Commit : le repo est la source de vérité, pas ce plan.
