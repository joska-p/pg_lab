# task-33 — apps/playground/src/experiments.ts

- Fichier : `apps/playground/src/experiments.ts`
- Statut : `pending`
- Catégorie : `branding` (0 cas-par-cas, 1 branding)
- Nombre de warnings dans ce fichier : 1

## Warnings à traiter

### Warning 1 — ligne 123 (colonne 31)

- Message : `Unsafe type assertion: type '("art-canvas" | "automa" | "fracture" | "home" | "mol-demo" | "mosaic-maker" | "notebook" | "oeis-signal" | "palette" | "pixel" | "pixel-manipulator" | "radu-machine-learning" | "randomart" | "sequencer")[]' is more narrow than the original type.`
- Type : `branding`

Extrait du code :
```text
     121 |
     122 | export type ExperimentKey = keyof typeof EXPERIMENTS;
>>>  123 | export const experimentKeys = Object.keys(EXPERIMENTS) as ExperimentKey[];
     124 |
     125 | function cached<Key, Value>(
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
