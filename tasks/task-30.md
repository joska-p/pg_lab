# task-30 — packages/randomart-core/src/tree.ts

- Fichier : `packages/randomart-core/src/tree.ts`
- Statut : `pending`
- Catégorie : `guard` (1 warning)
- Nombre de warnings : 1

## Stratégie recommandée

`params[name] = raw as number` après `paramProblem(...) === null`. Remplacer par un narrowing `typeof raw === 'number'` (ou faire de `paramProblem` un type guard/assertion) et supprimer le cast. Ne pas supprimer le warning.

## Warnings actuels

### Warning 1 — ligne 102, colonne 24 (indicatif)

- Message : `Unsafe type assertion: type 'number' is more narrow than the original type.`
- Type : `guard`

Contexte (la ligne `>>>` est celle du warning) :

```text
     100 |         }
     101 |         // paramProblem returned null: `raw` is a finite number within range.
>>>  102 |         params[name] = raw as number;
     103 |     }
     104 |     return params;
```

## Définition de fait

- Le warning n’apparaît plus dans `vp check --no-fmt --deny-warnings`.
- Aucun nouveau warning ni erreur ; tests du package verts.
- `git diff` relu : pas de changement de comportement, de test ou de config non justifié.
- `progress.md` mis à jour ; suppression éventuelle documentée (`fichier:ligne` + raison).

## Références

- `context.md` : grille de décision, patterns, pièges connus.
- `task-58` si un helper `typedKeys` partagé est nécessaire.
