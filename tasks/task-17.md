# task-17 — packages/sequencer/src/core/layers/drawBaseline.ts

- Fichier : `packages/sequencer/src/core/layers/drawBaseline.ts`
- Statut : `pending`
- Catégorie : `cas-par-cas` (3 cas-par-cas, 0 branding)
- Nombre de warnings dans ce fichier : 3

## Warnings à traiter

### Warning 1 — ligne 32 (colonne 27)

- Message : `Unsafe type assertion: type 'string' is more narrow than the original type.`
- Type : `cas-par-cas`

Extrait du code :
```text
      30 |
      31 |         ctx.save();
>>>   32 |         ctx.strokeStyle = color as string;
      33 |         ctx.lineWidth = lineWidth as number;
      34 |         ctx.globalAlpha = alpha as number;
```

Approche suggérée : voir `context.md` (patterns de correction des commits précédents).

### Warning 2 — ligne 33 (colonne 25)

- Message : `Unsafe type assertion: type 'number' is more narrow than the original type.`
- Type : `cas-par-cas`

Extrait du code :
```text
      31 |         ctx.save();
      32 |         ctx.strokeStyle = color as string;
>>>   33 |         ctx.lineWidth = lineWidth as number;
      34 |         ctx.globalAlpha = alpha as number;
      35 |         ctx.beginPath();
```

Approche suggérée : voir `context.md` (patterns de correction des commits précédents).

### Warning 3 — ligne 34 (colonne 27)

- Message : `Unsafe type assertion: type 'number' is more narrow than the original type.`
- Type : `cas-par-cas`

Extrait du code :
```text
      32 |         ctx.strokeStyle = color as string;
      33 |         ctx.lineWidth = lineWidth as number;
>>>   34 |         ctx.globalAlpha = alpha as number;
      35 |         ctx.beginPath();
      36 |         ctx.moveTo(offsetX + minVal * valueScale, offsetY);
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
