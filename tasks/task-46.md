# task-46 — packages/pixel/src/docs/components/Controls.tsx

- Fichier : `packages/pixel/src/docs/components/Controls.tsx`
- Statut : `pending`
- Catégorie : `signature` (2 warnings)
- Nombre de warnings : 2

## Stratégie recommandée

Les deux casts `item.id as 'resize' | 'chaining'` viennent d’un type de donnée trop large. Rendre `EndpointItem` discriminé sur `type` (branche `pipeline` avec `id: 'resize' | 'chaining'`), ou ajouter un garde `isPipelineId`. Supprimer les casts des deux call sites.

## Warnings actuels

### Warning 1 — ligne 111, colonne 57 (indicatif)

- Message : `Unsafe type assertion: type '"chaining" | "resize"' is more narrow than the original type.`
- Type : `signature`

Contexte (la ligne `>>>` est celle du warning) :

```text
     109 |             setActiveEndPointId({ kind: 'overview' });
     110 |         } else if (item.type === 'pipeline') {
>>>  111 |             setActiveEndPointId({ kind: 'pipeline', id: item.id as 'resize' | 'chaining' });
     112 |         } else if (item.type === 'internals') {
     113 |             setActiveEndPointId({ kind: 'internals', id: item.id });
```

### Warning 2 — ligne 124, colonne 44 (indicatif)

- Message : `Unsafe type assertion: type '"chaining" | "resize"' is more narrow than the original type.`
- Type : `signature`

Contexte (la ligne `>>>` est celle du warning) :

```text
     122 |         }
     123 |         if (item.type === 'pipeline') {
>>>  124 |             return { kind: 'pipeline', id: item.id as 'resize' | 'chaining' };
     125 |         }
     126 |         if (item.type === 'internals') {
```

## Définition de fait

- Le warning n’apparaît plus dans `vp check --no-fmt --deny-warnings`.
- Aucun nouveau warning ni erreur ; tests du package verts.
- `git diff` relu : pas de changement de comportement, de test ou de config non justifié.
- `progress.md` mis à jour ; suppression éventuelle documentée (`fichier:ligne` + raison).

## Références

- `context.md` : grille de décision, patterns, pièges connus.
- `task-58` si un helper `typedKeys` partagé est nécessaire.
