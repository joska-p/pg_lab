# task-58 — `typedKeys` : un seul helper partagé

- Fichiers : `packages/randomart-ui/src/utils/object.ts`, `apps/playground/src/utils/object.ts`
- Statut : `pending`
- Catégorie : `refactor`
- Origine : `task-26`, `task-27`, `task-28`, `task-32` à `task-37`, `task-43`

## Problème

`typedKeys` est dupliqué dans deux packages. Les tâches `keys` vont en avoir besoin dans
`randomart-core`, `art-canvas`, `fracture`, `palette`, etc. Créer une copie par package irait
contre la SSOT.

## Correction attendue

Choisir un emplacement unique :

- **Option recommandée** : un petit package pur TypeScript (ex. `packages/ts-utils`) exportant
  `typedKeys`, sans dépendance React, ajouté au workspace et aux `package.json` concernés.
- **Option minimale** : garder un helper dans `packages/ui` pour les apps React et un helper
  local dans `randomart-core` (2 copies maximum, documentées).

Améliorer la signature au passage :

```ts
export function typedKeys<T extends object>(obj: T): (keyof T & string)[] {
    // Safe : utilisé uniquement sur des objets littéraux dont on maîtrise les clés.
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    return Object.keys(obj) as (keyof T & string)[];
}
```

`(keyof T & string)` évite de promettre des clés symboles que `Object.keys` ne retourne pas.

## Définition de fait

- Plus de deux copies de `typedKeys`.
- Les consommateurs importent le helper partagé.
- `vp check --no-fmt --deny-warnings` et tests verts.
