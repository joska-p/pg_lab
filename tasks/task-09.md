# task-09 — packages/glaze/src/gpu/shader/compileProgram.ts

- Fichier : `packages/glaze/src/gpu/shader/compileProgram.ts`
- Statut : `pending`
- Catégorie : `cas-par-cas` (1 cas-par-cas, 0 branding)
- Nombre de warnings dans ce fichier : 1

## Warnings à traiter

### Warning 1 — ligne 95 (colonne 25)

- Message : `Unsafe assertion from `any` detected.`
- Type : `cas-par-cas`

Extrait du code :
```text
      93 |
      94 |     const uniforms = new Map<string, UniformEntry>();
>>>   95 |     const numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS) as number;
      96 |
      97 |     for (let i = 0; i < numUniforms; i++) {
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
