# task-59 — Sequencer : une seule source de vérité pour les paramètres

- Fichiers : `packages/sequencer/src/core/layers/*.ts` (10 fichiers) + `modules/fourier/drawFourierEpicycles.ts`
- Statut : `done`
- Catégorie : `refactor`
- Origine : `task-15` à `task-25`

## Choix retenu : option A (helper partagé)

Création de `packages/sequencer/src/core/param.ts` avec `readParam(descriptor, raw)` :

- lit un `Record<string, unknown>` brut,
- applique un garde `typeof` adapté au type déclaré du descripteur,
- retourne le `default` du descripteur quand la valeur est absente ou de type incompatible,
- une seule suppression `as` centralisée (justifiée par le narrowing sur `descriptor.type`).

Chaque layer extrait désormais ses descripteurs dans une `const ...Params` nommée (`as const`) et appelle `readParam` à la place des `typeof params.x === 'number' ? params.x : <dur>` en dur.

## Fichiers convertis (11)

`core/layers/drawBarChart.ts`, `drawBaseline.ts`, `drawConnectionLines.ts`, `drawFactorWaves.ts`, `drawMountain.ts`, `drawPlottedNumbers.ts`, `drawRadialSpokes.ts`, `drawRecamanArcs.ts`, `drawStemPlot.ts` + `modules/fourier/drawFourierEpicycles.ts`. Le nouveau fichier `core/param.ts` contient l'unique logique de lecture.

## Preuves

- `vp -C packages/sequencer test` : vert.
- `vp -C packages/sequencer check --no-fmt --deny-warnings` : 0 warning / 0 erreur.
- `git diff` revu : pas de config modifiée, pas de test modifié, pas de changement de comportement (les valeurs par défaut sont identiques).

## Suppressions restantes

Une seule suppression `as` dans `core/param.ts` (cast du résultat typé par `ParamValue<D>`), justifiée par le garde `typeof` sur `descriptor.type`.
