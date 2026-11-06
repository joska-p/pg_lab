# task-25 — packages/sequencer/src/modules/fourier/drawFourierEpicycles.ts

- Fichier : `packages/sequencer/src/modules/fourier/drawFourierEpicycles.ts`
- Statut : `pending`
- Catégorie : `cas-par-cas` (2 cas-par-cas, 0 branding)
- Nombre de warnings dans ce fichier : 2

## Warnings à traiter

### Warning 1 — ligne 26 (colonne 58)

- Message : `Unsafe type assertion: type 'Record<string, number | boolean>' is more narrow than the original type.`
- Type : `cas-par-cas`

Extrait du code :
```text
      24 |     },
      25 |     draw: (ctx, data, params, layout) => {
>>>   26 |         const { precision = 40, orbitOverlays = true } = params as Record<string, number | boolean>;
      27 |
      28 |         const pairs = new Float32Array(data.length * 2);
```

Approche suggérée : voir `context.md` (patterns de correction des commits précédents).

### Warning 2 — ligne 46 (colonne 56)

- Message : `Unsafe type assertion: type 'number' is more narrow than the original type.`
- Type : `cas-par-cas`

Extrait du code :
```text
      44 |         ctx.translate(layout.offsetX, layout.offsetY);
      45 |
>>>   46 |         const activeLimit = Math.min(epicycles.length, precision as number);
      47 |
      48 |         // --- 1. DRAW THE FULL PATH INTENTIOANLLY IN ONE FRAME ---
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
