# task-19 — packages/sequencer/src/core/layers/drawFactorWaves.ts

- Fichier : `packages/sequencer/src/core/layers/drawFactorWaves.ts`
- Statut : `pending`
- Catégorie : `cas-par-cas` (2 cas-par-cas, 0 branding)
- Nombre de warnings dans ce fichier : 2

## Warnings à traiter

### Warning 1 — ligne 64 (colonne 51)

- Message : `Unsafe type assertion: type 'number' is more narrow than the original type.`
- Type : `cas-par-cas`

Extrait du code :
```text
      62 |         }
      63 |
>>>   64 |         const maxAmplitude = ctx.canvas.height * (amplitudeScale as number);
      65 |
      66 |         data.forEach((p) => {
```

Approche suggérée : voir `context.md` (patterns de correction des commits précédents).

### Warning 2 — ligne 72 (colonne 29)

- Message : `Unsafe type assertion: type 'number' is more narrow than the original type.`
- Type : `cas-par-cas`

Extrait du code :
```text
      70 |             ctx.save();
      71 |             ctx.strokeStyle = `hsla(${String(hue)}, ${String(saturation)}%, ${String(lightness)}%, ${String(alpha)})`;
>>>   72 |             ctx.lineWidth = lineWidth as number;
      73 |             ctx.beginPath();
      74 |
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
