# Handoff — branded types dans randomart (glaze → randomart)

## Contexte

Session précedente : audit du système de types garantis de glaze (`Brand<T, B>` + factories
`createX()` qui valident avant de caster) et évaluation de son application à `packages/randomart`.
Aucun code modifié ; tous les constats sont écrits dans
`packages/randomart/docs/findings.md` (IDs stables F01–F30, à citer dans les commits).

randomart a déjà `Brand`/`assertFinite` (copie locale, F01) et des types brandés validés
(`Seed`, `Node`, `Expression`, `Grammar`, `Artwork`). Les vrais trous : invariants portés par
des fonctions retournant des primitives (`calculatePhase` → F08), garanties perdues aux
frontières (`RenderKey.dpr` dé-brande un `DevicePixelRatio` amont → F07), et types utilisés
comme entrée brute ET sortie validée (`Constraints` F10, `RenderSettings` F13).

## Objectif

Phase 1 — centraliser les helpers dans `src/core/shared/index.ts`
(`assertStrictlyPositive`, `assertInteger`, une convention de messages — trancher le
préfixe d'erreur, F03) ; introduire `Phase` sur `calculatePhase` (F08) ; typer `RenderKey`
avec les marques glaze `CanvasDimension`/`DevicePixelRatio` (F06, F07).

Phase 2 — séparer type d'entrée brute et type validé pour `Constraints` (F10, F11) et
`RenderSettings` (F13). Question de design ouverte dans findings §4 : brander la structure
(`Brand<{…}, 'Constraints'>` + type `*Input` brut, à l'image de `Grammar`) vs simple scission
input/output. `fitConstraints` doit retourner le type « validé » — c'est l'équivalent
`ZoomClamp` (F11).

Hors scope (décidé) : brander `rng.int`, `Channel`, `Address`, valeurs internes sans
problème de frontière réel (checklist conventions §14).

## Contrainte clé

Les tests existants ne sont PAS une contrainte : on les réécrit (`shared.test.ts`,
`random.test.ts`, `renderGate.test.ts`, `renderer.test.ts`, `fitConstraints.test.ts`,
`artwork.test.ts`, `grammar.test.ts`, `expression.test.ts`…). Ne pas déformer les types
pour faire passer les assertions actuelles.

## Pièges (findings §5)

- `surface.width/height` vaut 0 jusqu'au premier `#frameStep` ; `createCanvasDimension` est
  sûr dans `shouldRender` mais pas dans `onMount` (F09).
- `Clock.progress` est `[0, 1]` inclusif : `createPhase` doit normaliser `1.0 → 0` (F26).
- Rien ne doit throw par frame sans décision explicite (`shouldRender`/`uniforms`, F09b).
- Les marques ne sont distinguées que par leur littéral string, pas par le package (F02).
- Si `Constraints`/`RenderSettings` deviennent brandés, tous les sites d'entrée passent au
  type brut (`createGrammar` callers, `ArtworkInput.render`, `deserializeGrammar`,
  `readRender`) — `Partial<Branded>` ne fonctionne pas.

## Lecture à faire avant de coder

1. `packages/randomart/docs/findings.md` (F01–F30, §4 direction, §5 pièges, §6 file map).
2. `codex/docs/conventions/08-decisions-and-checklist.md` §14.
3. Référence glaze : `packages/glaze/src/core/brands.ts`, `render.ts`, `time.ts`,
   `cameraTypes.ts` (`ZoomClamp`, `CameraPatch`).

## Vérification

`vp check --fix` (racine) puis `vp -C packages/randomart test`. Langue : anglais pour le
code et les docs (findings.md l'est déjà), français pour les discussions.

## État

Rien n'est cassé, rien n'est commencé : la session s'est close à l'écriture du fichier de
findings. Commencer directement par phase 1.
