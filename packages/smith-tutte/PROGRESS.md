# PROGRESS — smith-tutte

> État des lieux mis à jour à la fin de chaque session par l'agent.

---

## 📌 Session en cours

**Statut :** terminée — T01 à T04 accomplis.  
**Dernière session terminée :** interpolateur piloté par la `Clock` de glaze (positions et tailles interpolées pour les trois cas de T01) — 16 tests verts, `vp check --fix` et `vp test` passés (29 tests au total).

---

## ✅ Fait

- [x] État des lieux du package (code, docs, git)
- [x] Étape 1 — Contrat central netlist :
    - `src/engine/core/netlist.ts` (types `Netlist`, `NetlistNode`, `NetlistEdge`, `validateNetlist`, `buildGraphFromNetlist`, `parseNetlist`)
    - `public/netlists/simple-edge.json`
    - `public/netlists/two-series.json`
    - `public/netlists/two-parallel.json`
    - `Graph.ts` : ajout de `getNode(id)` et `getEdge(id)`
    - `tsc --noEmit` : propre
- [x] T01 — Tests unitaires du solveur Kirchhoff :
    - `src/engine/solver/KirchhoffSolver.test.ts` (arête simple, série, parallèle, topologie non reconnue)
    - `vp check --fix` : propre
    - `vp test` : 4 tests verts
- [x] T02 — Moteur géométrique (courants → coordonnées x, y, taille) :
    - `src/engine/geometry/geometryEngine.ts` (`computeGeometry` : positions nœuds dérivées des potentiels, tailles d'arêtes dérivées des courants, zéro géométrie en dur)
    - `src/engine/geometry/geometryEngine.test.ts` (arête simple, série, parallèle, graphe non résolu)
    - `vp check --fix` : propre
    - `vp test` : 4 tests verts
- [x] T03 — Adaptateur (qui devient qui : 1 arête → 2 carrés) :
    - `src/engine/adapter/adapter.ts` (`adapt` : identité des carrés, arête d'origine, potentiels associés ; zéro géométrie en dur, pas de calcul de géométrie)
    - `src/engine/adapter/adapter.test.ts` (arête simple, série, parallèle, unicité des ids de carrés, graphe non résolu rejeté)
    - `vp check --fix` : propre
    - `vp test` : 5 tests verts (13 au total avec T01 et T02)

- [x] T04 — Interpolateur (piloté par la `Clock` de glaze) :
    - `src/engine/interpolator/interpolator.ts` (`lerp`, fonctions d'easing, `interpolateGeometry` : positions x, y et tailles interpolées entre deux états géométriques ; nombres purs, zéro géométrie en dur, ni dépendance adaptateur/renderer ni lecture directe de la `Clock`)
    - `src/engine/interpolator/interpolator.test.ts` (lerp, easing, arête simple, série, parallèle, intégrité des ids, rejet des états aux ids divergents et de la progression non finie)
    - `vp check --fix` : propre
    - `vp test` : 29 tests verts au total (T01 à T04)

---

## 🔲 Backlog (tâches restantes)

| Tâche | Description                                                     | Statut   |
| ----- | --------------------------------------------------------------- | -------- |
| T01   | Tests unitaires du solveur Kirchhoff (simple, série, parallèle) | Terminée |
| T02   | Moteur géométrique (courants → coordonnées x, y, taille)        | Terminée |
| T03   | Adaptateur (qui devient qui : 1 arête → 2 carrés)               | Terminée |
| T04   | Interpolateur (piloté par la `Clock` de glaze)                  | Terminée |
| T05   | Renderer minimal dans `App.tsx`                                 | À faire  |

---

## 📐 Convention de commit

Format : `<type>(<scope>): <description>`

- **Types** : `feat`, `fix`, `refactor`, `docs`, `test`, `chore`
- **Scope** : `smith-tutte` (nom du package)
- **Exemples vus dans le repo** :
    - `feat(randomart-core): trois corrections mineures (...)`
    - `refactor(randomart-ui): doc shouldRender dans RandomArtCanvas.tsx`
    - `fix(randomart-core): ...`

**Exemple pour T01 :** `feat(smith-tutte): tests unitaires solveur Kirchhoff (simple, série, parallèle)`

---

## 📄 Template de nouvelle tâche (`tasks/TXX.md`)

```markdown
# TXX — Titre de la tâche

## Objectif

Une phrase sur ce qu'il faut accomplir.

## Critères de validation

- Liste à puces de ce qui doit être fait et vérifié.
- `vp check --fix` passe sans erreur.
- `vp test` passe (tous les tests verts).

## Contraintes

- Ce qui est autorisé / interdit de modifier.
- Scope strict de la tâche.

## Livrables

- Fichiers créés / modifiés.
- Mise à jour de `PROGRESS.md`.
- Commit de fin de session.
```

---

## 🏁 Checklist de fin de session (obligatoire)

Avant de déclarer la session terminée, l'agent doit :

- [ ] Lancer `vp check --fix` (format, lint, type-check) — doit passer sans erreur.
- [ ] Lancer `vp test` — tous les tests doivent être verts.
- [ ] Mettre à jour `PROGRESS.md` :
    - Cocher les tâches terminées dans "✅ Fait".
    - Déplacer la tâche terminée du backlog vers "Fait".
    - Ajouter la prochaine tâche au backlog si nécessaire.
- [ ] Créer le fichier `tasks/T(X+1).md` pour la prochaine tâche (si le backlog n'est pas vide).
- [ ] Proposer un message de commit suivant la convention ci-dessus.
- [ ] Committer tous les changements (fichiers de tâche, `PROGRESS.md`, code, tests).
