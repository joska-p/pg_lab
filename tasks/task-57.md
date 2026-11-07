# task-57 — `packages/glaze/src/gpu/shader/compileProgram.ts` : garde `typeof`

- Fichier : `packages/glaze/src/gpu/shader/compileProgram.ts`
- Statut : `pending`
- Catégorie : `refactor`
- Origine : `task-09`

## Problème

Une suppression `oxlint-disable` a été ajoutée pour :

```ts
const numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS) as number;
```

`getProgramParameter` retourne `any` dans les libs WebGL. Un garde `typeof` est plus sûr et
supprime le besoin de suppression.

## Correction attendue

```ts
const rawNumUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
const numUniforms = typeof rawNumUniforms === 'number' ? rawNumUniforms : 0;
```

Appliquer le même pattern aux autres retours `any` du même fichier (`getShaderParameter`, etc.)
si nécessaire. Supprimer le commentaire `oxlint-disable`.

## Définition de fait

- Plus de suppression dans le fichier.
- Comportement identique sur un contexte WebGL valide ; fallback sûr si la valeur est absente.
- Tests `glaze` verts.
