# task-45 — packages/palette/src/components/color-picker/colorSpaceCanvasPool.ts

- Fichier : `packages/palette/src/components/color-picker/colorSpaceCanvasPool.ts`
- Statut : `pending`
- Catégorie : `cas-par-cas` (1 cas-par-cas, 0 branding)
- Nombre de warnings dans ce fichier : 1

## Warnings à traiter

### Warning 1 — ligne 14 (colonne 30)

- Message : `Unsafe assertion from `any` detected.`
- Type : `cas-par-cas`

Extrait du code :
```text
      12 |         serialize: (task) => ({ message: task }),
      13 |         deserialize: (event) => {
>>>   14 |             const response = event.data as ColorSpaceCanvasResponse;
      15 |
      16 |             if (response.ok) {
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
