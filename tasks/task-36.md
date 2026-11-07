# task-36 — packages/fracture/src/components/Controls.tsx

- Fichier : `packages/fracture/src/components/Controls.tsx`
- Statut : `pending`
- Catégorie : `keys` (1 warning)
- Nombre de warnings : 1

## Stratégie recommandée

`(Object.keys(EXPERIMENTS) as ExperimentKey[]).map(...)` → `typedKeys(EXPERIMENTS).map(...)`.

## Warnings actuels

### Warning 1 — ligne 10, colonne 18 (indicatif)

- Message : `Unsafe type assertion: type '("julia-double-split" | "julia-naive" | "mandelbrot-double-split" | "mandelbrot-naive" | "mandelbrot-perturbation")[]' is more narrow than the original type.`
- Type : `keys`

Contexte (la ligne `>>>` est celle du warning) :

```text
       8 | import { PerfHud } from './PerfHud';
       9 |
>>>   10 | const OPTIONS = (Object.keys(EXPERIMENTS) as ExperimentKey[]).map((id) => ({
      11 |     value: id,
      12 |     label: EXPERIMENTS[id].label,
```

## Définition de fait

- Le warning n’apparaît plus dans `vp check --no-fmt --deny-warnings`.
- Aucun nouveau warning ni erreur ; tests du package verts.
- `git diff` relu : pas de changement de comportement, de test ou de config non justifié.
- `progress.md` mis à jour ; suppression éventuelle documentée (`fichier:ligne` + raison).

## Références

- `context.md` : grille de décision, patterns, pièges connus.
- `task-58` si un helper `typedKeys` partagé est nécessaire.
