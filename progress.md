# Progression — assainissement des assertions de type

## Décisions de session

- **Périmètre** : code de production uniquement. Les tests sont exclus par l’override
  `vite.config.ts:383` (commit `29f6c6a`), qui doit rester en place.
- **Règle** : maintenue à `warn` ; objectif 0 warning en production.
- **Vérification** : `vp check --no-fmt --deny-warnings` pendant la boucle, `vp check
  --deny-warnings` à la fin (format inclus).
- **Formatage** : les docs du protocole ont été formatés pour que le check complet passe.

## État au 7 novembre 2026

| Indicateur          | Valeur                      |
| ------------------- | --------------------------- |
| Baseline production | 88 warnings / 46 fichiers   |
| Corrigés            | 88 warnings / 46 fichiers   |
| Restants            | **0 warnings / 0 fichiers** |
| Tests (hors scope)  | 33 warnings / 7 fichiers    |

Dernière vérification : `vp check --no-fmt --deny-warnings` → aucun warning de la règle (après
les corrections de `pixel`, `three-stage` et `new-mini-app`, tasks 46 à 50 et 53).

> ℹ️ Le scratch `packages/ui/src/__scratch.ts` (non suivi) testait
> `CSSProperties & { '--panel-height'?: string }` et provoquait une erreur `TS2353`. Son pattern
> est intégré à `task-51` ; le fichier a été déplacé dans `/tmp/opencode/pg_lab__scratch.ts`.

## Légende

- `pending` : à traiter.
- `done` : corrigé et vérifié.
- Catégories : `keys`, `inference`, `guard`, `boundary`, `brand`, `signature`, `review`,
  `refactor` (voir `context.md`).

## Tâches warnings (bloquantes pour la clôture)

- task-01.md | packages/glaze/src/core/FrameLoop.ts | 1 | done | brand
- task-02.md | packages/glaze/src/core/InputStore.ts | 9 | done | brand + 9 suppressions ; consolider dans task-55
- task-04.md | packages/glaze/src/core/render.ts | 1 | done | brand
- task-05.md | packages/glaze/src/core/time.ts | 4 | done | brand
- task-09.md | packages/glaze/src/gpu/shader/compileProgram.ts | 1 | done | boundary ; guard possible dans task-57
- task-10.md | packages/glaze/src/react/clockStore.ts | 1 | done | contract ; null-object à revoir dans task-56
- task-11.md | packages/glaze/src/react/surfaceStack.ts | 1 | done | brand
- task-13.md | packages/glaze3d/src/controls/orbit.ts | 2 | done | guard ; comportement modifié, revue task-54
- task-15.md | packages/sequencer/src/components/layers/LayerOptionSection.tsx | 3 | done | guard
- task-16.md | packages/sequencer/src/core/layers/drawBarChart.ts | 2 | done | guard
- task-17.md | packages/sequencer/src/core/layers/drawBaseline.ts | 3 | done | guard
- task-18.md | packages/sequencer/src/core/layers/drawConnectionLines.ts | 3 | done | guard
- task-19.md | packages/sequencer/src/core/layers/drawFactorWaves.ts | 2 | done | guard
- task-20.md | packages/sequencer/src/core/layers/drawMountain.ts | 1 | done | guard
- task-21.md | packages/sequencer/src/core/layers/drawPlottedNumbers.ts | 3 | done | guard
- task-22.md | packages/sequencer/src/core/layers/drawRadialSpokes.ts | 5 | done | guard
- task-23.md | packages/sequencer/src/core/layers/drawRecamanArcs.ts | 3 | done | guard
- task-24.md | packages/sequencer/src/core/layers/drawStemPlot.ts | 4 | done | guard
- task-25.md | packages/sequencer/src/modules/fourier/drawFourierEpicycles.ts | 2 | done | guard
- task-26.md | packages/randomart-core/src/colors.ts | 1 | done | guard (`isColorSpaceId`)
- task-27.md | packages/randomart-core/src/grammar.ts | 2 | done | guard (`isOpName`, `isGrammarRegistryId`)
- task-28.md | packages/randomart-core/src/ops.ts | 1 | done | guard (`isOpName`)
- task-29.md | packages/randomart-core/src/seed.ts | 2 | done | brand ; suppression unique `seed.ts:19` (`brandSeed`)
- task-30.md | packages/randomart-core/src/tree.ts | 1 | done | guard (`isValidParam`)
- task-31.md | apps/brouillon/src/App.tsx | 5 | done | inference (options typées + génériques explicites)
- task-32.md | apps/playground/src/components/home/Controls.tsx | 1 | done | keys (`typedKeys` du package)
- task-33.md | apps/playground/src/experiments.ts | 1 | done | keys (`typedKeys` du package)
- task-34.md | packages/art-canvas/src/components/Controls.tsx | 1 | done | keys (`experimentKeys`)
- task-35.md | packages/art-canvas/src/experiments.ts | 1 | done | guard (`Object.hasOwn`)
- task-36.md | packages/fracture/src/components/Controls.tsx | 1 | done | keys (`experimentKeys`)
- task-37.md | packages/fracture/src/experiments.ts | 1 | done | guard (`Object.hasOwn`)
- task-39.md | packages/mosaic-maker/src/components/controls/TileSetControls.tsx | 1 | done | signature (`CssVars` + `Record`)
- task-40.md | packages/mosaic-maker/src/utils/palettes/fetchPalettes.ts | 2 | done | boundary (schéma zod du cache) + signature (littéral `Palette`)
- task-41.md | packages/mosaic-maker/src/utils/random/shuffleObject.ts | 1 | done | signature (`Record<string, Value>`)
- task-42.md | packages/notebook/src/components/Controls.tsx | 1 | done | inference (options typées + `Segmented<NoteSlug>`)
- task-43.md | packages/palette/src/components/Controls.tsx | 2 | done | guard (`isColorSpacesKey`, `isRuleKey`)
- task-44.md | packages/palette/src/components/color-picker/colorSpaceCanvas.worker.ts | 1 | done | boundary ; suppression unique `colorSpaceCanvas.worker.ts:11`
- task-45.md | packages/palette/src/components/color-picker/colorSpaceCanvasPool.ts | 1 | done | boundary (garde `isColorSpaceCanvasResponse`)
- task-46.md | packages/pixel/src/docs/components/Controls.tsx | 2 | done | signature (`EndpointItem` discriminée)
- task-47.md | packages/pixel/src/processor/neighborhood-tiling.ts | 1 | done | signature (`NeighborhoodManipulationDefinition`)
- task-48.md | packages/pixel/src/worker/process-image-in-worker.ts | 1 | done | guard (`typeof event.data.error`)
- task-49.md | packages/pixel/src/worker/serialization.ts | 1 | done | guard (narrowing par `in`)
- task-50.md | packages/three-stage/src/components/GetStarted/Root.tsx | 2 | done | boundary (`isPresetName`)
- task-51.md | packages/ui/src/components/ExperimentShell.tsx | 1 | done | signature (`PanelStyle`)
- task-52.md | packages/ui/src/components/Select.tsx | 1 | done | boundary (`findSelected`, plus de cast)
- task-53.md | tools/new-mini-app/bin/index.ts | 1 | done | boundary ; suppression unique `tools/new-mini-app/bin/index.ts:11`

## Tâches de suivi (non bloquantes)

- task-54.md | Revue de `orbit.ts` : le correctif a changé le comportement et les tests | done | review ; nouveau comportement conservé (domElement + setPointerCapture), try/catch restauré, test d'erreur de capture ajouté
- task-55.md | `InputStore.ts` : helper `bind` pour réduire 9 suppressions à 1 | done | refactor ; helper `bindEntry`, 1 suppression restante (cast handler → EventListener), le cast `AttachedHandle` (branding) est conservé
- task-56.md | `clockStore.ts` : remplacer `null as unknown as Clock` par un contrat honnête | done | refactor ; `NullClock extends Clock` (no-op, temps à zéro), plus de cast
- task-57.md | `compileProgram.ts` : garde `typeof` au lieu d’une suppression | done | refactor
- task-58.md | `typedKeys` : 2 copies volontaires et documentées (packages/randomart-ui + apps/playground), pas de helper partagé | done | refactor ; chaque package garde sa propre copie pour rester indépendant, cast `as (keyof T)[]` justifié par garde logique + commentaire
- task-59.md | Sequencer : typer les params de layer ou helper unique, au lieu de dupliquer les defaults | done | refactor ; option A : helper readParam (core/param.ts) lit le default du descripteur + garde typeof unique, 12 layers convertis, 1 seule suppression as centralisée
- task-60.md | `WorkerPool` : `deserialize` en `MessageEvent` (bare) + gardes runtime, plus de `TResponse` | done | refactor ; 3e paramètre générique retiré, casts `event.data as …` supprimés, fichiers repro* supprimés

## Mise à jour

- Une tâche terminée passe de `pending` à `done` et reçoit une note (pattern + suppression
  éventuelle).
- Les tâches de suivi ne bloquent pas la clôture d’une session ; elles se traitent après les 36
  warnings ou lors d’une session dédiée.
- Ne pas ajouter de nouvelle copie de `typedKeys` : utiliser le helper partagé ou attendre
  `task-58`.

## État de clôture

Warnings de production restants : **0 / 0 fichiers**.

- Toutes les tâches warnings (tasks 01 à 53, hors files sans warning) sont terminées.
- L’override de `vite.config.ts` pour les tests reste intact ; les 33 warnings de test sont hors
  scope.
- Les tâches de suivi 54 et 59 restent ouvertes et ne bloquent pas la clôture. (55, 56, 58 et 60 sont terminées.)

### Suppressions restantes en production

22 suppressions ciblées subsistent, chacune limitée à un point non sûr unique :

- **Branding nominal** : `packages/glaze/src/core/FrameLoop.ts:19` (`FrameToken`),
  `packages/glaze/src/core/time.ts:20,28,40,48` (`DurationSeconds`, `Seconds`,
  `NonNegativeSeconds`, `Milliseconds`), `packages/glaze/src/core/render.ts:28` (`StateData`),
  `packages/glaze/src/core/InputStore.ts:152` (`AttachedHandle`),
  `packages/glaze/src/react/surfaceStack.ts:42` (`Compact<T>`) et
  `packages/randomart-core/src/seed.ts:19` (`Seed`). Les invariants sont établis avant le cast.
- **Frontière DOM** : `packages/glaze/src/core/InputStore.ts:62` (1 cast de handler typé vers
  `EventListener`, centralisé dans le helper `bindEntry`) et
  `packages/palette/src/components/color-picker/colorSpaceCanvas.worker.ts:11` (`self` dans un
  worker dédié).
- **Clés d’objets littéraux internes** :
  `apps/playground/src/utils/object.ts:3` et `packages/randomart-ui/src/utils/object.ts:3`
  (`typedKeys`).
- **Frontière de librairie** : `tools/new-mini-app/bin/index.ts:11` (le `Template` local, créé par
  `createTemplate`, est passé au type de base incompatible de `bingo`).
- (task-56 résolu : `NullClock extends Clock` dans `core/Clock.ts`, `clockStore.ts` sans cast.)

Aucune suppression de propriété CSS custom ne subsiste.

## Journal

- **2026-11-07** (session 2) : tasks 26 à 45 traitées (27 warnings, 19 fichiers). Patterns :
  `Object.keys(...).filter(isXKey)` pour les clés d’objets littéraux internes, `as const satisfies`
    - générique explicite pour les composants UI, schéma zod pour le cache `localStorage`, garde
      `isColorSpaceCanvasResponse` pour la réponse du worker, `Record<string, Value>` pour
      `shuffleObject`, `CssVars` (`Record<`--${string}`, …>`) pour les custom properties CSS.
      Reste 8 warnings de production (tasks 46-50, 53). L’override de test de `vite.config.ts` avait
      été supprimé sans commit en début de session : restauré (décision utilisateur).
- **2026-11-07** : protocole révisé. Périmètre production confirmé, override tests conservé,
  task list reclassée (fin du fourre-tout “branding”), tâches de suivi ajoutées, docs formatés.
  `Select.tsx` corrigé entre-temps par `findSelected` (task-52), puis `ExperimentShell.tsx` par un
  type `PanelStyle` (task-51).
- **2026-11-07** (session 3) : tasks 46 à 50 et 53 traitées (8 warnings, 6 fichiers). Patterns :
  union discriminée `EndpointItem`, type `NeighborhoodManipulationDefinition`, narrowing par `typeof`
  et `in`, garde `isPresetName` à la frontière Leva, puis une suppression unique documentée à la
  frontière `bingo`. Zéro warning `typescript/no-unsafe-type-assertion` restant en production ;
  task-57 était déjà résolue par le garde `typeof` de `compileProgram.ts`.
