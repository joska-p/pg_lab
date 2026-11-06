# task-44 — packages/palette/src/components/color-picker/colorSpaceCanvas.worker.ts

- Fichier : `packages/palette/src/components/color-picker/colorSpaceCanvas.worker.ts`
- Statut : `pending`
- Catégorie : `branding` (0 cas-par-cas, 1 branding)
- Nombre de warnings dans ce fichier : 1

## Warnings à traiter

### Warning 1 — ligne 10 (colonne 21)

- Message : `Unsafe type assertion: type 'WorkerScope' is more narrow than the original type.`
- Type : `branding`

Extrait du code :
```text
       8 | }
       9 |
>>>   10 | const workerScope = self as unknown as WorkerScope;
      11 |
      12 | function renderColorSpace({ spaceId, zValue, size }: RenderColorSpaceTask): ImageBitmap {
```

Approche suggérée : voir `context.md` (patterns de correction des commits précédents).

## Définition de fait
- Le(s) warning(s) de ce fichier n'apparaît(ent) plus dans `vp check` (ou `vp -C <package> check`).
- Aucun nouveau warning ni erreur de type introduit.
- La tâche est passée de `pending` à `done` dans `progress.md`.

## Références
- Commit `02b4161` (randomart-ui) : helper `typedKeys` + `oxlint-disable-next-line` pour les cas de branding.
- Commit `8f4d13d` (automa) : `Map` + fonction getter à la place de l'indexation `map[key]` non typée.
- Commit `45fecfd` (pixel-manipulator) : garde-fous `typeof` à la place de `as X | undefined`.
- Commit `1c223b4` (glaze) : suppression du branding là où il n'est plus nécessaire.
