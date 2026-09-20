# glaze3d — Use cases

Deux familles de use cases, cohérentes avec le double objectif : ceux du
produit (registre + viewer de molécules) et ceux de la lib (ce que
`glaze3d` doit permettre de faire indépendamment du viewer). Les specs,
une fois écrites, devront couvrir chaque use case listé ici.

## A. Use cases produit — registre & viewer de molécules

**A1. Parcourir le registre**
En tant qu'utilisateur, je vois une liste (ou un tirage aléatoire, comme
aujourd'hui) de molécules disponibles, avec leur nom affiché.

**A2. Visualiser une molécule en 3D**
En tant qu'utilisateur, je vois la molécule sélectionnée rendue en 3D :
atomes en sphères colorées (palette CPK), liaisons en cylindres, éclairage
qui donne du volume (pas un rendu plat).

**A3. Interagir avec la vue**
En tant qu'utilisateur, je peux faire tourner la molécule à la souris/tactile
(drag), et sinon elle tourne automatiquement toute seule (autoRotate). Le
mouvement doit être fluide (damping), pas de saccades ni de rotation qui
s'arrête brutalement.

**A4. Changer de molécule**
En tant qu'utilisateur, je peux charger une molécule différente (aujourd'hui :
tirage aléatoire au chargement + drop d'un fichier `.mol`/`.sdf`). L'ancienne
géométrie 3D doit être proprement remplacée (pas de fuite mémoire, pas
d'atomes fantômes de l'ancienne molécule).

**A5. Molécule invalide ou trop grande**
En tant qu'utilisateur qui drop un fichier avec des éléments chimiques non
supportés (pas de facteur de forme connu) ou trop d'atomes (> MAX_ATOMS), je
vois le viewer refuser proprement le changement (garder l'ancienne molécule
affichée) plutôt que planter.

**A6. Cohabitation avec le rendu WebGL2 raw**
En tant que système, le rendu 3D de la molécule (glaze3d) doit exposer une
caméra dont l'orientation/position peut être lue frame par frame par un code
totalement indépendant (le shader du pattern de diffraction), sans que
glaze3d n'ait besoin de connaître ce second système. C'est un point
d'intégration, pas juste un rendu isolé.

## B. Use cases lib — ce que glaze3d doit permettre indépendamment du viewer

**B1. Construire une scène simple**
En tant que développeur utilisant glaze3d, je peux créer une scène, y ajouter
des objets (meshes) et des lumières, sans avoir à gérer moi-même les matrices
de transform à la main.

**B2. Composer des transforms hiérarchiques**
En tant que développeur, je peux attacher un objet à un autre (ex: une
lumière à une caméra, un mesh à un groupe) et que sa position/orientation
world soit calculée automatiquement à partir de la hiérarchie.

**B3. Définir une caméra et la faire bouger**
En tant que développeur, je peux créer une caméra perspective, la positionner,
et récupérer à tout moment sa matrice de vue et sa matrice de projection pour
les utiliser ailleurs que dans le renderer (cf. A6).

**B4. Afficher des formes de base sans écrire de géométrie à la main**
En tant que développeur, je peux instancier une sphère ou un cylindre avec
quelques paramètres (rayon, segments / rayon haut-bas, hauteur) sans générer
moi-même les vertices/normales/indices.

**B5. Éclairage crédible sans écrire de shader**
En tant que développeur, je peux appliquer un matériau Phong à un mesh et
ajouter plusieurs lumières (ambient + directional) sans écrire de GLSL, tout
en gardant la possibilité d'écrire un shader custom si le matériau fourni ne
suffit pas (échappatoire, comme `createProgram()` dans glaze).

**B6. S'intégrer dans un canvas existant**
En tant que développeur, je peux faire pointer le renderer glaze3d sur un
`<canvas>` déjà présent dans la page (pas créé par la lib), avec fond
transparent et gestion resize/pixel-ratio — cohérent avec le fonctionnement
actuel de `GpuSurface` dans glaze.

**B7. Contrôle orbital réutilisable**
En tant que développeur, je peux brancher un orbit control sur une caméra et
un élément DOM, avec des options simples (activer/désactiver pan, zoom,
autoRotate, damping) sans avoir à écrire la gestion des événements pointeur
moi-même.

**B8. Un deuxième cas d'usage plus tard**
Pas un use case actif aujourd'hui, mais une contrainte : les décisions
d'API prises pour B1-B7 ne doivent pas supposer implicitement "une seule
molécule, une seule scène, un seul canvas". Si ça reste vrai sans effort
particulier, tant mieux ; si ça demande de la sur-ingénierie, on ne le fait
pas maintenant (cf. non-objectifs).

## Hors périmètre (explicitement pas des use cases pour l'instant)

- Zoom / pan sur la caméra 3D (désactivés dans la démo actuelle — à
  reconsidérer seulement si un usage futur en a besoin)
- Sélection/raycasting d'un atome ou d'une liaison
- Export d'image / capture du canvas
- Édition de molécule dans le viewer (ajout/suppression d'atomes)
