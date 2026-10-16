# Handoff — politique throw vs repair + dissolution de la doc (randomart)

## Contexte

Session précédente (1) : branded types façon glaze, commités en `b866126` — 222 tests verts.
Décisions d'implémentation et IDs F01–F30 : `packages/randomart/docs/findings.md` **§7** (à
lire en premier). Ce qui existe : `Brand` re-exporté de glaze (`src/core/shared/index.ts`,
préfixe de messages `Randomart:`), `Phase`/`createPhase` (ex-`calculatePhase`),
`RenderKey` entièrement brandé, `Constraints = Brand<ConstraintsInput, 'Constraints'>`
(`createConstraints`, `fitConstraints` = slot ZoomClamp, brut → brandé), `RenderSettings`
idem (`createRenderSettings`).

Session précédente (2), juste après : **le nettoyage de doc est fait**. La doc de conception
(`packages/randomart/docs/*.md`) est **dépréciée** — décision tranchée par l'utilisateur :
sa doctrine est absorbée **dans les commentaires du code**, au fur et à mesure des
modifications. `docs/README.md` porte la bannière ; `revue.md` est supprimé ; les passages
des specs qui mentaient sur les types (`Constraints`, `RenderSettings`, `calculatePhase`)
ont été corrigés chirurgicalement. `PLAN.md` fait foi sur l'état ; `findings.md` sur le
système de types.

## Objectif — politique « réparer plutôt que throw »

Observation (utilisateur) : `createConstraints` throw sur `minDepth > maxDepth` alors que
réparer est peut-être plus adapté (p. ex. les rendre égales). Étendre l'audit à **toutes les
factories / points d'entrée** de randomart, pas seulement `Constraints`.

Pistes de sites (non exhaustif) :

- `src/core/grammar/grammar.ts` — `createConstraints` (`minDepth > maxDepth`),
  `createGrammar` règles 3/5/7 (vocabulaire sans terminal / sans non-terminal / infaisable),
  `fitConstraints` (répare déjà tout — voir F12 : NaN → min silencieux, à questionner).
- `src/core/random/seed.ts` (`createSeed` throw hors [0, 2³²−1]), `rng.ts` (`int`,
  `weighted`).
- `src/core/artwork/create.ts` — `createRenderSettings` (bornes), `createArtwork` (titre,
  expression « duck-typed »).
- Pairages corrélés notés dans findings : F21 (double validation UI, fallback `1` arbitraire
  dans `Controls.tsx`), F22 (règle minDepth/maxDepth dans `appStore` _en plus_ de
  `fitConstraints`), F19 (deux jeux de bornes pour la durée de boucle).

Frame de travail (à confirmer ou infirmer en tranchant) : les invariants de configuration /
erreurs de programmation throw (`ZoomBounds` côté glaze) ; les données runtime / UI se
réparent via une fonction de clamp dédiée qui rend du brandé (`ZoomClamp`). Être **explicite
site par site** : un tableau site → throw | repair (et comment) rédigé avant de coder, avec
les arguments dans le commentaire du site concerné — pas dans un document séparé
(dissolution de la doc ci-dessous).

Pièges : si `createConstraints` répare, `createGrammar` reste correct (les règles 5/7
peuvent devenir des repairs — par exemple faire monter `maxNodes` vers `minSize`, comme le
fait `fitConstraints`) ; les tests actuels attendent des throw → ils seront réécrits
(consigne permanente : on ne déforme pas les types/intégrations pour satisfaire les tests
existants) ; rien ne throw par frame sans décision (F09b) ; `Clock.progress` ∈ [0, 1]
inclusif (F26).

## Règle à appliquer dans le même temps (dissolution de la doc)

Chaque fois qu'un invariant documenté dans une spec `docs/*.md` est modifié, précisé ou
tranché par l'implémentation, le déplacer **dans les commentaires du code** correspondants,
et ne pas s'appuyer sur la spec. Ne pas écrire de nouveau document de conception.
`findings.md` est la dernière exception — et il s'effacera aussi quand son contenu aura été
intégré au code.

## Hors scope

Brander `rng.int`, `Channel`, `Address` (décision prise, checklist §14) ; F14/F15
(marque-vs-duck-typing dans `createExpression`/`nodeCount`) restent hors du champ.

## Lecture à faire avant de coder

1. `packages/randomart/docs/findings.md` §7 (état exact), F12/F19/F21/F22/F09b.
2. `packages/randomart/PLAN.md` — « État courant », « Prochaine action », frictions.
3. `codex/docs/conventions/08-decisions-and-checklist.md` §13 (règles de décision) et §14,
   rubrique Errors (« Is the failure model honest? », « Could an invalid state be prevented
   rather than detected later? »).
4. Équivalent glaze : `packages/glaze/src/core/cameraTypes.ts` (`createZoomBounds` throw,
   `createZoomClamp` répare), `src/core/brands.ts`, `src/core/render.ts`.

## Vérification

`vp check --fix` (racine) puis `vp -C packages/randomart test`. Langue : français pour la
discussion, anglais pour le code et les commentaires.

## État

Rien n'est commencé sur l'objectif. Le répertoire est vert, commit de nettoyage doc juste
après `b866126` (celui de cette session). Une session peut suffire : audit (tableau) →
décision → implémentation → tests réécrits → commit + mise à jour « État courant » du
`PLAN.md` (rituel de fin de session).
