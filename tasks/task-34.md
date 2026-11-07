# task-34 — packages/art-canvas/src/components/Controls.tsx

- Fichier : `packages/art-canvas/src/components/Controls.tsx`
- Statut : `pending`
- Catégorie : `keys` (1 warning)
- Nombre de warnings : 1

## Stratégie recommandée

`Object.entries(EXPERIMENTS).map(([value]) => ({ value: value as ExperimentKey, ... }))` → `typedKeys(EXPERIMENTS).map(id => ({ value: id, label: EXPERIMENTS[id].label }))`.

## Warnings actuels

### Warning 1 — ligne 11, colonne 12 (indicatif)

- Message : `Unsafe type assertion: type '"atlas" | "folded-space" | "manual" | "seed" | "spirale"' is more narrow than the original type.`
- Type : `keys`

Contexte (la ligne `>>>` est celle du warning) :

```text
       9 |
      10 | const OPTIONS = Object.entries(EXPERIMENTS).map(([value, { label }]) => ({
>>>   11 |     value: value as ExperimentKey,
      12 |     label,
      13 | }));
```

## Définition de fait

- Le warning n’apparaît plus dans `vp check --no-fmt --deny-warnings`.
- Aucun nouveau warning ni erreur ; tests du package verts.
- `git diff` relu : pas de changement de comportement, de test ou de config non justifié.
- `progress.md` mis à jour ; suppression éventuelle documentée (`fichier:ligne` + raison).

## Références

- `context.md` : grille de décision, patterns, pièges connus.
- `task-58` si un helper `typedKeys` partagé est nécessaire.
