# task-49 — packages/pixel/src/worker/serialization.ts

- Fichier : `packages/pixel/src/worker/serialization.ts`
- Statut : `pending`
- Catégorie : `guard` (1 warning)
- Nombre de warnings : 1

## Stratégie recommandée

Après `typeof item === 'object' && item !== null`, utiliser les narrowing `'data' in item`, `'width' in item`, etc. au lieu de `item as Record<string, unknown>`. Vérifier que TypeScript accepte les accès puis supprimer le cast.

## Warnings actuels

### Warning 1 — ligne 15, colonne 25 (indicatif)

- Message : `Unsafe type assertion: type 'Record<string, unknown>' is more narrow than the original type.`
- Type : `guard`

Contexte (la ligne `>>>` est celle du warning) :

```text
      13 |             }
      14 |
>>>   15 |             const obj = item as Record<string, unknown>;
      16 |
      17 |             return (
```

## Définition de fait

- Le warning n’apparaît plus dans `vp check --no-fmt --deny-warnings`.
- Aucun nouveau warning ni erreur ; tests du package verts.
- `git diff` relu : pas de changement de comportement, de test ou de config non justifié.
- `progress.md` mis à jour ; suppression éventuelle documentée (`fichier:ligne` + raison).

## Références

- `context.md` : grille de décision, patterns, pièges connus.
- `task-58` si un helper `typedKeys` partagé est nécessaire.
