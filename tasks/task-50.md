# task-50 — packages/three-stage/src/components/GetStarted/Root.tsx

- Fichier : `packages/three-stage/src/components/GetStarted/Root.tsx`
- Statut : `pending`
- Catégorie : `boundary` (2 warnings)
- Nombre de warnings : 2

## Stratégie recommandée

Les deux `preset as PresetName` viennent de `useLevaControls`, qui retourne `string`. Typer `preset` à la frontière leva (garde `isPresetName` ou assertion localisée unique dans `useLevaControls`) et retourner `PresetName` ; supprimer les deux casts du call site.

## Warnings actuels

### Warning 1 — ligne 17, colonne 17 (indicatif)

- Message : `Unsafe type assertion: type 'PresetName' is more narrow than the original type.`
- Type : `boundary`

Contexte (la ligne `>>>` est celle du warning) :

```text
      15 |
      16 |     const branches = getSpawnPoints({
>>>   17 |         preset: preset as PresetName,
      18 |         radius,
      19 |         offset,
```

### Warning 2 — ligne 25, colonne 9 (indicatif)

- Message : `Unsafe type assertion: type 'PresetName' is more narrow than the original type.`
- Type : `boundary`

Contexte (la ligne `>>>` est celle du warning) :

```text
      23 |
      24 |     const debugGeometry = getDebugGeometry(
>>>   25 |         preset as PresetName,
      26 |         radius,
      27 |         circleSegments,
```

## Définition de fait

- Le warning n’apparaît plus dans `vp check --no-fmt --deny-warnings`.
- Aucun nouveau warning ni erreur ; tests du package verts.
- `git diff` relu : pas de changement de comportement, de test ou de config non justifié.
- `progress.md` mis à jour ; suppression éventuelle documentée (`fichier:ligne` + raison).

## Références

- `context.md` : grille de décision, patterns, pièges connus.
- `task-58` si un helper `typedKeys` partagé est nécessaire.
