---
title: 'Juger une réécriture : décomposer le delta de lignes et vérifier la parité avant de supprimer l''ancien'
date: 2026-11-02
type: rule
tags: [architecture, migration, code-review, maintenance]

**Contexte :** Comparaison v1 monolithe (`randomart`, 9 370 l.) vs v2 éclatée (`randomart-vm` + `randomart-ui`, 2 826 l.) : la v2 semblait « 3× plus petite ». Fallait trancher : code mort en v1, ou fonctionnalités perdues en v2 ?

**Corps :**
Règle : une réécriture plus courte ne prouve rien tant que le delta n'est pas décomposé et la parité prouvée.
1. **Décomposer le delta par catégorie** (tests / tooling / commentaires / condensation réelle du prod code). Ici : 73 % = tests + dataset + documentation, 11 % = condensation saine ⇒ **pas du code mort**. Piège : `find | xargs wc -l` fausse les comptes (xargs scinde) — sommer avec awk.
2. **Matrice de parité feature par feature, avec preuves** : GLSL comparé op par op, formats de sérialisation, seedage RNG, presets, UI. « Le portage est fait » ≠ « la parité est atteinte ».
3. **Rejouabilité** : si le seedage RNG ou les plages de params changent, même seed ≠ même image entre versions. Bump + **utiliser** une version de générateur (pas juste l'exporter) et documenter la non-rejouabilité.
4. **Ne pas supprimer l'ancien package avant parité des features de prod** : un package orphelin (plus importé) reste vivant s'il porte du tooling unique (ici le dataset). Inversement, le laisser vivre = deux catalogues/grammaires/générateurs/registres de couleurs à maintenir.
5. **Gotcha structurel** : un monolithe sans API publique (imports profonds ×27 depuis l'UI) masque ses frontières ; l'éclatement en package les force naturellement — c'est l'argument architectural décisif pour la v2, pas le nombre de lignes.

## **Lien codebase :** `packages/randomart` vs `packages/randomart-vm` / `packages/randomart-ui` (commit `77373f2`, `797d6eb`)
