# Spec — Grammaire, générateur et aléatoire

Version de travail 0.2. Termes définis dans `glossary.md`, décisions dans `architecture.md`, opérateurs dans `catalog-spec.md`, expressions dans `expression-spec.md`.

## 1. Responsabilités

Trois petits modules, du plus bas au plus haut :

| Module        | Responsabilité (une phrase)                                                         | Ne sait rien de        |
| ------------- | ----------------------------------------------------------------------------------- | ---------------------- |
| **random**    | Fournir un générateur de nombres pseudo-aléatoires déterministe à partir d'une seed | tout le reste          |
| **grammar**   | Décrire un espace d'expressions, vérifier qu'il est valide, et le faire varier      | rendu, compilation, UI |
| **generator** | Produire une expression à partir d'une grammaire et d'une seed                      | rendu, compilation, UI |

`grammar` et `generator` utilisent `random`. `generator` utilise `grammar`, `catalog` et `expression`.

## 2. Principes

- **Une grammaire invalide n'existe pas.** On ne l'obtient qu'à travers `createGrammar`, qui vérifie qu'elle peut toujours produire une expression (pas de génération qui ne termine pas ou qui échoue).
- **Le générateur ne peut pas échouer** sur une grammaire valide : l'algorithme garantit à chaque pas qu'un choix existe.
- **Déterminisme.** Mêmes `(catalogue, grammaire, seed, version du générateur)` → même expression, au caractère près une fois sérialisée.
- **Les randomisations de grammaire renvoient toujours une grammaire valide**, par construction.

## 3. Le module random

```ts
type Seed = Brand<number, 'Seed'>;      // entier de 0 à 2³² − 1

createSeed(value: number): Seed         // erreur si non entier ou hors plage
randomSeed(): Seed                      // NON déterministe : tirée au hasard par l'appelant (UI)

type Rng = {
  next(): number;                       // dans [0, 1)
  int(maxExclusive: number): number;    // entier dans [0, maxExclusive)
  weighted<T>(items: readonly T[], weightOf: (item: T) => number): T;
};

createRng(seed: Seed): Rng
```

- Algorithme : **mulberry32** (court, rapide, suffisant pour un jouet). Ne **jamais** utiliser `Math.random` dans le cœur.
- `weighted` : tire un élément avec une probabilité proportionnelle à son poids. L'appelant fournit déjà une liste dans un ordre fixe (voir §6). Il consomme **exactement un** appel à `next()`, même s'il n'y a qu'un candidat. Il calcule `r = next() × total`, puis parcourt la liste en cumulant les poids et renvoie le premier élément dont le cumul dépasse `r` ; en cas d'arrondi qui ferait dépasser la fin, il renvoie le dernier.
- mulberry32 : `t += 0x6D2B79F5; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296`. Cette définition fait partie de la version du générateur.
- Le choix de l'algorithme et **l'ordre de consommation des nombres aléatoires** font partie de la version du générateur (§6).

## 4. La grammaire

### Forme

```ts
type Constraints = {
    readonly minDepth: number; // profondeur minimale de toute feuille
    readonly maxDepth: number; // profondeur maximale de l'arbre
    readonly maxNodes: number; // nombre de nœuds maximal, PAR CANAL
};

type Grammar = Brand<
    {
        readonly weights: Readonly<Record<string, number>>; // nom d'opérateur → poids
        readonly constraints: Constraints;
    },
    'Grammar'
>;
```

- **Vocabulaire** = les noms présents dans `weights`. Il n'y a pas de poids 0 : un opérateur absent n'est pas dans le vocabulaire.
- La **profondeur** d'une feuille seule est 1 (comme dans `expression-spec.md`).
- **`minDepth`** (D18, D32) : aucune feuille avant cette profondeur. Ce n'est **pas** « l'arbre atteint au moins cette profondeur » : toutes les branches doivent descendre jusque-là. Le coût est la taille minimale de §5 : avec des opérateurs binaires seuls, `minDepth = 4` impose 15 nœuds par canal. Une valeur de 2 ou 3 est recommandée.
- Les contraintes s'appliquent à **chacun des trois canaux** : chaque canal est un arbre généré séparément.

### Validation (`createGrammar`)

```ts
createGrammar(catalog, { weights, constraints }): Grammar
```

Erreur si :

1. un nom n'existe pas dans le catalogue ;
2. un poids n'est pas fini ou sort de `[MIN_WEIGHT, MAX_WEIGHT] = [0.01, 100]` (D33) ;
3. le vocabulaire ne contient aucun terminal ;
4. une entrée d'un opérateur du vocabulaire attend un type pour lequel il n'y a aucun terminal (en v1, un terminal `float` suffit puisque tout est `float`) ;
5. `1 ≤ minDepth ≤ maxDepth` n'est pas respecté ;
6. `minDepth > 1` et le vocabulaire ne contient aucun opérateur non terminal ;
7. `maxDepth` ou `maxNodes` dépasse les **limites dures** : `maxDepth ≤ 16`, `maxNodes ≤ 400` (un shader plus gros n'est plus raisonnable) ;
8. `maxNodes` est inférieur à la **taille minimale** d'un arbre faisable (§5).

Les règles 3 à 8 sont la « contrainte de validité » dont parlait le brief.

### Sérialisation

```ts
serializeGrammar(grammar): GrammarData
deserializeGrammar(catalog, data: unknown): Grammar
```

Format :

```json
{
    "weights": { "x": 3, "y": 3, "const": 1, "sin": 1, "add": 1, "mul": 1 },
    "constraints": { "minDepth": 3, "maxDepth": 8, "maxNodes": 60 }
}
```

Les clés de `weights` sont écrites dans l'ordre alphabétique, pour que deux grammaires égales donnent le même texte. `deserializeGrammar` valide à travers `createGrammar`.

### Grammaire par défaut

Une seule grammaire de départ, **à calibrer en jouant** (D34) :

- Contraintes : `minDepth: 3`, `maxDepth: 8`, `maxNodes: 60`.
- `x: 3`, `y: 3`, `const: 1`.
- Tous les autres opérateurs du catalogue : poids `1`, sauf `select`, `mix` et `warp` à `0.5`.
- **`defaultGrammar`** : exactement cela. C'est le défaut de l'UI.

`tsin` et `tcos` font partie du catalogue comme n'importe quel autre opérateur : il n'y a plus de préréglage « animé » distinct. L'animation relève de la lecture (horloge Play/Pause), pas de la grammaire.

## 5. Taille minimale et faisabilité

Avec la règle de profondeur (§6), aucune feuille ne peut apparaître avant `minDepth`. Cela impose une taille minimale. Soit `k` la plus petite arité parmi les opérateurs non terminaux du vocabulaire. Pour un nœud à la profondeur `d` :

```
minSize(d) = 1                         si d ≥ minDepth      (un terminal suffit)
minSize(d) = 1 + k × minSize(d + 1)    si d < minDepth
```

La grammaire est faisable si `minSize(1) ≤ maxNodes`.

Exemple : avec `minDepth = 4` et un seul opérateur non terminal binaire, la taille minimale est 15 nœuds par canal. Avec un opérateur unaire disponible (`sin`, `neg`), elle tombe à 4. **Conséquence pratique** : une `minDepth` basse (2 ou 3) laisse plus de liberté ; une `minDepth` haute donne des arbres obligatoirement larges.

## 6. Le générateur

```ts
GENERATOR_VERSION: number
generate(catalog, grammar, seed): Expression
```

### Résumé

On génère les canaux `r`, puis `g`, puis `b`, dans cet ordre, avec **un seul flux aléatoire** créé à partir de la seed.

### Algorithme pour un nœud

Entrées : la profondeur `d` du nœud (la racine a `d = 1`) et son **budget** `B` (nombre de nœuds qu'il peut utiliser, lui compris). Au départ `B = maxNodes`.

Invariant : `B ≥ minSize(d)`.

1. **Candidats.** Les opérateurs du vocabulaire dont le type de sortie convient à ce qu'on cherche, avec :
    - un **terminal** n'est candidat que si `d ≥ minDepth` ;
    - un **non terminal** d'arité `k` n'est candidat que si `d < maxDepth` **et** `1 + k × minSize(d + 1) ≤ B`.
2. **Tri.** Les candidats sont triés par **nom** (ordre alphabétique) pour que le résultat ne dépende pas de l'ordre d'insertion.
3. **Tirage.** Un candidat est choisi avec `rng.weighted`, proportionnellement à son poids parmi les candidats.
4. **Paramètres.** Pour chaque paramètre de l'opérateur, une valeur uniforme dans `[min, max]`, arrondie à 3 décimales (`Math.round(v × 1000) / 1000`), ramenée dans `[min, max]` si besoin, et `-0` devient `0`.
5. **Enfants.** Soit `m = minSize(d + 1)` et `libre = B − 1 − k × m`. Pour l'enfant `i` (de 0 à `k − 1`) :
    - son budget est `m + floor(libre / (k − i))` ;
    - on le génère (récursivement, à la profondeur `d + 1`) ;
    - on met à jour `libre = libre − (taille de l'enfant − m)`.
6. Le nœud est construit avec `createNode`.

### Ordre de consommation du flux aléatoire

Il fait partie de `GENERATOR_VERSION`. Pour chaque nœud : (1) **un** appel pour `weighted` (le choix de l'opérateur), (2) un appel à `next()` par paramètre, dans l'ordre de `params`, (3) puis les enfants, de gauche à droite, chacun consommant son propre flux dans cet ordre. Les canaux sont générés dans l'ordre `r`, `g`, `b`.

### Pourquoi il ne bloque jamais

- Si `d < minDepth`, l'opérateur non terminal d'arité `k` minimale est toujours un candidat (`1 + k × minSize(d + 1) = minSize(d) ≤ B`).
- Si `d ≥ minDepth`, un terminal est toujours candidat (il en existe un dans le vocabulaire, règle 3).
- À `d = maxDepth`, on est forcément en `d ≥ minDepth` (règle 5) : il ne reste que des terminaux, et un terminal suffit.
- Le budget donné à chaque enfant respecte l'invariant `B ≥ minSize`, par construction.

### Preuve du partage du budget

Soit un nœud non terminal d'arité `k` choisi à la profondeur `d` avec le budget `B`. La condition de candidature donne `libre₀ = B − 1 − k·m ≥ 0`, avec `m = minSize(d + 1)`. Le budget de l'enfant `i` est `m + ⌊libreᵢ / (k − i)⌋ ≥ m`, donc l'invariant `B ≥ minSize` tient pour l'enfant. Par induction sa taille est au plus son budget, d'où `libreᵢ₊₁ = libreᵢ − (tailleᵢ − m) ≥ libreᵢ − ⌊libreᵢ / (k − i)⌋ ≥ 0`. Le dernier enfant (`i = k − 1`) reçoit `m + libre`. La taille totale est au plus `1 + k·m + libre₀ = B`. Aucun budget ne devient négatif et aucun ensemble de candidats n'est vide.

### Ce que les poids signifient vraiment

Les poids sont relatifs **entre candidats à un endroit donné**, pas globalement :

- avant `minDepth`, les terminaux sont exclus : les poids se répartissent entre non terminaux ;
- à `maxDepth` (ou quand le budget est épuisé), l'inverse.

Pour deviner la taille des arbres entre ces bornes, une règle approximative : soit `T` la part du poids total qui revient aux terminaux, et `a` l'arité moyenne des non terminaux (pondérée par leur poids). Le nombre moyen d'enfants par nœud est `(1 − T) × a`. S'il dépasse 1, les arbres grossissent jusqu'à être coupés par `maxDepth` ou `maxNodes` ; sinon ils restent petits. C'est un indicateur qu'une UI pourra afficher, pas une règle imposée.

### Version et reproductibilité

`GENERATOR_VERSION` est incrémentée à tout changement qui modifie la sortie pour une seed donnée : algorithme du `Rng`, ordre des appels, règle de tirage, arrondi. Une seed n'a de sens qu'avec une version donnée ; l'œuvre exportée garde l'expression elle-même (D1).

## 7. Randomiser une grammaire

Toutes ces fonctions sont **pures** (une grammaire en entrée, une nouvelle en sortie) et **déterministes** pour un `Rng` donné. Elles correspondent aux quatre opérations du glossaire.

| Opération             | Fonction                                               |
| --------------------- | ------------------------------------------------------ |
| Nouvelle image        | _(pas une opération de grammaire : on change la seed)_ |
| Nouvelle distribution | `randomizeWeights`                                     |
| Nouveau vocabulaire   | `randomizeVocabulary`                                  |
| Nouvelle grammaire    | `randomizeGrammar`                                     |

### `randomizeWeights(catalog, grammar, rng, options?)`

Le vocabulaire et les contraintes sont inchangés. Chaque poids est multiplié par un facteur tiré de façon log-uniforme dans `[1/spread, spread]`.

Options :

- `spread` (défaut `4`) : l'amplitude du changement.
- `preserveTerminalShare` (défaut `true`) : après tirage, les poids des terminaux sont remis à l'échelle pour que leur **part du poids total** reste celle d'avant. La taille attendue des arbres reste ainsi stable et on explore le « caractère » sans changer l'échelle des images. En le mettant à `false`, les poids varient librement, y compris la taille des arbres.

**Détails de déterminisme** (D33) : les poids sont traités dans l'ordre alphabétique des noms, avec un appel à `rng.next()` par poids, facteur `exp((2u − 1) × ln(spread))`. Après remise à l'échelle des terminaux, chaque poids est arrondi à 3 décimales puis ramené dans `[MIN_WEIGHT, MAX_WEIGHT]` ; la part des terminaux est donc conservée à l'arrondi près. Si la grammaire n'a aucun non terminal, il n'y a rien à remettre à l'échelle.

### `randomizeVocabulary(catalog, grammar, rng, options?)`

Les contraintes sont inchangées ; les opérateurs qui restent gardent leur poids.

- Chaque opérateur du catalogue **change d'état** (entre dans le vocabulaire ou en sort) avec une probabilité `changeRate` (défaut `0.3`).
- Un opérateur qui entre reçoit le poids `1`.
- Les noms listés dans `keep` ne sortent jamais. Défaut : `DEFAULT_KEEP = ['x', 'y']` (ceux présents dans le catalogue), pour éviter les images unies (D39). Passer `[]` pour désactiver.
- Les opérateurs du catalogue sont parcourus dans l'ordre alphabétique, avec un appel à `rng.next()` par opérateur. Un choix « au hasard » dans la réparation utilise `rng.int` sur la liste triée par nom.
- **Réparation** : si le vocabulaire n'a plus de terminal, on en ajoute un au hasard ; si `minDepth > 1` et qu'il n'y a plus de non terminal, on en ajoute un.

### `randomizeGrammar(catalog, grammar, rng, options?)`

Compose les opérations ci-dessus et peut aussi faire varier les contraintes.

- `dimensions` : `{ vocabulary, weights, constraints }`, chacune activable (défaut : les trois).
- Ordre fixe : vocabulaire, puis poids, puis contraintes (chaque étape consomme son propre flux, dans cet ordre).
- Contraintes : `minDepth` varie de ±1 et `maxDepth` de ±2, `maxNodes` de ±50 %, le tout ramené dans les limites dures.
- **Réparation des contraintes** : si la grammaire n'est pas faisable, on augmente `maxNodes` jusqu'à `minSize(1)` (dans la limite dure) ; si ce n'est pas assez, on baisse `minDepth` jusqu'à ce que ça le soit. `minDepth = 1` est toujours faisable, donc la réparation termine.

Le résultat passe toujours `createGrammar`.

## 8. Organisation du code

```
random/
  seed.ts            // Seed, createSeed, randomSeed
  rng.ts             // createRng (mulberry32)
  index.ts
grammar/
  types.ts           // Grammar, Constraints, MIN_WEIGHT/MAX_WEIGHT, MAX_DEPTH/MAX_NODES
  grammar.ts         // createGrammar, minSize, faisabilité, defaultGrammar
  describe.ts        // describeGrammar (résumé d'une grammaire)
  serialize.ts       // serializeGrammar, deserializeGrammar
  randomize.ts       // DEFAULT_KEEP, randomizeWeights, randomizeVocabulary, randomizeGrammar
  index.ts
generator/
  generator.ts       // generate, GENERATOR_VERSION
  index.ts
```

## 9. Tests

**random**

1. Même seed → même suite ; deux seeds différentes → suites différentes.
2. `int` reste dans la plage ; `weighted` respecte approximativement les poids sur beaucoup de tirages.
3. `createSeed` rejette les non-entiers et les valeurs hors plage.

**grammar**

4. Chacune des erreurs de la §4 est levée avec un message clair.
5. Aller-retour de sérialisation.
6. `minSize` sur des exemples calculés à la main (dont le cas unaire).
7. `randomize*` : sur beaucoup de seeds et de grammaires, le résultat est **toujours** valide ; `preserveTerminalShare` conserve bien la part des terminaux ; `keep` est respecté.

**generator**

8. Sur beaucoup de couples (grammaire valide, seed) : l'expression est valide, n'utilise que le vocabulaire, chaque feuille a une profondeur dans `[minDepth, maxDepth]`, chaque canal a au plus `maxNodes` nœuds.
9. **Déterminisme** : même entrée → même texte sérialisé ; un test d'instantané sur quelques seeds fixes détecte tout changement involontaire (et rappelle d'incrémenter `GENERATOR_VERSION`).
10. **Cas limites** : un vocabulaire réduit à un terminal ; `minDepth = maxDepth` ; `maxNodes` exactement égal à la taille minimale.
11. Statistique : sur une grammaire à un seul niveau, la fréquence de chaque terminal correspond à ses poids.
12. **Budget** : test exhaustif sur de petites grammaires (arités 1 à 3, `minDepth` et `maxDepth` jusqu'à 5, `maxNodes` de `minSize(1)` à `minSize(1) + 10`) : la génération ne lève jamais d'erreur et respecte `maxNodes`.
13. **Poids** : après de nombreuses randomisations successives, tous les poids restent dans `[0.01, 100]`.

## 10. Décisions prises

- **Canaux indépendants** en v1. Un mode niveaux de gris ou des canaux corrélés viendra plus tard.
- **Images unies** : une grammaire sans `x` ni `y` est valide (D39). On les évite par `DEFAULT_KEEP` à la randomisation, pas par une règle de validité.
- **`maxNodes` par canal**, pour la simplicité. Le shader a donc au plus 3 × 400 nœuds. À revoir si le coût dépend surtout du total.
- **Répartition du budget** : le partage équitable de `libre` peut très légèrement favoriser les derniers enfants. À observer sur de vraies images avant de corriger.
- **Poids par défaut** : à calibrer en jouant (§4).
- **Comparer des grammaires** : v2, avec `grammarKey` sur le modèle de `nodeKey` (D37).
