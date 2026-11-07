# task-44 — packages/palette/src/components/color-picker/colorSpaceCanvas.worker.ts

- Fichier : `packages/palette/src/components/color-picker/colorSpaceCanvas.worker.ts`
- Statut : `pending`
- Catégorie : `boundary` (1 warning)
- Nombre de warnings : 1

## Stratégie recommandée

`self as unknown as WorkerScope` est une frontière worker. Garder une suppression unique avec un commentaire, ou déclarer le scope via `DedicatedWorkerGlobalScope` si les types sont disponibles. Ne pas recopier ce cast ailleurs.

## Warnings actuels

### Warning 1 — ligne 10, colonne 21 (indicatif)

- Message : `Unsafe type assertion: type 'WorkerScope' is more narrow than the original type.`
- Type : `boundary`

Contexte (la ligne `>>>` est celle du warning) :

```text
       8 | }
       9 |
>>>   10 | const workerScope = self as unknown as WorkerScope;
      11 |
      12 | function renderColorSpace({ spaceId, zValue, size }: RenderColorSpaceTask): ImageBitmap {
```

## Définition de fait

- Le warning n’apparaît plus dans `vp check --no-fmt --deny-warnings`.
- Aucun nouveau warning ni erreur ; tests du package verts.
- `git diff` relu : pas de changement de comportement, de test ou de config non justifié.
- `progress.md` mis à jour ; suppression éventuelle documentée (`fichier:ligne` + raison).

## Références

- `context.md` : grille de décision, patterns, pièges connus.
- `task-58` si un helper `typedKeys` partagé est nécessaire.
