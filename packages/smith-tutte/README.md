# Architecture & Théorie : Du Mesh 3D au _Squared Rectangle_

## 1. Vue d'Ensemble du Concept

L'objectif de ce projet est de transformer un objet 3D polyédrique (ou un graphe planaire) en un pavage rectangulaire (ou carré) parfait. Ce pont repose sur l'équivalence fondamentale entre les **réseaux électriques de Kirchhoff**, la **théorie des graphes planaires** et les **polyèdres convexes 3D**.

```
[ Mesh 3D / Polyèdre ]
         │ (Dualité + 3-connexité / Théorème de Steinitz)
         ▼
[ Graphe Planaire 3-connexe ]
         │ (Équations de Kirchhoff & Lois des Nœuds)
         ▼
[ Diagramme de Smith (Layout IR) ]
         │ (Calcul des coordonnées absolues)
         ▼
[ Rendu 2D (SVG / Canvas) ]
```

## 2. Le Pipeline Algorithmique en 4 Étapes

### Étape 1 : Modélisation Graphique et Choix des Pôles

- **Entrée :** Un mesh 3D polyédrique (ex: tétraèdre, octaèdre, ou mesh planaire 3-connexe).

- **Opérations :**

    - Extraire le **graphe dual** ou le graphe d'arêtes G = (V, E).

    - Sélectionner deux nœuds ou deux faces spécifiques pour jouer le rôle de la **Source** (S, entrée du courant) et du **Puits** (T, sortie du courant).

    - Attribuer une conductance w_(i,j) > 0 à chaque arête (par défaut w_(i,j) = 1).

### Étape 2 : Résolution du Système Laplacien (Kirchhoff)

- **Opération :** Calculer le potentiel électrique V_i à chaque sommet i en résolvant la loi des nœuds de Kirchhoff :

    Somme pour tous les voisins j de i : w_(i,j) * (V_i - V_j) = 0 (pour tout sommet i différent de S et T)

- **Fixation des conditions aux limites :** V_S = 1 et V_T = 0.

- **Formulation matricielle :** L * V = B, où L est la matrice laplacienne du graphe modifiée pour inclure les conditions aux limites.

### Étape 3 : Calcul des Flux & Coordonnées (Diagramme de Smith)

- Pour chaque arête e = (i, j) orientée selon le courant descendant (V_i > V_j) :

    - **Chute de tension (Hauteur du rectangle) :** h_e = V_i - V_j

    - **Courant électrique (Largeur du rectangle) :** w_e = w_(i,j) * h_e

    - _Note :_ Si w_(i,j) = 1, alors h_e = w_e, ce qui garantit que l'élément obtenu est un **carré**.

- **Intégration spatiale :** Les coordonnées (x, y) de chaque rectangle sont obtenues par accumulation des courants (axe X) et des tensions (axe Y).

### Étape 4 : Construction de l'IR et Rendu

- Génération de la structure de données `LayoutIR` découpée en blocs positionnés {x, y, width, height}.

- Rendu vectoriel via SVG ou Canvas2D.

## 3. Example de modèle de données TypeScript (IR Cible)

```typescript
export interface BlockNode {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    color?: string;
}

export interface LayoutIR {
    totalWidth: number;
    totalHeight: number;
    blocks: BlockNode[];
}

export interface Vector3D {
    x: number;
    y: number;
    z: number;
}

export interface Mesh3D {
    vertices: Vector3D[];
    faces: number[][]; // Indices des sommets composant chaque face
}
```

## 4. Références & Littérature Académique

1. **L'Article Fondateur (Brooks, Smith, Stone, Tutte - 1940)**

    - **Titre :** _"The Dissection of Rectangles into Squares"_ (Duke Mathematical Journal).

    - **Apport :** Établit le lien historique entre les pavages de carrés et la théorie des circuits électriques (lois de Kirchhoff).

2. **Théorème de Steinitz & Embedding de Tutte**

    - **Steinitz (1910) :** Tout graphe planaire 3-connexe est le squelette 1D d'un polyèdre convexe en 3D.

    - **Tutte (1963) - _"How to Draw a Graph"_ :** Algorithme du barycentre (_Barycentric Embedding_) pour obtenir une représentation planaire convexe d'un graphe sans croisement d'arêtes.

3. **Applications en Génération Visuelle**

    - **Perrig, A. (1999) :** _"Random hash visualization" / Visual Hashes_. Utilisation de pavages rectangulaires et de grammaires d'arbres pour créer des identifiants visuels uniques à partir de hashs ou de données brutes.

---

## Différentes directions possibles

### Direction 1 : Le Visualiseur Démonstrateur (Pédagogique / Interactif)

- **Le concept :** Une application interactive où tu affiches le mesh 3D à gauche et le carré/rectangle découpé à droite.
- **L'expérience :** Quand tu cliques sur une face ou une arête du mesh 3D (ou quand tu fais tourner le polyèdre), le rectangle correspondant s'illumine dans le pavage 2D. Tu peux changer la Source et le Puits en direct pour voir le découpage se métamorphoser sous tes yeux.
- **Pourquoi c'est cool :** C'est ultra satisfaisant visuellement et ça fait un excellent projet de portfolio orienté maths/moteur graphique.

---

### Direction 2 : Le Générateur d'Art Procédural / Identifiants Visuels (Randomart)

- **Le concept :** Tu n'affiches pas la 3D. Tu utilises le pipeline comme un **moteur de rendu esthétique** (style Mondrian / Bauhaus / Guilloché).
- **L'expérience :** L'utilisateur entre une chaîne de caractères (ex: un hash Git, une adresse Ethereum, ou du texte) ou clique sur "Générer". L'application crée un graphe/mesh pseudo-aléatoire basé sur ce hash, résout Kirchhoff, et applique des palettes de couleurs, des textures Canvas ou des shaders GLSL.
- **Pourquoi c'est cool :** Tu te concentres sur le rendu graphique 2D, les animations de transition, l'export SVG/PNG, et le côté purement créatif.

---

### Direction 3 : Le Studio d'Édition Graphique / Layout Engine

- **Le concept :** Tu utilises le "Squared Rectangle" comme un système automatique de mise en page (UI Layout Engine).
- **L'expérience :** L'utilisateur ajoute des blocs ou règle des contraintes, et l'algorithme calcule instantanément le seul pavage parfait qui respecte la topologie demandée.
- **Pourquoi c me cool :** C'est un outil très concret avec une vraie utilité applicative (dashboarding, galeries d'images responsives et harmonieuses).

---
