# task-33 — apps/playground/src/experiments.ts

- Fichier : `apps/playground/src/experiments.ts`
- Statut : `pending`
- Catégorie : `keys` (1 warning)
- Nombre de warnings : 1

## Stratégie recommandée

`experimentKeys = Object.keys(EXPERIMENTS) as ExperimentKey[]` → `typedKeys(EXPERIMENTS)`.

## Warnings actuels

### Warning 1 — ligne 123, colonne 31 (indicatif)

- Message : `Unsafe type assertion: type '("art-canvas" | "automa" | "fracture" | "home" | "mol-demo" | "mosaic-maker" | "notebook" | "oeis-signal" | "palette" | "pixel" | "pixel-manipulator" | "radu-machine-learning" | "randomart" | "sequencer")[]' is more narrow than the original type.`
- Type : `keys`

Contexte (la ligne `>>>` est celle du warning) :

```text
     121 |
     122 | export type ExperimentKey = keyof typeof EXPERIMENTS;
>>>  123 | export const experimentKeys = Object.keys(EXPERIMENTS) as ExperimentKey[];
     124 |
     125 | function cached<Key, Value>(
```

## Définition de fait

- Le warning n’apparaît plus dans `vp check --no-fmt --deny-warnings`.
- Aucun nouveau warning ni erreur ; tests du package verts.
- `git diff` relu : pas de changement de comportement, de test ou de config non justifié.
- `progress.md` mis à jour ; suppression éventuelle documentée (`fichier:ligne` + raison).

## Références

- `context.md` : grille de décision, patterns, pièges connus.
- `task-58` si un helper `typedKeys` partagé est nécessaire.
