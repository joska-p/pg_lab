# task-46 — packages/pixel/src/docs/components/Controls.tsx

- Fichier : `packages/pixel/src/docs/components/Controls.tsx`
- Statut : `pending`
- Catégorie : `branding` (0 cas-par-cas, 2 branding)
- Nombre de warnings dans ce fichier : 2

## Warnings à traiter

### Warning 1 — ligne 111 (colonne 57)

- Message : `Unsafe type assertion: type '"chaining" | "resize"' is more narrow than the original type.`
- Type : `branding`

Extrait du code :
```text
     109 |             setActiveEndPointId({ kind: 'overview' });
     110 |         } else if (item.type === 'pipeline') {
>>>  111 |             setActiveEndPointId({ kind: 'pipeline', id: item.id as 'resize' | 'chaining' });
     112 |         } else if (item.type === 'internals') {
     113 |             setActiveEndPointId({ kind: 'internals', id: item.id });
```

Approche suggérée : voir `context.md` (patterns de correction des commits précédents).

### Warning 2 — ligne 124 (colonne 44)

- Message : `Unsafe type assertion: type '"chaining" | "resize"' is more narrow than the original type.`
- Type : `branding`

Extrait du code :
```text
     122 |         }
     123 |         if (item.type === 'pipeline') {
>>>  124 |             return { kind: 'pipeline', id: item.id as 'resize' | 'chaining' };
     125 |         }
     126 |         if (item.type === 'internals') {
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
