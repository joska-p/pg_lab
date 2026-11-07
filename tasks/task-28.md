# task-28 — packages/randomart-core/src/ops.ts

- Fichier : `packages/randomart-core/src/ops.ts`
- Statut : `pending`
- Catégorie : `keys` (1 warning)
- Nombre de warnings : 1

## Stratégie recommandée

`OP_NAMES = (Object.keys(opTable) as OpName[]).sort()` → `typedKeys(opTable).sort()`. Le helper peut être importé du package partagé (task-58) ou, à défaut, rester local et unique.

## Warnings actuels

### Warning 1 — ligne 290, colonne 26 (indicatif)

- Message : `Unsafe type assertion: type '("abs" | "add" | "const" | "cos" | "div" | "gt" | "max" | "min" | "mix" | "mul" | "neg" | "select" | "sin" | "sqr" | "sub" | "warp" | "x" | "y")[]' is more narrow than the original type.`
- Type : `keys`

Contexte (la ligne `>>>` est celle du warning) :

```text
     288 |
     289 | /** Operator names in canonical order: every iteration over the catalogue must use it. */
>>>  290 | export const OP_NAMES = (Object.keys(opTable) as OpName[]).sort();
     291 |
     292 | export function isOpName(value: unknown): value is OpName {
```

## Définition de fait

- Le warning n’apparaît plus dans `vp check --no-fmt --deny-warnings`.
- Aucun nouveau warning ni erreur ; tests du package verts.
- `git diff` relu : pas de changement de comportement, de test ou de config non justifié.
- `progress.md` mis à jour ; suppression éventuelle documentée (`fichier:ligne` + raison).

## Références

- `context.md` : grille de décision, patterns, pièges connus.
- `task-58` si un helper `typedKeys` partagé est nécessaire.
