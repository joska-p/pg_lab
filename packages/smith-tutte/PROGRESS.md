# PROGRESS — smith-tutte

> État des lieux mis à jour à la fin de chaque session par l'agent.

---

## 📌 Session en cours

**Statut :** terminée — T01 accompli.  
**Dernière session terminée :** tests unitaires du solveur Kirchhoff (simple, série, parallèle) — 4 tests verts, `vp check --fix` et `vp test` passés.

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

---

## 🔲 Backlog (tâches restantes)

| Tâche | Description                                                     | Statut   |
| ----- | --------------------------------------------------------------- | -------- |
| T01   | Tests unitaires du solveur Kirchhoff (simple, série, parallèle) | Terminée |
| T02   | Moteur géométrique (courants → coordonnées x, y, taille)        | À faire  |
| T03   | Adaptateur (qui devient qui : 1 arête → 2 carrés)               | À faire  |
| T04   | Interpolateur (piloté par la `Clock` de glaze)                  | À faire  |
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
