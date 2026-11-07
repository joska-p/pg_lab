# task-20 — packages/sequencer/src/core/layers/drawMountain.ts

- Fichier : `packages/sequencer/src/core/layers/drawMountain.ts`
- Statut : `done`
- Catégorie : `guard` (historique)
- Nombre de warnings dans ce fichier : 1

## Warnings à traiter

### Warning 1 — ligne 57 (colonne 20)

- Message : `Unsafe type assertion: type 'number' is more narrow than the original type.`
- Type : `cas-par-cas`

Extrait du code :

```text
      55 |         }
      56 |
>>>   57 |         const gh = gradientHeight as number;
      58 |         const gradHeight = ctx.canvas.height * gh;
      59 |         const gradY = offsetY - gradHeight / 2;
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
