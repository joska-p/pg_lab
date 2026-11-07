# task-39 — packages/mosaic-maker/src/components/controls/TileSetControls.tsx

- Fichier : `packages/mosaic-maker/src/components/controls/TileSetControls.tsx`
- Statut : `pending`
- Catégorie : `signature` (1 warning)
- Nombre de warnings : 1

## Stratégie recommandée

Le cast `as React.CSSProperties` porte une custom property (`--tile-size`). Deux options :

1. **Propre** : extraire `id` de `initialPalette`, puis construire un objet de vars et le passer en
   `satisfies CssVars` (même intersection que `task-51`) :

```ts
type CssVars = React.CSSProperties & {
    readonly [key: `--${string}`]: string | number | undefined;
};

const { id: _paletteId, ...paletteVars } = initialPalette;
const TILE_GRID_STYLE = {
    ...paletteVars,
    '--tile-size': '32px',
} satisfies CssVars;
```

2. **Fallback** : si l’index signature de `Palette` (`[key: string]: string`) empêche
   l’assignabilité, garder un cast localisé commenté (`--tile-size` est une custom property).
   Ne pas propager la suppression ailleurs.

Vérifier le rendu : le style doit toujours contenir les 5 couleurs + `--tile-size`.

## Warnings actuels

### Warning 1 — ligne 19, colonne 25 (indicatif)

- Message : `Unsafe type assertion: type 'CSSProperties' is more narrow than the original type.`
- Type : `signature`

Contexte (la ligne `>>>` est celle du warning) :

```text
      17 | ];
      18 |
>>>   19 | const TILE_GRID_STYLE = {
      20 |     ...initialPalette,
      21 |     '--tile-size': '32px',
```

## Définition de fait

- Le warning n’apparaît plus dans `vp check --no-fmt --deny-warnings`.
- Aucun nouveau warning ni erreur ; tests du package verts.
- `git diff` relu : pas de changement de comportement, de test ou de config non justifié.
- `progress.md` mis à jour ; suppression éventuelle documentée (`fichier:ligne` + raison).

## Références

- `context.md` : grille de décision, patterns, pièges connus.
- `task-58` si un helper `typedKeys` partagé est nécessaire.
