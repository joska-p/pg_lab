# task-16 — packages/sequencer/src/core/layers/drawBarChart.ts

- Fichier : `packages/sequencer/src/core/layers/drawBarChart.ts`
- Statut : `done`
- Catégorie : `guard` (historique)
- Nombre de warnings dans ce fichier : 2

## Warnings à traiter

### Warning 1 — ligne 51 (colonne 27)

- Message : `Unsafe type assertion: type 'number' is more narrow than the original type.`
- Type : `cas-par-cas`

Extrait du code :

```text
      49 |
      50 |         ctx.save();
>>>   51 |         ctx.globalAlpha = alpha as number;
      52 |
      53 |         const width = valueScale * (barWidth as number);
```

Approche suggérée : voir `context.md` (patterns de correction des commits précédents).

### Warning 2 — ligne 53 (colonne 37)

- Message : `Unsafe type assertion: type 'number' is more narrow than the original type.`
- Type : `cas-par-cas`

Extrait du code :

```text
      51 |         ctx.globalAlpha = alpha as number;
      52 |
>>>   53 |         const width = valueScale * (barWidth as number);
      54 |
      55 |         data.forEach((val) => {
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
