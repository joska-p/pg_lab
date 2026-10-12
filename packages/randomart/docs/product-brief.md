# Product brief — Random Art

Document de cadrage · version 0.3

Ce document cadre l'intention. Le vocabulaire est défini dans `glossary.md` et les décisions techniques dans `architecture.md`, qui font foi en cas de divergence.

## 1. Vision

Un atelier de génération d'art algorithmique, pour jouer : des expressions mathématiques produisent des images abstraites, fixes ou animées, qu'on peut explorer, comprendre et conserver.

Le projet s'appuie sur les principes de Random Art, avec une architecture qui permette d'évoluer vers un environnement plus général d'expressions visuelles.

## 2. Intention principale

L'expérience centrale n'est pas de dessiner une image, mais d'explorer un espace de possibilités mathématiques.

On doit pouvoir :

- Générer une image à partir d'une seed et d'une grammaire.
- Explorer des variations en changeant la seed, la grammaire ou ses paramètres.
- Randomiser les grammaires elles-mêmes pour découvrir de nouveaux comportements visuels.
- Comprendre une image en inspectant l'expression qui la produit.
- Voir l'image s'animer si la grammaire contient des opérateurs de temps.
- Sauvegarder les découvertes (grammaires comme œuvres) et les reprendre.
- À terme, composer et modifier des expressions à la main.

La génération aléatoire est le point d'entrée prioritaire. L'édition manuelle est une extension, pas une condition.

## 3. Le système de génération

Une **grammaire** réunit trois choses indépendantes :

- **Vocabulaire** : les opérateurs autorisés, terminaux compris.
- **Poids** : la fréquence relative de chaque opérateur.
- **Contraintes** : profondeur minimale des feuilles, profondeur maximale et nombre de nœuds maximal par canal.

Une **seed** choisit une expression précise dans une grammaire.

Une grammaire peut être fixe, partiellement randomisée ou entièrement randomisée.

## 4. La randomisation

Je la considère comme une fonctionnalité importante, parce que j'explorerai plus les grammaires que les seeds.

| Opération             | Ce qui change        | Ce qui reste                      |
| --------------------- | -------------------- | --------------------------------- |
| Nouvelle image        | la seed              | la grammaire                      |
| Nouvelle distribution | les poids            | le vocabulaire et les contraintes |
| Nouveau vocabulaire   | le vocabulaire       | les contraintes                   |
| Nouvelle grammaire    | plusieurs dimensions | la validité                       |

Deux boucles d'exploration :

1. Trouver une image intéressante dans une grammaire.
2. Trouver une grammaire intéressante parmi les grammaires possibles.

Les grammaires doivent donc pouvoir être sauvegardées et comparées, pas seulement les images. En v1, une grammaire s'exporte et s'importe seule (fichier versionné) et fait partie de la provenance d'une œuvre ; la liste de grammaires sauvegardées et leur comparaison viennent en v2.

## 5. Complexité et qualité

La complexité mathématique n'est pas l'intérêt visuel. La v1 ne prétend pas mesurer la beauté : elle permet d'observer, de comparer et de conserver.

Les contrôles de v1 sont simples : profondeur min/max et nombre de nœuds max. D'autres métriques viendront si le besoin se confirme.

## 6. Modèle de l'œuvre

Une œuvre conserve ce qu'il faut pour la retrouver : l'expression, et en provenance optionnelle la grammaire et la seed, plus les paramètres de rendu et une version de format.

La reproductibilité exacte n'est pas critique : deux GPU peuvent différer légèrement, et une seed ne vaut que pour une version donnée du générateur. L'expression exportée est la référence.

L'expression peut être modifiée à la main sans perdre la fonction d'origine.

## 7. Principes techniques

- **GPU-first** : le rendu est en GLSL. Il n'y a pas d'évaluateur CPU ; le GLSL est la sémantique des opérateurs.
- **Opérateurs honnêtes** : chacun garantit par construction une sortie dans `[-1, 1]`.
- **Le temps fait partie du modèle** : une expression est une fonction de `(x, y, t)`. La phase boucle, donc les animations bouclent.
- **Compilateur** : il construit un préambule à partir des dépendances, gère les contextes de coordonnées (déformations) et partage les sous-expressions communes, avec des mesures plutôt qu'une simple déduplication de texte.
- **Post-traitement** : une passe finale du renderer, ajoutée plus tard, sans effet sur le catalogue ni le générateur.
- **Extensibilité** : nouveaux opérateurs, bruit, déformations et nouveaux types ne doivent pas imposer de refonte du cœur.

Plateforme : TypeScript, React, Zustand, WebGL.

## 8. Hors périmètre initial

- Un éditeur graphique généraliste.
- Un langage de shaders arbitraires.
- Un système de programmation visuelle universel.
- Un moteur 3D.
- Un algorithme qui prétend identifier les plus belles images.
- Un évaluateur CPU.

Le socle doit d'abord démontrer qu'on peut générer, retrouver, inspecter et exporter des images de Random Art de manière fiable.
