# task-41 — packages/mosaic-maker/src/utils/random/shuffleObject.ts

- Fichier : `packages/mosaic-maker/src/utils/random/shuffleObject.ts`
- Statut : `pending`
- Catégorie : `signature` (1 warning)
- Nombre de warnings : 1

## Stratégie recommandée

Le cast `Object.fromEntries(...) as T` cache un bug sémantique : les valeurs sont mélangées entre les clés, donc le retour `T` est faux sauf si toutes les valeurs ont le même type. Changer la signature (`T extends Record<string, V>` → `Record<keyof T, V>`) ou retourner `Record<keyof T, T[keyof T]>`. Ne pas supprimer le warning.

## Warnings actuels

### Warning 1 — ligne 8, colonne 12 (indicatif)

- Message : `Unsafe type assertion: the original type is assignable to the constraint of type 'T', but 'T' could be instantiated with a different subtype of its constraint.`
- Type : `signature`

Contexte (la ligne `>>>` est celle du warning) :

```text
       6 |     const shuffledValues = shuffleArray(values);
       7 |
>>>    8 |     return Object.fromEntries(keys.map((key, index) => [key, shuffledValues[index]])) as T;
       9 | }
      10 |
```

## Définition de fait

- Le warning n’apparaît plus dans `vp check --no-fmt --deny-warnings`.
- Aucun nouveau warning ni erreur ; tests du package verts.
- `git diff` relu : pas de changement de comportement, de test ou de config non justifié.
- `progress.md` mis à jour ; suppression éventuelle documentée (`fichier:ligne` + raison).

## Références

- `context.md` : grille de décision, patterns, pièges connus.
- `task-58` si un helper `typedKeys` partagé est nécessaire.
