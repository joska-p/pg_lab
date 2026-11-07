# task-29 — packages/randomart-core/src/seed.ts

- Fichier : `packages/randomart-core/src/seed.ts`
- Statut : `pending`
- Catégorie : `brand` (2 warnings)
- Nombre de warnings : 2

## Stratégie recommandée

Les deux casts (`createSeed`, `parseSeed`) sont du branding légitime. Les centraliser dans un helper privé `brandSeed(value: string): Seed` avec une seule suppression commentée ; les deux fonctions publiques appellent ce helper.

## Warnings actuels

### Warning 1 — ligne 26, colonne 12 (indicatif)

- Message : `Unsafe type assertion: type 'Seed' is more narrow than the original type.`
- Type : `brand`

Contexte (la ligne `>>>` est celle du warning) :

```text
      24 |         );
      25 |     }
>>>   26 |     return trimmed as Seed;
      27 | }
      28 |
```

### Warning 2 — ligne 32, colonne 73 (indicatif)

- Message : `Unsafe type assertion: type 'Seed' is more narrow than the original type.`
- Type : `brand`

Contexte (la ligne `>>>` est celle du warning) :

```text
      30 | export function parseSeed(raw: string): Seed | null {
      31 |     const trimmed = raw.trim();
>>>   32 |     return trimmed === '' || trimmed.length > MAX_SEED_LENGTH ? null : (trimmed as Seed);
      33 | }
      34 |
```

## Définition de fait

- Le warning n’apparaît plus dans `vp check --no-fmt --deny-warnings`.
- Aucun nouveau warning ni erreur ; tests du package verts.
- `git diff` relu : pas de changement de comportement, de test ou de config non justifié.
- `progress.md` mis à jour ; suppression éventuelle documentée (`fichier:ligne` + raison).

## Références

- `context.md` : grille de décision, patterns, pièges connus.
- `task-58` si un helper `typedKeys` partagé est nécessaire.
