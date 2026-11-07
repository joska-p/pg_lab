# task-04 — packages/glaze/src/core/render.ts

- Fichier : `packages/glaze/src/core/render.ts`
- Statut : `done`
- Catégorie : `brand` (historique)
- Nombre de warnings dans ce fichier : 1

## Warnings à traiter

### Warning 1 — ligne 27 (colonne 12)

- Message : `Unsafe type assertion: type 'StateData' is more narrow than the original type.`
- Type : `branding`

Extrait du code :

```text
      25 |     }
      26 |
>>>   27 |     return data as StateData;
      28 | }
      29 |
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
