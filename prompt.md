# Prompt de session — assainissement des assertions de type

À réutiliser au début de chaque session. Objectif : supprimer les avertissements
`typescript/no-unsafe-type-assertion` du code de production, sans régression.

## Périmètre

- **Inclus** : `apps/`, `packages/`, `tools/` — code de production uniquement.
- **Exclu** : fichiers `*.test.*` et `*.spec.*`. L’override de `vite.config.ts` (commit
  `29f6c6a`) désactive volontairement la règle dans les tests ; il doit **rester en place**.
  Ne pas le retirer, ne pas le contourner par des suppressions dans les tests.
- La règle reste à `'warn'` dans la config. Ne pas la désactiver globalement, ne pas modifier
  les overrides existants.

## État de référence (7 novembre 2026)

- `vp check --no-fmt --deny-warnings` : **35 warnings / 25 fichiers** de production.
- 53 warnings déjà corrigés dans 21 fichiers (voir `progress.md`).
- 33 warnings supplémentaires existent dans 7 fichiers de test : **hors scope**, grâce à
  l’override.
- `vp check` complet peut échouer d’abord sur le formatage des fichiers du protocole. Formater
  les docs (`vp fmt prompt.md context.md progress.md tasks`) avant la vérification finale, ou
  utiliser `--no-fmt` pendant la boucle.

## Commandes

| Usage                   | Commande                                              |
| ----------------------- | ----------------------------------------------------- |
| Boucle de travail       | `vp check --no-fmt --deny-warnings`                   |
| Un package              | `vp -C packages/<nom> check --no-fmt --deny-warnings` |
| Tests du package touché | `vp -C packages/<nom> test` (ou `vp test <filtre>`)   |
| Formatage des docs      | `vp fmt prompt.md context.md progress.md tasks`       |
| Vérification finale     | `vp check --deny-warnings` (format inclus)            |

`--deny-warnings` est important : sans lui, `vp check` sort en succès avec des warnings.

## Règles d’or

1. **Pas de changement de comportement** dans une tâche de lint. Un refactor fonctionnel
   (listeners, capture pointeur, API publique) est une tâche séparée.
2. **Pas de test affaibli** pour faire passer un correctif.
3. **Pas de suppression pour une donnée externe non validée** (`JSON.parse`, `localStorage`,
   `postMessage`, API). Un garde runtime est obligatoire.
4. **Une suppression = un point non sûr unique**, avec un commentaire qui explique _pourquoi_.
   Pas de suppression recopiée sur chaque appel.
5. **Un `as` sur une union UI/générique n’est pas du branding** : corriger l’inférence
   (`as const`, options typées, composant générique) ou ajouter un garde. Le branding est
   réservé aux types nominaux (`Seed`, `Seconds`, `FrameToken`, …).
6. **Un `as` sémantiquement faux ne se supprime pas** : corriger la signature
   (`shuffleObject`, `ClockStore.clock`, …).
7. Chaque tâche terminée doit avoir un `git diff` revu : pas de config modifiée, pas de test
   modifié, pas de changement de comportement non justifié.

## Grille de décision

| Origine de la valeur                                      | Traitement attendu                                                      |
| --------------------------------------------------------- | ----------------------------------------------------------------------- |
| Clés d’un objet littéral interne (`Object.keys/entries`)  | `typedKeys` partagé (une suppression dans le helper)                    |
| Type nominal / marque                                     | constructeur/factory, une suppression locale                            |
| Donnée externe (JSON, storage, worker, API)               | validation runtime ; suppression interdite                              |
| `any` DOM/WebGL (`getProgramParameter`, `event.data`)     | garde `typeof` ou wrapper typé                                          |
| Callback d’un composant générique (`Select`, `Segmented`) | corriger l’inférence ; au pire une suppression dans le composant        |
| Propriété CSS custom (`--tile-size`, `--panel-height`)    | intersection `CssVars` + `satisfies` ; cast localisé en dernier recours |
| Union discriminée incomplète                              | corriger le type de la donnée, pas le call site                         |

## Workflow

1. **Pré-vol** : `git status --short --untracked-files=all` (aucun changement de config/test
   inattendu, pas de fichier de scratch non suivi) ; `vp check --no-fmt --deny-warnings`. Si le
   formatage bloque, `vp fmt` sur les docs.
2. **Choisir** la première tâche `pending` de `progress.md` et lire `tasks/task-XX.md`.
3. **Localiser** les warnings actuels dans le fichier (les lignes des tâches sont indicatives) :
   relancer le check filtré ou `rg -n " as " <fichier>`.
4. **Corriger** selon la grille. Vérifier qu’aucun nouveau warning/erreur n’apparaît.
5. **Vérifier** : `vp check --no-fmt --deny-warnings` + tests du package touché. Relire le
   `git diff` : pas de régression comportementale.
6. **Mettre à jour** `progress.md` : `pending` → `done`, noter le pattern appliqué et, s’il y a
   une suppression restante, `fichier:ligne` + justification.
7. **Commit** cohérent (un fichier ou un package par commit ; pas de mélange docs/code).
8. **Continuer** jusqu’à zéro warning de production.

## Fin de session

- `vp check --deny-warnings` vert (format inclus).
- `vp test` vert (au moins les packages touchés).
- 0 warning `typescript/no-unsafe-type-assertion` en production.
- Lister les suppressions restantes et leur justification (branding, frontière DOM, CSS custom).
- Signaler les tâches de suivi ouvertes dans `progress.md` (elles ne bloquent pas la clôture).

## Fichiers de référence

- `context.md` — décisions, patterns, pièges connus, état actuel.
- `progress.md` — tâches, états, suivi.
- `tasks/task-XX.md` — une tâche par fichier avec la stratégie recommandée.
