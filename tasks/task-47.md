# task-47 — packages/pixel/src/processor/neighborhood-tiling.ts

- Fichier : `packages/pixel/src/processor/neighborhood-tiling.ts`
- Statut : `pending`
- Catégorie : `signature` (1 warning)
- Nombre de warnings : 1

## Stratégie recommandée

`(definition as { radius?: number }).radius` : ajouter `radius?: number` au type de définition (`ManipulationDefinition` ou type voisin) et supprimer le cast. Le cast ne corrige pas le type, il le contourne.

## Warnings actuels

### Warning 1 — ligne 87, colonne 19 (indicatif)

- Message : `Unsafe type assertion: type '{ radius?: number | undefined; }' is more narrow than the original type.`
- Type : `signature`

Contexte (la ligne `>>>` est celle du warning) :

```text
      85 |     options: Record<string, unknown>;
      86 | }) {
>>>   87 |     const halo = (definition as { radius?: number }).radius ?? 1;
      88 |     const destinationImage = new PixelData(source.width, source.height);
      89 |
```

## Définition de fait

- Le warning n’apparaît plus dans `vp check --no-fmt --deny-warnings`.
- Aucun nouveau warning ni erreur ; tests du package verts.
- `git diff` relu : pas de changement de comportement, de test ou de config non justifié.
- `progress.md` mis à jour ; suppression éventuelle documentée (`fichier:ligne` + raison).

## Références

- `context.md` : grille de décision, patterns, pièges connus.
- `task-58` si un helper `typedKeys` partagé est nécessaire.
