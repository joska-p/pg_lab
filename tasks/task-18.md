# task-18 — packages/sequencer/src/core/layers/drawConnectionLines.ts

- Fichier : `packages/sequencer/src/core/layers/drawConnectionLines.ts`
- Statut : `pending`
- Catégorie : `cas-par-cas` (3 cas-par-cas, 0 branding)
- Nombre de warnings dans ce fichier : 3

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
      68 |         // data.length >= 2 (garanti plus haut) : premier élément défini.
```

Approche suggérée : voir `context.md` (patterns de correction des commits précédents).

### Warning 3 — ligne 79 (colonne 47)

- Message : `Unsafe type assertion: type 'number' is more narrow than the original type.`
- Type : `cas-par-cas`

Extrait du code :
```text
      77 |                 continue;
      78 |             }
>>>   79 |             const hue = ((i / data.length) * (hueCycle as number)) % 360;
      80 |
      81 |             ctx.strokeStyle = `hsl(${String(hue)}, ${String(saturation)}%, ${String(lightness)}%)`;
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
