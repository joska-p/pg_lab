# task-51 — packages/ui/src/components/ExperimentShell.tsx

- Fichier : `packages/ui/src/components/ExperimentShell.tsx`
- Statut : `pending`
- Catégorie : `cas-par-cas` (1 cas-par-cas, 0 branding)
- Nombre de warnings dans ce fichier : 1

## Warnings à traiter

### Warning 1 — ligne 284 (colonne 25)

- Message : `Unsafe type assertion: type 'CSSProperties' is more narrow than the original type.`
- Type : `cas-par-cas`

Extrait du code :
```text
     282 |                     )}
     283 |                     style={
>>>  284 |                         {
     285 |                             '--panel-height': panelHeight != null ? `${panelHeight}px` : undefined,
     286 |                         } as React.CSSProperties
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
