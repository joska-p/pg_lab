# Document de Travail — Projet Tutte & Smith

> **Statut :** Document de travail initial / Vision produit.
> **Principe de mise à jour :** Ce document fixe l'intention et la roadmap de haut niveau. Il n'a pas vocation à décrire l'implémentation technique, qui est documentée au fur et à mesure du développement réel.

---

## 1. Vision et Objectifs

Le projet **Tutte & Smith** vise à explorer et visualiser l'analogie historique (découverte par Brooks, Smith, Stone et Tutte dans les années 1930) entre **le pavage géométrique de surfaces par des carrés** et **les réseaux électriques de résistances**.

### Objectif principal

Fournir une expérience visuelle interactive montrant côte à côte :

1. **La vue géométrique :** Le pavage d'une surface fermée (rectangle ou carré) découpée en sub-carrés de grandeurs calculées.
2. **La vue topologique / circuit :** Le réseau électrique dual associé (lignes de potentiel et branches de courant).

---

## 2. Principes Modélisation & Génération

1. **Génération procédurale (Physique du réseau) :**

- La géométrie (position et taille de chaque carré) n'est jamais saisie à la main ni dessinée arbitramiment.

- Elle dérive strictement des lois de Kirchhoff appliquées à un graphe de résistances : le courant traversant une branche détermine la taille du carré correspondant.

2. **Source unique de vérité :**

- Un seul modèle de graphe enrichi contient l'ensemble des données (potentiels, courants, connexions).

- Les deux vues (Pavage géométrique et Schéma électrique) sont des représentations synchronisées dérivées de ce modèle unique.

3. **Indépendance visuelle :**

- La logique de calcul et le moteur mathématique sont strictement séparés du rendu graphique ou du support d'affichage.

---

## 3. Feuille de Route (Roadmap par Slices)

La stratégie retenue est le **vertical slice** : valider la chaîne complète (du graphe au rendu) étape par étape, en commençant par des formes géométriques simples.

```text
 ┌───────────────────────────┐
 │   Slice 1 : Fondations    │ ──> Valider le solveur sur des topologies simples
 │    (Squared Rectangle)    │     jusqu'au pavage rectangulaire.
 └─────────────┬─────────────┘
               ▼
 ┌───────────────────────────┐
 │ Slice 2 : Carré Parfait   │ ──> Introduire la topologie du Pont de Wheatstone
 │     (Squared Square)      │     pour obtenir un carré parfait (carrés uniques).
 └─────────────┬─────────────┘
               ▼
 ┌───────────────────────────┐
 │   Slice 3 : Dualité &     │ ──> Affichage côte à côte du circuit électrique
 │       Interactions        │     et support des mutations dynamiques (temps réel).
 └─────────────┬─────────────┘
               ▼
 ┌───────────────────────────┐
 │   Slice 4 : Exploration   │ ──> Import de maillages 3D / surfaces et
 │        Avancée            │     langage de description dédié (DSL).
 └───────────────────────────┘

```

---

### Slice 1 — Le Rectangle Parfait (Squared Rectangle)

- **Objectif :** Obtenir un premier rendu visuel statique d'un pavage rectangulaire à partir d'un graphe simple.

- **Jalons de validation :**

1. Validation du calcul des tensions/courants sur des configurations simples (série, parallèle).

2. Calcul automatique des coordonnées géométriques (x, y, largeur, hauteur).

3. Rendu visuel d'un **squared rectangle** (rectangle pavé par des carrés).

- **Critère de succès :** Affichage exact et vérifié par calculs théoriques d'un pavage rectangulaire basique.

### Slice 2 — Le Carré Parfait (Squared Square)

- **Objectif :** Atteindre la symétrie brisée nécessaire au découpage d'un grand carré en carrés tous de tailles distinctes.
- **Jalons de validation :**

1. Prise en charge de la structure minimale non-guillotine (pont de Wheatstone).

2. Résolution et génération géométrique d'un carré parfait (ex: cas d'école à 21 carrés).

- **Critère de succès :** Pavage d'un carré parfait affiché à l'écran et validé par rapport à la littérature.

### Slice 3 — Vue Duale et Interactions

- **Objectif :** Proposer la double visualisation et la manipulation en temps réel.

- **Jalons de validation :**

1. Implémentation du rendu du schéma électrique à partir du même graphe.

2. Manipulation de la vue (déplacement, zoom) et navigation bidirectionnelle (sélectionner un carré met en surbrillance la branche du circuit).

3. Support des mutations simples sur le graphe (subdivision de branches) recalculant instantanément le pavage.

### Slice 4 — Extensions (Importation & DSL)

- **Objectif :** Diversifier la génération de topologies et faciliter la saisie.

- **Jalons de validation :**

1. Import de maillages 3D fermés (ex: issus de Blender) découpés et aplatis en graphes planaires pour générer des variations complexes.

2. Langage de description (DSL / Netlist) pour formaliser et échanger des topologies de graphes.
