# task-28 — packages/randomart-core/src/ops.ts

- Fichier : `packages/randomart-core/src/ops.ts`
- Statut : `pending`
- Catégorie : `branding` (0 cas-par-cas, 1 branding)
- Nombre de warnings dans ce fichier : 1

## Warnings à traiter

### Warning 1 — ligne 290 (colonne 26)

- Message : `Unsafe type assertion: type '("abs" | "add" | "const" | "cos" | "div" | "gt" | "max" | "min" | "mix" | "mul" | "neg" | "select" | "sin" | "sqr" | "sub" | "warp" | "x" | "y")[]' is more narrow than the original type.`
- Type : `branding`

Extrait du code :
```text
     288 |
     289 | /** Operator names in canonical order: every iteration over the catalogue must use it. */
>>>  290 | export const OP_NAMES = (Object.keys(opTable) as OpName[]).sort();
     291 |
     292 | export function isOpName(value: unknown): value is OpName {
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
