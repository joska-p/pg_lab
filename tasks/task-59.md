# task-59 — Sequencer : une seule source de vérité pour les paramètres

- Fichiers : `packages/sequencer/src/core/layers/*.ts` (12 fichiers)
- Statut : `pending`
- Catégorie : `refactor`
- Origine : `task-15` à `task-25`

## Problème

Les guards ajoutés répètent les defaults des descripteurs :

```ts
const lineWidth = typeof params.lineWidth === 'number' ? params.lineWidth : 1;
const alpha = typeof params.alpha === 'number' ? params.alpha : 0.15;
```

Le default existe déjà dans `{ type: 'number', default: 1 }`. Deux sources de vérité peuvent
diverger, et chaque layer duplique 2 à 6 guards.

## Correction attendue

Choisir l’une des options :

1. **Helper partagé** : `readNumberParams(params, descriptors)` qui lit les defaults des
   descripteurs et applique un garde `typeof` une seule fois.
2. **Typage à la frontière** : typer `VisualLayer.draw` en fonction de ses descripteurs, ou
   valider les params au moment où ils entrent dans le layer, pour que `params.lineWidth` soit
   `number` sans guard dans chaque draw.

L’option 2 est préférable si les paramètres sont déjà validés par les contrôles.

## Définition de fait

- Un seul endroit contient les defaults et les guards.
- Les 12 layers utilisent ce mécanisme.
- Tests `sequencer` verts ; rendu identique.
