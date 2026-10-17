# Glossaire

Un terme = un sens. Si un mot est utilisé autrement ailleurs dans le projet, c'est le glossaire qui a raison.

## Les objets

**Opérateur** — Une opération mathématique (`sin`, `add`, `select`…). Il a un nom (la clé du catalogue), un groupe, des entrées nommées, des paramètres et un code GLSL.

**Groupe** — La famille d'affichage d'un opérateur (`terminal`, `arithmetic`, `trigonometry`, `logic`, `transform`). Purement présentationnel : le compilateur ne s'en sert pas.

**Terminal** — Un opérateur sans entrée : `x`, `y`, une constante, `tsin`, `tcos`. Il termine une branche de l'expression.

**Catalogue** — La liste de tous les opérateurs (et dépendances) que le projet connaît.

**Vocabulaire** — L'ensemble des opérateurs du catalogue qu'une grammaire a le droit d'utiliser, c'est-à-dire ceux d'un poids strictement positif. Un opérateur de poids 0 est hors vocabulaire. Il inclut les terminaux : sans terminaux de temps, l'image est statique.

**Poids** — Le nombre qui règle la fréquence relative à laquelle un opérateur est choisi. Un poids de 0 signifie « hors vocabulaire » : l'opérateur n'est jamais tiré.

**Contraintes** — Les limites de forme de l'expression : profondeur minimale des feuilles (`minDepth`), profondeur maximale (`maxDepth`), nombre de nœuds maximal par canal (`maxNodes`).

**Grammaire** — Vocabulaire + poids + contraintes + canaux. Elle définit un espace d'expressions possibles.

**Canaux** — Comment les trois arbres (rouge, vert, bleu) deviennent la couleur écrite par le shader. Deux axes orthogonaux : `space` (`srgb`, `oklch`, `oklab`, `hsl`) dit comment le triplet `(r, g, b)` est interprété avant sortie ; `shareDepth` dit jusqu'à quelle profondeur les trois canaux partagent leur structure — `0` = trois arbres indépendants, `≥ maxDepth` = un seul arbre (donc `r = g = b`). `shareDepth` est l'axe de corrélation : plus le tronc est profond, plus la couleur suit la forme.

**Tronc (partagé)** — Les `shareDepth` premiers niveaux de l'expression : leur opérateur et leurs paramètres sont tirés **une fois**, donc les trois canaux y coïncident. Sous le tronc, chaque canal diverge sur les opérateurs et les paramètres.

**Seed** — Un nombre qui choisit une expression précise à l'intérieur d'une grammaire.

**Expression** — La fonction concrète produite par le générateur : trois arbres d'opérateurs (rouge, vert, bleu) qui calculent chacun une valeur à partir de `(x, y, t)`.

**Nœud** — Un élément d'un arbre d'expression : un opérateur (désigné par son nom), ses paramètres et ses sous-expressions.

**Adresse** — Désigne un nœud dans une expression : un canal (`r`, `g` ou `b`) et le chemin d'indices d'entrée depuis la racine.

**Clé canonique** — Un texte qui décrit un nœud de façon unique et déterministe. Deux nœuds ont la même clé si et seulement s'ils ont la même structure.

**Profondeur** — Le nombre de niveaux d'un arbre. Une feuille seule a une profondeur de 1. La racine est à la profondeur 1 ; `minDepth` est la profondeur en dessous de laquelle **aucune feuille** n'est permise (D32).

**PRNG** — Un générateur de nombres pseudo-aléatoires déterministe : la même seed donne toujours la même suite. On n'utilise jamais `Math.random` dans le cœur.

**Version du générateur** — Un numéro incrémenté dès qu'une même seed produit une expression différente. Une seed n'a de sens qu'avec une version donnée.

**Œuvre** — Ce qu'on sauvegarde : l'expression, plus la provenance optionnelle (grammaire + seed) et les paramètres de rendu.

**Valeur** — Un nombre garanti dans `[-1, 1]` (à quelques ULP près, tolérance `1e-6`) par la construction des formules de chaque opérateur. C'est le seul type de la v1. Ne pas confondre avec un _sommet_ du graphe du compilateur.

**Booléen (par convention)** — Une valeur où `+1` veut dire vrai et `-1` faux. Il n'existe pas de type booléen.

## Les notions de shader

**Uniform** — Une variable que le renderer envoie au shader (par exemple la phase du temps).

**Dépendance** — Ce dont un opérateur a besoin pour fonctionner : une fonction GLSL auxiliaire ou un uniform. Une dépendance peut elle-même en requérir d'autres.

**Préambule** — Le code GLSL placé avant le `main` : constantes, fonctions auxiliaires et déclarations d'uniforms. Le compilateur le construit à partir des dépendances des opérateurs utilisés, sans doublons.

**Contexte de coordonnées** — Le point `(x, y)` auquel une partie de l'expression est évaluée. Par défaut c'est le pixel courant.

**Transformateur de coordonnées** — Un opérateur qui évalue une de ses entrées dans un autre contexte de coordonnées (déformation, rotation, zoom).

**Portée (d'une entrée)** — Dans quel contexte une entrée est évaluée : le contexte courant (`current`) ou le nouveau contexte créé par l'opérateur (`inner`).

**Sommet** — Dans le compilateur, un calcul distinct du graphe obtenu après partage : identifié par son contexte, son opérateur, ses paramètres et ses entrées. Remplace l'usage du mot « valeur » dans le compilateur.

**Multiplicité (d'une entrée)** — Le nombre de fois où le GLSL d'un opérateur écrit une de ses entrées. Le **catalogue** la mesure par sondage, une fois, à la construction de l'`Operator` (D29) ; elle sert à compter les usages d'un sommet.

**Atome** — Un texte GLSL qui ne vaut jamais une variable : un identifiant, un littéral (négatif entre parenthèses compris) ou un accès de composante (`v_p.x`, `0.3`, `(-0.3)`, `u_phase`). `sin(2.0*PI*u_phase)` n'est **pas** un atome.

**Politique de partage** — `none`, `shared` ou `all` : décide quels sommets reçoivent une variable GLSL.

**Phase** — Un nombre dans `[0, 1)` qui avance avec le temps et recommence à 0 : l'animation boucle parfaitement.

**Post-traitement** — Une passe finale appliquée à l'image rendue (flou, grain, correction de couleur…). Ce n'est pas un opérateur et ça ne fait pas partie de l'expression.

**Taille de rendu** — La largeur et la hauteur, en pixels, de l'image produite. Elle est indépendante de la taille du canvas d'affichage.

**Passe finale** — La dernière étape du renderer : elle place l'image rendue dans le canvas (étirement ou bandes). C'est là que viendra le post-traitement.

**Durée de boucle** — Le temps réel, en millisecondes, que met la phase pour passer de 0 à 1.

## Les actions

**Générer** — `(grammaire, seed) → expression`.

**Compiler** — `expression → shader GLSL`, avec optimisation.

**Rendre** — Exécuter le shader sur le GPU pour obtenir une image.

**Exporter** — Écrire une œuvre (ou une grammaire) dans un fichier, ou l'image dans un PNG.

## Les opérations d'exploration

| Nom                       | Ce qui change                | Ce qui reste      |
| ------------------------- | ---------------------------- | ----------------- |
| **Nouvelle image**        | seed                         | grammaire         |
| **Nouvelle distribution** | poids (0 = hors vocabulaire) | contraintes, seed |
| **Contraintes**           | minDepth/maxDepth/maxNodes   | poids, seed       |

## Termes volontairement exclus

- **Règle** (au sens « règle de production / règle de grammaire ») : ambigu, remplacé par _grammaire_ et _contraintes_. Le mot reste libre dans son sens courant (« règle de validation », « règle de tirage »).
- **Fonction** : réservé au code (et aux fonctions auxiliaires GLSL). Côté produit on dit _expression_.
- **Évaluateur CPU** : supprimé. Le GLSL est la seule sémantique des opérateurs.
