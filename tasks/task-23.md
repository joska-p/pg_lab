# task-23 — packages/sequencer/src/core/layers/drawRecamanArcs.ts

- Fichier : `packages/sequencer/src/core/layers/drawRecamanArcs.ts`
- Statut : `pending`
- Catégorie : `cas-par-cas` (3 cas-par-cas, 0 branding)
- Nombre de warnings dans ce fichier : 3

## Warnings à traiter

### Warning 1 — ligne 38 (colonne 28)

- Message : `Unsafe type assertion: type 'string' is more narrow than the original type.`
- Type : `cas-par-cas`

Extrait du code :
```text
      36 |         ctx.translate(offsetX, offsetY);
      37 |
>>>   38 |         ctx.strokeStyle = (color as string) || getComputedStyle(ctx.canvas).color || 'black';
      39 |         ctx.lineWidth = lineWidth as number;
      40 |         ctx.globalAlpha = alpha as number;
```

Approche suggérée : voir `context.md` (patterns de correction des commits précédents).

### Warning 2 — ligne 39 (colonne 25)

- Message : `Unsafe type assertion: type 'number' is more narrow than the original type.`
- Type : `cas-par-cas`

Extrait du code :
```text
      37 |
      38 |         ctx.strokeStyle = (color as string) || getComputedStyle(ctx.canvas).color || 'black';
>>>   39 |         ctx.lineWidth = lineWidth as number;
      40 |         ctx.globalAlpha = alpha as number;
      41 |
```

Approche suggérée : voir `context.md` (patterns de correction des commits précédents).

### Warning 3 — ligne 40 (colonne 27)

- Message : `Unsafe type assertion: type 'number' is more narrow than the original type.`
- Type : `cas-par-cas`

Extrait du code :
```text
      38 |         ctx.strokeStyle = (color as string) || getComputedStyle(ctx.canvas).color || 'black';
      39 |         ctx.lineWidth = lineWidth as number;
>>>   40 |         ctx.globalAlpha = alpha as number;
      41 |
      42 |         data.forEach((value, index) => {
```

Approche suggérée : voir `context.md` (patterns de correction des commits précédents).

## Définition de fait
- Le(s) warning(s) de ce fichier n'apparaît(ent) plus dans `vp check` (ou `vp -C <package> check`).
- Aucun nouveau warning ni erreur de type introduit.
- La tâche est passée de `pending` à `done` dans `progress.md`.

## Références
- Commit `02b4161` (randomart-ui) : helper `typedKeys` + `oxlint-disable-next-line` pour les cas de branding.
- Commit `8f4d13d` (automa) : `Map` + fonction getter à la place de l'indexation `map[key]` non typée.
- Commit `45fecfd` (pixel-manipulator) : garde-fous `typeof` à la place de `as X | undefined`.
- Commit `1c223b4` (glaze) : suppression du branding là où il n'est plus nécessaire.
