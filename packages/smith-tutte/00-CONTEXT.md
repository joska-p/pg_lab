# 00-CONTEXT — smith-tutte

> Ce fichier est figé pour la durée de la session. Il décrit l'état actuel des lieux et les règles d'or. Ne pas le modifier en cours de session.

## 1. Le "Pourquoi" (En 2 lignes)

Projet de programmation récréative. Explorer et visualiser le lien historique entre réseaux électriques (lois de Kirchhoff) et pavages géométriques (carrés). Le plaisir est dans la construction d'outils et l'exploration mathématique/visuelle, pas dans le résultat final.

## 2. La Stack Technique

- **Langage** : TypeScript.
- **Rendu & Horloge** : `@repo/glaze` (lib interne). Gère le world-space, le pan/zoom, et fournit une `Clock` (`progress` linéaire mis à jour à chaque frame).
- **Calcul** : Solveur Kirchhoff maison (pas de lib externe pour garder le contrôle total).
- **Tests** : pas encore de framework de test installé.

## 3. L'Architecture (Le flux de données)

`JSON Netlist` ➔ `Solveur` ➔ `Moteur Géométrique` ➔ `Adaptateur` ➔ `Interpolateur` ➔ `Renderers (glaze)`

## 4. État d'avancement

- **Slice 1 en cours** : animation de test la plus simple (1 arête qui s'étire et se sépare en 2 carrés).
- **Étape 1 terminée** : format JSON du netlist stabilisé (types + validation + build `Graph` + 3 fichiers d'exemple dans `public/netlists/`).
- **Étape 2 à faire** : tests unitaires du solveur Kirchhoff (cas simple, série, parallèle).
- `App.tsx` retourne encore `null` — aucun rendu n'est branché.

## 5. Règles d'or

- **Zéro géométrie codée à la main** : tout découle du calcul des courants/potentiels.
- **Séparation des rôles** : l'Adaptateur gère l'identité des formes ("qui devient qui"), l'Interpolateur gère la mathématique ("où et de quelle taille").
- **Source de vérité unique** : si le graphe change, le JSON change, et les vues se recalculent à partir de là.
- **Le solveur ne résout que les cas déjà testés** : un graphe plus complexe doit échouer bruyamment plutôt que produire un résultat non vérifié.
