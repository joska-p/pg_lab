# task-54 — Revue comportementale de `packages/glaze3d/src/controls/orbit.ts`

- Fichier : `packages/glaze3d/src/controls/orbit.ts`
- Statut : `pending`
- Catégorie : `review`
- Origine : `task-13`, commit `818e8c8`

## Problème

Le correctif de lint a changé le comportement, pas seulement le typage :

- listeners `pointermove` / `pointerup` déplacés de `window` vers `this.domElement` ;
- suppression du `try/catch` autour de `setPointerCapture` ;
- ajout de `pointercancel` ;
- tests modifiés pour suivre le nouveau chemin (le chemin `window` n’est plus testé).

Risques :

- `setPointerCapture` peut lever `NotFoundError` avec un `pointerId` synthétique ou obsolète ;
- le drag s’arrête différemment quand le pointeur quitte l’élément ;
- les tests ne couvrent plus le comportement précédent.

## Décision attendue

Choisir explicitement :

1. **Conserver le nouveau comportement** : le documenter dans le commit/PR, vérifier le rendu
   réel dans un navigateur, et garder un test qui couvre la sortie de l’élément.
2. **Revenir au comportement précédent** : listeners sur `window`, `try/catch` autour de
   `setPointerCapture`, et supprimer l’assertion autrement (`globalThis.window` est déjà typé,
   ou petit wrapper local).

Dans les deux cas, la correction de lint ne doit pas être le prétexte à un refactor fonctionnel.

## Définition de fait

- Décision écrite dans la tâche ou le commit.
- Tests `glaze3d` verts et couvrant le chemin conservé.
- Aucun `as` non justifié ; aucune régression de drag.
