# task-55 — `packages/glaze/src/core/InputStore.ts` : réduire les suppressions

- Fichier : `packages/glaze/src/core/InputStore.ts`
- Statut : `pending`
- Catégorie : `refactor`
- Origine : `task-02`

## Problème

9 `oxlint-disable-next-line` pour la même cause : les handlers typés (`PointerEvent`,
`WheelEvent`, `KeyboardEvent`, …) sont castés en `EventListener` dans deux tableaux de bindings.
La suppression est correcte, mais répétée 9 fois : le prochain handler copiera le commentaire.

## Correction attendue

Introduire un helper unique qui concentre le cast :

```ts
function bind<K extends keyof WindowEventMap>(
    target: EventTarget,
    type: K,
    handler: (event: WindowEventMap[K]) => void,
    options?: AddEventListenerOptions,
): () => void {
    // Le cast est localisé ici : les handlers sont plus précis que `EventListener`.
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    target.addEventListener(type, handler as EventListener, options);
    return () => target.removeEventListener(type, handler as EventListener, options);
}
```

Adapter les deux tableaux (`#targetBindings`, `#windowBindings`) pour utiliser ce helper, puis
supprimer les 9 commentaires. Le cast `AttachedHandle` reste (branding légitime).

## Définition de fait

- Une seule suppression `EventListener` dans le fichier (ou zéro si le typage le permet).
- Comportement de bind/unbind identique (vérifier `dispose`, `attach`, `detach`).
- Tests `glaze` verts.
