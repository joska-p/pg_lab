# task-29 — packages/randomart-core/src/seed.ts

- Fichier : `packages/randomart-core/src/seed.ts`
- Statut : `pending`
- Catégorie : `branding` (0 cas-par-cas, 2 branding)
- Nombre de warnings dans ce fichier : 2

## Warnings à traiter

### Warning 1 — ligne 26 (colonne 12)

- Message : `Unsafe type assertion: type 'Seed' is more narrow than the original type.`
- Type : `branding`

Extrait du code :
```text
      24 |         );
      25 |     }
>>>   26 |     return trimmed as Seed;
      27 | }
      28 |
```

Approche suggérée : voir `context.md` (patterns de correction des commits précédents).

### Warning 2 — ligne 32 (colonne 73)

- Message : `Unsafe type assertion: type 'Seed' is more narrow than the original type.`
- Type : `branding`

Extrait du code :
```text
      30 | export function parseSeed(raw: string): Seed | null {
      31 |     const trimmed = raw.trim();
>>>   32 |     return trimmed === '' || trimmed.length > MAX_SEED_LENGTH ? null : (trimmed as Seed);
      33 | }
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
