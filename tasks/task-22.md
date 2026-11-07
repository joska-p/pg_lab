# task-22 — packages/sequencer/src/core/layers/drawRadialSpokes.ts

- Fichier : `packages/sequencer/src/core/layers/drawRadialSpokes.ts`
- Statut : `done`
- Catégorie : `guard` (historique)
- Nombre de warnings dans ce fichier : 5

## Warnings à traiter

### Warning 1 — ligne 68 (colonne 77)

- Message : `Unsafe type assertion: type 'number' is more narrow than the original type.`
- Type : `cas-par-cas`

Extrait du code :

```text
      66 |         const cx = offsetX;
      67 |         const cy = offsetY;
>>>   68 |         const maxR = Math.min(ctx.canvas.width, ctx.canvas.height) * 0.4 * (scale as number);
      69 |         const maxData = maxVal || 1;
      70 |
```

Approche suggérée : voir `context.md` (patterns de correction des commits précédents).

### Warning 2 — ligne 73 (colonne 25)

- Message : `Unsafe type assertion: type 'number' is more narrow than the original type.`
- Type : `cas-par-cas`

Extrait du code :

```text
      71 |         ctx.save();
      72 |         ctx.translate(cx, cy);
>>>   73 |         ctx.lineWidth = lineWidth as number;
      74 |         ctx.globalAlpha = alpha as number;
      75 |
```

Approche suggérée : voir `context.md` (patterns de correction des commits précédents).

### Warning 3 — ligne 74 (colonne 27)

- Message : `Unsafe type assertion: type 'number' is more narrow than the original type.`
- Type : `cas-par-cas`

Extrait du code :

```text
      72 |         ctx.translate(cx, cy);
      73 |         ctx.lineWidth = lineWidth as number;
>>>   74 |         ctx.globalAlpha = alpha as number;
      75 |
      76 |         data.forEach((val, i) => {
```

Approche suggérée : voir `context.md` (patterns de correction des commits précédents).

### Warning 4 — ligne 89 (colonne 18)

- Message : `Unsafe type assertion: type 'number' is more narrow than the original type.`
- Type : `cas-par-cas`

Extrait du code :

```text
      87 |             ctx.stroke();
      88 |
>>>   89 |             if ((dotRadius as number) > 0) {
      90 |                 ctx.fillStyle = `hsl(${String(hue)}, ${String(saturation)}%, ${String(lightness)}%)`;
      91 |                 ctx.beginPath();
```

Approche suggérée : voir `context.md` (patterns de correction des commits précédents).

### Warning 5 — ligne 92 (colonne 31)

- Message : `Unsafe type assertion: type 'number' is more narrow than the original type.`
- Type : `cas-par-cas`

Extrait du code :

```text
      90 |                 ctx.fillStyle = `hsl(${String(hue)}, ${String(saturation)}%, ${String(lightness)}%)`;
      91 |                 ctx.beginPath();
>>>   92 |                 ctx.arc(x, y, dotRadius as number, 0, 2 * Math.PI);
      93 |                 ctx.fill();
      94 |             }
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
