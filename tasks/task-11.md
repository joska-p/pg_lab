# task-11 — packages/glaze/src/react/surfaceStack.ts

- Fichier : `packages/glaze/src/react/surfaceStack.ts`
- Statut : `pending`
- Catégorie : `branding` (0 cas-par-cas, 1 branding)
- Nombre de warnings dans ce fichier : 1

## Warnings à traiter

### Warning 1 — ligne 41 (colonne 12)

- Message : `Unsafe type assertion: type 'Compact<T>' is more narrow than the original type.`
- Type : `branding`

Extrait du code :
```text
      39 |     }
      40 |
>>>   41 |     return result as Compact<T>;
      42 | }
      43 |
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
