Le workflow étape par étape

### 1. Génération (generate)

On crée 1 000 grammaires aléatoires. Pour chaque grammaire, on dessine 16 images avec des graines aléatoires différentes. Ça fait 16 000 images
au total.

Chaque image est rendue en 128×128 pixels (petite taille pour aller vite).

### 2. Mesure des stats (imageStats)

Pour chaque image, on calcule 6 nombres :

- brightness : l'image est-elle claire ou sombre ?
- contrast : y a-t-il de fortes différences entre les zones claires et sombres ?
- sharpness : l'image est-elle nette ou floue ?
- busyness : y a-t-il beaucoup de détails partout, ou c'est vide ?
- colorfulness : l'image est-elle très colorée ou plutôt grise ?
- motion : y a-t-il un effet de mouvement ?

### 3. Apprentissage (la régression) (learn:grammar)

C'est l'étape qui te bloque. Voici ce que c'est, simplement.

#### Qu'est-ce qu'une régression ?

Imaginons que tu veuilles savoir si le sucre dans un gâteau influence son humidité.

Tu as 1 000 gâteaux. Pour chacun, tu connais :

- la quantité de sucre (x)
- le taux d'humidité mesuré (y)

La régression, c'est trouver la droite (ou plutôt la formule) qui relie le mieux x et y. Si tu trouves que plus il y a de sucre, plus c'est
humide, tu peux dire : "le sucre explique l'humidité".

Dans notre cas :

- x = les caractéristiques de la grammaire (combien d'additions, de multiplications, profondeur, espace colorimétrique…)
- y = la statistique mesurée (brightness, contrast, etc.)

La régression nous dit : "tel paramètre de la grammaire fait augmenter telle statistique".

#### Pourquoi on fait des "ablations" ?

Une ablation, c'est retirer un ingrédient de la recette pour voir ce qui change.

On teste 5 modèles :

1.  weights only : seulement les poids des opérations (combien d'add, de mul, etc.)
2.  structure only : seulement la structure (profondeur, nombre de nœuds, partage…)
3.  space only : seulement l'espace colorimétrique (srgb, oklab, oklch, hsl…)
4.  structure + space : les deux combinés
5.  all : tout ensemble

Cela nous permet de savoir : "est-ce que c'est le poids des opérations qui influence le contraste, ou bien la structure de l'arbre, ou les deux
?"

#### Qu'est-ce que cvR2 ?

C'est un score de qualité (de 0 à 1) qui dit : "dans quelle mesure ce modèle permet-il de prédire la statistique ?"

- 0 = le modèle ne prédit rien (c'est du n'importe quoi)
- 1 = le modèle prédit parfaitement

Plus c'est proche de 1, mieux on comprend ce qui influence quoi.

────────────────────────────────────────────────────────────────────────────────

Ce que nous disent les nouvelles données

Avec 1 000 grammaires × 16 graines, voici ce qu'on a appris :

┌──────────────────────────┬──────────────────────────────┬────────────────────────────────────────────────┐
│ Caractéristique visuelle │ cvR2 (qualité de prédiction) │ Ce qui l'explique principalement │
├──────────────────────────┼──────────────────────────────┼────────────────────────────────────────────────┤
│ brightness │ 0,80 │ L'espace colorimétrique (oklch = sombre, etc.) │
├──────────────────────────┼──────────────────────────────┼────────────────────────────────────────────────┤
│ colorfulness │ 0,77 │ L'espace colorimétrique (oklch = très coloré) │
├──────────────────────────┼──────────────────────────────┼────────────────────────────────────────────────┤
│ contrast │ 0,48 │ Les poids des opérations │
├──────────────────────────┼──────────────────────────────┼────────────────────────────────────────────────┤
│ motion │ 0,43 │ Les poids des opérations │
├──────────────────────────┼──────────────────────────────┼────────────────────────────────────────────────┤
│ busyness │ 0,45 │ La structure (profondeur, nœuds) │
├──────────────────────────┼──────────────────────────────┼────────────────────────────────────────────────┤
│ sharpness │ 0,37 │ La structure │
└──────────────────────────┴──────────────────────────────┴────────────────────────────────────────────────┘

Interprétation simple :

- Pour avoir une image colorée ou sombre/clair, c'est surtout le choix de l'espace colorimétrique qui compte. Pas besoin de chercher plus loin.
- Pour contrast et motion, ce sont les poids des opérations (combien on utilise tel ou tel opérateur) qui comptent.
- Pour busyness et sharpness, c'est la structure (profondeur de l'arbre, nombre de nœuds) qui compte.

Tous les scores sont > 0,37, ce qui est bon. Cela signifie que la régression linéaire suffit : on n'a pas besoin de méthodes plus complexes
(comme le CEM mentionné dans le handoff).

────────────────────────────────────────────────────────────────────────────────

Ce qu'il reste à faire (en langage simple)

Maintenant qu'on sait ce qui influence quoi, il faut :

1.  Fabriquer une table pour l'espace colorimétrique : noter que oklch donne des images sombres et colorées, hsl donne des images claires et peu
    colorées, etc. Cela permettra de choisir l'espace directement selon ce qu'on veut.

2.  Créer des presets de grammaire : utiliser les coefficients de la régression pour écrire des recettes. Exemple : "pour du contraste, augmente
    le poids de telle opération et diminue celui de telle autre". Les poids seront des nombres entiers (ex: entre 0 et 16).

3.  Valider : générer ~64 images avec la recette obtenue, mesurer les vraies stats, et vérifier qu'elles correspondent bien à ce qu'on voulait
    (ex: si on voulait du contraste, est-ce que les images ont vraiment plus de contraste qu'au hasard ?).

────────────────────────────────────────────────────────────────────────────────

Résumé du jargon

┌───────────────────────────────┬──────────────────────────────────────────────────────────────────────┐
│ Terme │ Signification simple │
├───────────────────────────────┼──────────────────────────────────────────────────────────────────────┤
│ Grammaire │ Une "recette" qui définit comment dessiner une image randomart │
├───────────────────────────────┼──────────────────────────────────────────────────────────────────────┤
│ Preset │ Une recette pré-configurée pour un style visuel donné │
├───────────────────────────────┼──────────────────────────────────────────────────────────────────────┤
│ Features │ Les caractéristiques de la grammaire (poids, structure, espace) │
├───────────────────────────────┼──────────────────────────────────────────────────────────────────────┤
│ Régression │ Méthode pour trouver quelles features influencent quelles stats │
├───────────────────────────────┼──────────────────────────────────────────────────────────────────────┤
│ Ablation │ Tester en retirant un groupe de features pour voir son importance │
├───────────────────────────────┼──────────────────────────────────────────────────────────────────────┤
│ cvR2 │ Score (0 à 1) de la qualité de prédiction du modèle │
├───────────────────────────────┼──────────────────────────────────────────────────────────────────────┤
│ Space (espace colorimétrique) │ La façon dont les couleurs sont calculées (srgb, oklch, oklab, hsl…) │
└───────────────────────────────┴──────────────────────────────────────────────────────────────────────┘

────────────────────────────────────────────────────────────────────────────────
