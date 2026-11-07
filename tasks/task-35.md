# task-35 — packages/art-canvas/src/experiments.ts

- Fichier : `packages/art-canvas/src/experiments.ts`
- Statut : `pending`
- Catégorie : `keys` (1 warning)
- Nombre de warnings : 1

## Stratégie recommandée

`experimentKeys = Object.keys(EXPERIMENTS) as ExperimentKey[]` → `typedKeys(EXPERIMENTS)`.

## Warnings actuels

### Warning 1 — ligne 61, colonne 31 (indicatif)

- Message : `Unsafe type assertion: type '("atlas" | "folded-space" | "manual" | "seed" | "spirale")[]' is more narrow than the original type.`
- Type : `keys`

Contexte (la ligne `>>>` est celle du warning) :

```text
      59 |
      60 | export type ExperimentKey = keyof typeof EXPERIMENTS;
>>>   61 | export const experimentKeys = Object.keys(EXPERIMENTS) as ExperimentKey[];
      62 |
```

## Définition de fait

- Le warning n’apparaît plus dans `vp check --no-fmt --deny-warnings`.
- Aucun nouveau warning ni erreur ; tests du package verts.
- `git diff` relu : pas de changement de comportement, de test ou de config non justifié.
- `progress.md` mis à jour ; suppression éventuelle documentée (`fichier:ligne` + raison).

## Références

- `context.md` : grille de décision, patterns, pièges connus.
- `task-58` si un helper `typedKeys` partagé est nécessaire.
