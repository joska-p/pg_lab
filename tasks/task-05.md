# task-05 — packages/glaze/src/core/time.ts

- Fichier : `packages/glaze/src/core/time.ts`
- Statut : `pending`
- Catégorie : `branding` (0 cas-par-cas, 4 branding)
- Nombre de warnings dans ce fichier : 4

## Warnings à traiter

### Warning 1 — ligne 19 (colonne 12)

- Message : `Unsafe type assertion: type 'DurationSeconds' is more narrow than the original type.`
- Type : `branding`

Extrait du code :
```text
      17 |     assertStrictlyPositive(value, 'duration');
      18 |
>>>   19 |     return value as DurationSeconds;
      20 | }
      21 |
```

Approche suggérée : voir `context.md` (patterns de correction des commits précédents).

### Warning 2 — ligne 25 (colonne 12)

- Message : `Unsafe type assertion: type 'Seconds' is more narrow than the original type.`
- Type : `branding`

Extrait du code :
```text
      23 |     assertFinite(value, 'seconds');
      24 |
>>>   25 |     return value as Seconds;
      26 | }
      27 |
```

Approche suggérée : voir `context.md` (patterns de correction des commits précédents).

### Warning 3 — ligne 35 (colonne 12)

- Message : `Unsafe type assertion: type 'NonNegativeSeconds' is more narrow than the original type.`
- Type : `branding`

Extrait du code :
```text
      33 |     }
      34 |
>>>   35 |     return value as NonNegativeSeconds;
      36 | }
      37 |
```

Approche suggérée : voir `context.md` (patterns de correction des commits précédents).

### Warning 4 — ligne 41 (colonne 12)

- Message : `Unsafe type assertion: type 'Milliseconds' is more narrow than the original type.`
- Type : `branding`

Extrait du code :
```text
      39 |     assertFinite(value, 'milliseconds');
      40 |
>>>   41 |     return value as Milliseconds;
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
