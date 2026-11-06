# task-13 — packages/glaze3d/src/controls/orbit.ts

- Fichier : `packages/glaze3d/src/controls/orbit.ts`
- Statut : `pending`
- Catégorie : `cas-par-cas` (2 cas-par-cas, 0 branding)
- Nombre de warnings dans ce fichier : 2

## Warnings à traiter

### Warning 1 — ligne 37 (colonne 24)

- Message : `Unsafe type assertion: type '{ window?: WindowTarget | undefined; }' is more narrow than the original type.`
- Type : `cas-par-cas`

Extrait du code :
```text
      35 |
      36 | function windowTarget(): WindowTarget | null {
>>>   37 |     const candidate = (globalThis as { window?: WindowTarget }).window;
      38 |     return candidate ?? null;
      39 | }
```

Approche suggérée : voir `context.md` (patterns de correction des commits précédents).

### Warning 2 — ligne 198 (colonne 25)

- Message : `Unsafe type assertion: type 'HTMLElement | null | undefined' is more narrow than the original type.`
- Type : `cas-par-cas`

Extrait du code :
```text
     196 |         windowTarget()?.addEventListener('pointermove', this.onPointerMove);
     197 |         windowTarget()?.addEventListener('pointerup', this.onPointerUp);
>>>  198 |         const element = event.currentTarget as HTMLElement | null | undefined;
     199 |         if (element != null && typeof element.setPointerCapture === 'function') {
     200 |             try {
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
