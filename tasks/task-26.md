# task-26 — packages/randomart-core/src/colors.ts

- Fichier : `packages/randomart-core/src/colors.ts`
- Statut : `pending`
- Catégorie : `keys` (1 warning)
- Nombre de warnings : 1

## Stratégie recommandée

Remplacer `Object.keys(colorSpaces) as readonly ColorSpaceId[]` par le helper `typedKeys` (ou une tuple littérale `as const satisfies readonly ColorSpaceId[]`). Ce n’est pas du branding : ne pas ajouter de suppression dans ce fichier.

## Warnings actuels

### Warning 1 — ligne 73, colonne 32 (indicatif)

- Message : `Unsafe type assertion: type 'readonly ("hsl" | "oklab" | "oklch" | "srgb")[]' is more narrow than the original type.`
- Type : `keys`

Contexte (la ligne `>>>` est celle du warning) :

```text
      71 | export type ColorSpaceId = keyof typeof colorSpaces;
      72 |
>>>   73 | export const COLOR_SPACE_IDS = Object.keys(colorSpaces) as readonly ColorSpaceId[];
      74 |
      75 | export function isColorSpaceId(value: unknown): value is ColorSpaceId {
```

## Définition de fait

- Le warning n’apparaît plus dans `vp check --no-fmt --deny-warnings`.
- Aucun nouveau warning ni erreur ; tests du package verts.
- `git diff` relu : pas de changement de comportement, de test ou de config non justifié.
- `progress.md` mis à jour ; suppression éventuelle documentée (`fichier:ligne` + raison).

## Références

- `context.md` : grille de décision, patterns, pièges connus.
- `task-58` si un helper `typedKeys` partagé est nécessaire.
