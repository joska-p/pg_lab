# task-24 — packages/sequencer/src/core/layers/drawStemPlot.ts

- Fichier : `packages/sequencer/src/core/layers/drawStemPlot.ts`
- Statut : `pending`
- Catégorie : `cas-par-cas` (4 cas-par-cas, 0 branding)
- Nombre de warnings dans ce fichier : 4

## Warnings à traiter

### Warning 1 — ligne 65 (colonne 25)

- Message : `Unsafe type assertion: type 'number' is more narrow than the original type.`
- Type : `cas-par-cas`

Extrait du code :
```text
      63 |
      64 |         ctx.save();
>>>   65 |         ctx.lineWidth = lineWidth as number;
      66 |         ctx.globalAlpha = alpha as number;
      67 |
```

Approche suggérée : voir `context.md` (patterns de correction des commits précédents).

### Warning 2 — ligne 66 (colonne 27)

- Message : `Unsafe type assertion: type 'number' is more narrow than the original type.`
- Type : `cas-par-cas`

Extrait du code :
```text
      64 |         ctx.save();
      65 |         ctx.lineWidth = lineWidth as number;
>>>   66 |         ctx.globalAlpha = alpha as number;
      67 |
      68 |         data.forEach((val, i) => {
```

Approche suggérée : voir `context.md` (patterns de correction des commits précédents).

### Warning 3 — ligne 80 (colonne 18)

- Message : `Unsafe type assertion: type 'number' is more narrow than the original type.`
- Type : `cas-par-cas`

Extrait du code :
```text
      78 |             ctx.stroke();
      79 |
>>>   80 |             if ((markerRadius as number) > 0) {
      81 |                 ctx.fillStyle = color;
      82 |                 ctx.beginPath();
```

Approche suggérée : voir `context.md` (patterns de correction des commits précédents).

### Warning 4 — ligne 83 (colonne 47)

- Message : `Unsafe type assertion: type 'number' is more narrow than the original type.`
- Type : `cas-par-cas`

Extrait du code :
```text
      81 |                 ctx.fillStyle = color;
      82 |                 ctx.beginPath();
>>>   83 |                 ctx.arc(x, offsetY - stemLen, markerRadius as number, 0, 2 * Math.PI);
      84 |                 ctx.fill();
      85 |             }
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
