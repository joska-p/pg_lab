# task-21 — packages/sequencer/src/core/layers/drawPlottedNumbers.ts

- Fichier : `packages/sequencer/src/core/layers/drawPlottedNumbers.ts`
- Statut : `done`
- Catégorie : `guard` (historique)
- Nombre de warnings dans ce fichier : 3

## Warnings à traiter

### Warning 1 — ligne 30 (colonne 33)

- Message : `Unsafe type assertion: type 'string' is more narrow than the original type.`
- Type : `cas-par-cas`

Extrait du code :

```text
      28 |                 plotted.add(val);
      29 |                 ctx.save();
>>>   30 |                 ctx.fillStyle = color as string;
      31 |                 ctx.globalAlpha = alpha as number;
      32 |                 ctx.beginPath();
```

Approche suggérée : voir `context.md` (patterns de correction des commits précédents).

### Warning 2 — ligne 31 (colonne 35)

- Message : `Unsafe type assertion: type 'number' is more narrow than the original type.`
- Type : `cas-par-cas`

Extrait du code :

```text
      29 |                 ctx.save();
      30 |                 ctx.fillStyle = color as string;
>>>   31 |                 ctx.globalAlpha = alpha as number;
      32 |                 ctx.beginPath();
      33 |                 ctx.arc(offsetX + val * valueScale, offsetY, radius as number, 0, 2 * Math.PI);
```

Approche suggérée : voir `context.md` (patterns de correction des commits précédents).

### Warning 3 — ligne 33 (colonne 62)

- Message : `Unsafe type assertion: type 'number' is more narrow than the original type.`
- Type : `cas-par-cas`

Extrait du code :

```text
      31 |                 ctx.globalAlpha = alpha as number;
      32 |                 ctx.beginPath();
>>>   33 |                 ctx.arc(offsetX + val * valueScale, offsetY, radius as number, 0, 2 * Math.PI);
      34 |                 ctx.fill();
      35 |                 ctx.restore();
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
