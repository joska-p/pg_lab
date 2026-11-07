# task-54 — Revue comportementale de `packages/glaze3d/src/controls/orbit.ts`

- Fichier : `packages/glaze3d/src/controls/orbit.ts`
- Statut : `done`
- Catégorie : `review`
- Origine : `task-13`, commit `818e8c8`

## Décision

**Conserver le nouveau comportement** (listeners sur `this.domElement`, `setPointerCapture`,
`pointercancel`), qui est cohérent avec les standards modernes de capture de pointeur.

Le `try/catch` autour de `setPointerCapture` a été restauré (comme avant le commit `818e8c8`)
pour ne pas laisser remonter `NotFoundError` sur un `pointerId` synthétique ou obsolète. C'est
une restauration de robustesse, pas un changement de comportement : le drag continue même si la
capture échoue.

## Preuves

- `vp -C packages/glaze3d test` : 61/61 vert (dont le nouveau test `drag survives
  setPointerCapture throwing NotFoundError`).
- `vp -C packages/glaze3d check --no-fmt --deny-warnings` : 0 warning / 0 erreur sur 30 fichiers.
- `git diff` revu : pas de config modifiée, pas de changement de comportement non justifié.

## Suppressions restantes

Aucune assertion `as` dans ce fichier ; le seul garde est le `try/catch` ci-dessus.
