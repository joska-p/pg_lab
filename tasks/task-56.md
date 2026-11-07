# task-56 — `packages/glaze/src/react/clockStore.ts` : contrat du null-store

- Fichier : `packages/glaze/src/react/clockStore.ts`
- Statut : `pending`
- Catégorie : `refactor`
- Origine : `task-10`

## Problème

`createNullClockStore()` retourne :

```ts
clock: null as unknown as Clock;
```

Or `ClockStore.clock` est déclaré `Clock` (non-null). Un consommateur peut appeler
`store.clock.play()` et crasher à l’exécution. Ce n’est pas du branding : la suppression cache un
contrat faux.

## Correction attendue

Choisir l’une des options :

1. **Type honnête** : `clock: Clock | null` dans `ClockStore`, et adapter les consommateurs
   (généralement ils passent déjà par les méthodes du store).
2. **Vraie implémentation no-op** : un objet `Clock` dont les méthodes ne font rien et dont
   `time`/`deltaTime` valent zéro. Plus de `null`, plus de cast.

L’option 2 est préférable si `clock` est réellement consommé comme un `Clock` non-null.

## Définition de fait

- Plus de `null as unknown as Clock`.
- Les consommateurs du null-store ne peuvent pas déréférencer un `null`.
- Tests `glaze` verts.
