# task-45 — packages/palette/src/components/color-picker/colorSpaceCanvasPool.ts

- Fichier : `packages/palette/src/components/color-picker/colorSpaceCanvasPool.ts`
- Statut : `pending`
- Catégorie : `boundary` (1 warning)
- Nombre de warnings : 1

## Stratégie recommandée

`event.data as ColorSpaceCanvasResponse` : valider la réponse (`isColorSpaceCanvasResponse`) avant de l’utiliser, ou typer `WorkerPoolConfig.deserialize` en `MessageEvent<TResponse>` (task-60). Le worker pixel montre le bon pattern de validation.

## Warnings actuels

### Warning 1 — ligne 14, colonne 30 (indicatif)

- Message : `Unsafe assertion from `any` detected.`
- Type : `boundary`

Contexte (la ligne `>>>` est celle du warning) :

```text
      12 |         serialize: (task) => ({ message: task }),
      13 |         deserialize: (event) => {
>>>   14 |             const response = event.data as ColorSpaceCanvasResponse;
      15 |
      16 |             if (response.ok) {
```

## Définition de fait

- Le warning n’apparaît plus dans `vp check --no-fmt --deny-warnings`.
- Aucun nouveau warning ni erreur ; tests du package verts.
- `git diff` relu : pas de changement de comportement, de test ou de config non justifié.
- `progress.md` mis à jour ; suppression éventuelle documentée (`fichier:ligne` + raison).

## Références

- `context.md` : grille de décision, patterns, pièges connus.
- `task-58` si un helper `typedKeys` partagé est nécessaire.
