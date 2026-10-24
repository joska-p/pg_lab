# Tutte & Smith — Objectif et inventaire du terrier

> Document de synthèse. Écrit pour quelqu'un qui n'a pas suivi la discussion qui l'a produit.

---

## 1. Contexte du projet

**Tutte & Smith** est un projet de **programmation récréative** (pas un produit, pas d'utilisateur autre que son auteur). L'intérêt du projet est distribué sur trois axes, tous également importants :

- le côté **mathématique / algorithmique** (résolution de réseaux électriques, lois de Kirchhoff),
- le côté **visuel** (voir les pavages et animations prendre forme),
- le côté **outillage** (bricoler des petits outils réutilisables).

Le résultat final importe peu. Le plaisir est dans la construction et l'exploration — d'où l'image du **terrier de lapin** : chaque brique construite en révèle une autre.

### Objectif de base (rappel)

Explorer et visualiser l'analogie historique (Brooks, Smith, Stone, Tutte — années 1930) entre :

1. le **pavage géométrique** d'une surface par des carrés,
2. le **réseau électrique dual** de résistances qui lui correspond.

La géométrie n'est jamais dessinée à la main : elle est dérivée du calcul des courants/potentiels sur un graphe de résistances (lois de Kirchhoff). Un seul modèle de graphe est la source de vérité ; les vues (pavage, circuit) en sont des représentations dérivées et synchronisées.

### Roadmap prévue (slices verticales)

1. **Rectangle parfait** — solveur simple + rendu statique d'un squared rectangle.
2. **Carré parfait** — topologie non-guillotine (pont de Wheatstone), carré à carrés distincts.
3. **Dualité & interactions** — vue circuit en parallèle, navigation bidirectionnelle, mutations en direct.
4. **Exploration avancée** — import de maillages 3D, DSL/netlist.

---

## 2. Point de départ concret

Le déclencheur de cette session : implémenter une **première animation de test**, la plus simple possible — 2 nœuds, 1 arête — où l'arête s'étire et se sépare en deux pour former un carré à l'écran.

En essayant de dessiner cette transition, on se heurte à un problème de base : l'ordinateur est idiot. Passer d'une forme à deux formes, ce n'est pas une simple moyenne mathématique. Pour résoudre ce problème apparemment simple, plusieurs briques indispensables ont dû être conceptualisées.

---

## 3. Inventaire des briques identifiées

### 3.1 Format JSON du netlist (Le contrat central)

Le graphe (nœuds, arêtes, éventuellement résistances explicites) sérialisé en JSON. C'est la **source de vérité**. Il faut le stabiliser tôt, avant d'investir ailleurs, car un changement de format se répercoute partout.
_Questions ouvertes : résistances explicites ou toutes unitaires ? Comment désigner les bornes source/puits nécessaires à Kirchhoff ?_

### 3.2 Solveur de Kirchhoff (Le mathématicien)

Prend un netlist en entrée, retourne potentiels et courants. Module de calcul pur, testable indépendamment (contre des résultats connus, ex. le carré parfait à 21 carrés).

### 3.3 Moteur géométrique (Le traducteur)

Transforme les courants/potentiels du solveur en coordonnées de carrés (x, y, taille). Étape distincte du solveur — reçoit des nombres purs, produit une géométrie.

### 3.4 Renderers (L'écran)

Affichage de l'état géométrique et de l'état circuit. **Décision prise** : utilisation de `@repo/glaze`, la lib de rendu perso (p5-like pour le dessin immédiat, three.js-like pour les shaders). Un carré se dessine avec `surface.rect(...)`, une branche avec `surface.line(...)`. Le monde est déjà en world-space avec pan/zoom gérés automatiquement par `glaze`.

### 3.5 Éditeur de graphe (L'interface)

Outil visuel (placer des nœuds, tirer des arêtes) pour produire un netlist JSON sans l'écrire à la main. Utile dès les premiers tests pour éviter d'éditer du JSON à chaque essai.

### 3.6 Horloge d'animation (Le métronome - déjà existant dans `glaze`)

`glaze` fournit une classe `Clock` (`time`, `progress`, `loop`, `pingPong`, `speed`) mise à jour automatiquement à chaque frame. Le `clockStore` observable permet de piloter play/pause/vitesse depuis une UI React. Cette brique existe déjà.
_À la charge du projet :_ une fonction d'**easing** séparée si on veut une interpolation non-linéaire (`Clock.progress` étant linéaire par construction).

### 3.7 Adaptateur de correspondance (Le chef de chorégraphie)

**Le problème : "Qui devient qui ?"**
L'ordinateur ne sait pas faire une moyenne entre 1 forme (départ) et 2 formes (arrivée). Pour animer une transition, il faut d'abord décider explicitement _quel carré de départ devient quel carré d'arrivée_. Dès qu'un carré se transforme en deux ou disparaît, on ne peut pas deviner tout seul : il faut un règlement.

**Pourquoi on en a besoin ici :**
Une modification du graphe (ex: subdiviser une branche en deux, prévu pour la Slice 3) change le nombre de carrés d'un état à l'autre. Sans cette étape, le moteur de rendu ne saurait pas s'il doit dessiner un carré qui apparaît de nulle part ou "casser" un carré existant.

**Ce qu'elle apporte concrètement :**
Avant de dessiner la transition, l'adaptateur produit une liste de paires : _"ce carré-ci devient ce carré-là"_, _"ce carré-ci disparaît"_, _"ce carré-là apparaît"_. Une fois cette liste établie, chaque paire peut être traitée indépendamment, sans réfléchir au sens de la transformation.

**Comment elle le fait :**
Pour l'exemple 1 arête → 2 carrés, la correspondance est écrite à la main (un seul cas possible). Pour des cas plus généraux, la correspondance devra s'appuyer sur l'histoire du graphe (quelle arête parente a donné naissance à quelle nouvelle arête). _Voir la question ouverte en section 4 pour savoir qui est responsable de cette trace._

### 3.8 Interpolateur (Le mathématicien bête)

**Le problème : "Où et de quelle taille ?"**
Une fois qu'on sait que "ce carré devient ce carré-là", il reste à calculer à quoi ça ressemble à 10 %, 50 % ou 90 % de la transition. Les positions et tailles doivent évoluer image par image pour donner un mouvement fluide.

**Pourquoi on en a besoin ici :**
Sans cette étape, on ne peut afficher que l'état de départ ou l'état d'arrivée, jamais un état intermédiaire. Or c'est l'effet recherché : voir le nœud s'étirer progressivement, pas d'un coup.

**Ce qu'elle apporte concrètement :**
Une fonction qui prend deux valeurs (ex: position de départ et d'arrivée) et un nombre entre 0 et 1 (le temps), et qui retourne la valeur intermédiaire. Elle ne connaît rien au graphe électrique — elle sait juste calculer des moyennes. C'est ce qui la rend 100% réutilisable.

**Comment elle le fait :**
Le nombre "où on en est" (0 à 1) vient de la `Clock` de `glaze`. L'interpolateur combine ce nombre avec les paires produites par l'adaptateur pour calculer, image par image, la position et la taille à dessiner. Si on veut un mouvement qui accélère/ralentit, on ajoute une petite transformation (easing, voir 3.6) sur ce nombre avant de l'utiliser.

---

## 4. Questions ouvertes à trancher plus tard

- Format exact du netlist JSON (résistances explicites, bornes source/puits).
- Le moteur géométrique doit-il exposer une **trace de filiation** entre carrés (quel carré vient de quel autre), ou est-ce à l'adaptateur de la déduire seul ?
- Pour un élément qui apparaît ou disparaît : naissance/mort instantanée, ou effet visuel progressif (fade, rétrécissement) ?
- À quel moment `GpuSurface` (WebGL2, `StateBuffer` GPGPU) devient nécessaire par rapport à `CpuSurface` (Canvas2D) — probablement seulement à partir de la Slice 4 (gros maillages, effets de courant en direct).

---

## 5. Schéma de dépendance (haut niveau)

```text
       Éditeur de graphe ──> JSON netlist (contrat central)
                     │
                     ▼
       Solveur de Kirchhoff (math pur)
                     │
                     ▼
       Moteur géométrique (traduit en x,y,taille)
                     │
                     ▼
       Adaptateur (Qui devient qui ?)
                     │
                     ▼
       nterpolateur (Où et quelle taille ?)
                     │
                     ▼
       Renderer pavage / circuit  <─── dessiné via glaze (rect/line) à chaque frame
```
