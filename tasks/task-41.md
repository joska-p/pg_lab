# task-41 — packages/mosaic-maker/src/utils/random/shuffleObject.ts

- Fichier : `packages/mosaic-maker/src/utils/random/shuffleObject.ts`
- Statut : `pending`
- Catégorie : `cas-par-cas` (1 cas-par-cas, 0 branding)
- Nombre de warnings dans ce fichier : 1

## Warnings à traiter

### Warning 1 — ligne 8 (colonne 12)

- Message : `Unsafe type assertion: the original type is assignable to the constraint of type 'T', but 'T' could be instantiated with a different subtype of its constraint.`
- Type : `cas-par-cas`

Extrait du code :
```text
       6 |     const shuffledValues = shuffleArray(values);
       7 |
>>>    8 |     return Object.fromEntries(keys.map((key, index) => [key, shuffledValues[index]])) as T;
       9 | }
      10 |
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
