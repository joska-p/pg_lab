# CONTEXT — Tutte & Smith

> Ce fichier est la boussole du projet. Il décrit l'état actuel des lieux et les règles d'or. Pour l'historique détaillé des décisions, voir le dossier `/docs`.

## 1. Le "Pourquoi" (En 2 lignes)

Projet de programmation récréative. Explorer et visualiser le lien historique entre réseaux électriques (lois de Kirchhoff) et pavages géométriques (carrés). Le plaisir est dans la construction d'outils et l'exploration mathématique/visuelle, pas dans le résultat final.

## 2. La Stack Technique

- **Langage** : TypeScript.
- **Rendu & Horloge** : `@repo/glaze` (lib interne). Gère le world-space, le pan/zoom, et fournit une `Clock` (`progress` linéaire mis à jour à chaque frame).
- **Calcul** : Solveur Kirchhoff maison (pas de lib externe pour garder le contrôle total).

## 3. L'Architecture (Le flux de données)

Le cœur du projet est un flux unidirectionnel strict :

`JSON Netlist` ➔ `Solveur` ➔ `Moteur Géométrique` ➔ `Adaptateur` ➔ `Interpolateur` ➔ `Renderers (glaze)`

- **Netlist JSON** : L'unique source de vérité (nœuds, arêtes, bornes source/puits).
- **Solveur** : Mathématiques pures. Prend le JSON, retourne potentiels et courants.
- **Moteur Géométrique** : Traduit les courants en coordonnées (x, y, taille).
- **Adaptateur** : Le "chef de chorégraphie". Détermine "qui devient qui" lors d'une transition (gestion des apparitions/disparitions de carrés).
- **Interpolateur** : Le mathématicien bête. Prend les paires de l'adaptateur + le temps de la `Clock`, et calcule les coordonnées exactes image par image.
- **Renderers** : Dessinent le résultat via `glaze` (`surface.rect`, `surface.line`).

## 4. État d'avancement (Slice 1)

- **Objectif actuel** : Réussir l'animation de test la plus simple (1 arête qui s'étire et se sépare en 2 carrés).
- **Ce qui existe** : Format JSON en cours de stabilisation, `glaze` intégré, `Clock` disponible.
- **Ce qui est en cours** : Mise en place de l'Adaptateur (à la main pour ce cas précis) et de l'Interpolateur.

## 5. Règles d'or & Décisions prises

- **Zéro géométrie codée à la main** : Tout découle du calcul des courants/potentiels.
- **Séparation des rôles** : L'Adaptateur gère l'identité des formes ("qui devient qui"), l'Interpolateur gère la mathématique ("où et de quelle taille"). Ne pas mélanger les deux.
- **Source de vérité unique** : Si le graphe change, le JSON change, et les vues (pavage/circuit) se recalculent et se synchronisent à partir de là.

## 6. Questions ouvertes (À trancher plus tard)

- Résistances explicites ou toutes unitaires dans le JSON ?
- Le Moteur Géométrique doit-il exposer une "trace de filiation" (quel carré vient de quel parent) pour aider l'Adaptateur, ou l'Adaptateur doit-il le déduire lui-même ?
- Apparition/disparition de carrés : instantané ou progressif (fade) ?
- À partir de quelle taille de maillage basculer de `CpuSurface` (Canvas2D) à `GpuSurface` (WebGL2) ?
