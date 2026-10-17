# Spec — Catalogue

Version de travail 0.4. Termes définis dans `glossary.md`, décisions dans `architecture.md`.

## 1. Responsabilité

Le catalogue **déclare** les opérateurs et les dépendances shader, et permet de les retrouver. Il ne génère rien et ne compile rien : il fournit les définitions que les autres modules consomment.

## 2. Principes

- **Un opérateur est une donnée.** Ajouter un opérateur = ajouter une entrée, sans modifier le générateur ou le compilateur.
- **Opérateurs honnêtes.** Chaque opérateur accepte des valeurs dans `[-1, 1]` et promet de renvoyer une valeur dans `[-1, 1]`, finie, pour toute entrée, **à quelques ULP près** (tolérance de test `1e-6`, D31 ; le `clamp` final du shader absorbe l'arrondi). Il est _construit_ pour que ce soit vrai, sans cas d'erreur.
- **Le GLSL est la sémantique.** Il n'y a pas de seconde implémentation à garder cohérente.
- **Des capacités, pas des genres.** Un opérateur déclare ce dont il a besoin (`requires`, portée des entrées). Aucun code ne fait de `switch` sur un « type d'opérateur ».

## 3. Types

Il n'y a **pas** de type de valeur dans le catalogue : la v1 est `float` partout, et la plage `[-1, 1]` est un **contrat** vérifié par la construction des formules et par un test en navigateur (§9). Aucun champ `output` ni `ValueType` : le jour où un `vec3` arrivera, la forme des définitions évoluera (les entrées et paramètres sont déjà nommés).

```ts
type OperatorGroup = 'terminal' | 'arithmetic' | 'trigonometry' | 'logic' | 'transform';

type ParamRange = { readonly min: number; readonly max: number };
```

## 4. Définitions

### Opérateur

Une spec est une **donnée** : un groupe, des paramètres nommés, des entrées nommées et trois constructeurs de texte. Les noms de paramètres (`P`), d'entrées `inputs` (`I`) et d'entrées `inner` (`N`) sont **inférés du littéral** par `defineOperator`, donc `args.a`, `args.dx`, `params.value` sont typés dans les constructeurs.

```ts
type Named<K extends string, V> = Readonly<Record<K, V>>;

interface OperatorSpec<
    P extends string = string, // noms des paramètres
    I extends string = string, // noms des entrées `inputs`
    N extends string = string, // noms des entrées `inner`
    D extends string = string, // ids de dépendances autorisés dans `requires`
> {
    readonly label: string; // nom affiché (ex. « Square »)
    readonly group: OperatorGroup; // famille d'affichage
    readonly params?: Named<P, ParamRange>; // ex. la constante a un paramètre `value`
    readonly inputs?: readonly I[]; // entrées du contexte courant
    readonly inner?: readonly N[]; // entrées du contexte créé par `coords` (après `inputs`)
    readonly requires?: readonly D[]; // ids de dépendances (§ ci-dessous)

    // requis si et seulement si `inner` est déclaré ; ne reçoit QUE les entrées `inputs`
    coords?(c: { p: string; args: Named<I, string>; params: Named<P, number> }): string;

    // reçoit toutes les entrées (`inputs` puis `inner`) et le contexte de coordonnées
    glsl(c: { p: string; args: Named<I | N, string>; params: Named<P, number> }): string;
}
```

Remarques :

- **Le nom est la clé.** Un opérateur ne porte pas son nom : c'est sa clé dans le registre (`x`, `sin`…). Elle respecte `^[a-z][a-z0-9_]*$` (vérifié par un test, §9). `label` est le nom affiché.
- **Arité** = `inputs.length + inner.length`. **Terminal** = arité 0.
- **Ordre positionnel** : le nœud et le compilateur lisent les entrées dans l'ordre `[...inputs, ...inner]` (`inner` toujours en dernier). Dans la spec, on les **nomme** (`args.a`, `args.dx`, `args.f`) : pas d'indices.
- `glsl` renvoie une _expression_ GLSL à partir des expressions GLSL de ses entrées et du contexte. Le compilateur décide s'il faut les stocker dans des variables.
- `params` sont les valeurs propres à un nœud (la constante), tirées par le générateur dans `[min, max]`, nommées (`params.value`).
- **Contexte de coordonnées** : un terminal comme `x` écrit `` `${c.p}.x` ``, jamais `p.x` en dur.
- **`coords`** (ex-`innerCoords`) : requis si une entrée `inner` existe, **interdit** sinon (vérifié à la construction de l'`Operator`). Il reçoit **uniquement** les entrées `inputs`, car les entrées `inner` en dépendent ; il renvoie une expression GLSL `vec2`.
- **Multiplicité** : un opérateur peut écrire une même entrée plusieurs fois (`sqr` : `a*a`). L'`Operator` la mesure **une fois, à sa construction**, en sondant `glsl` et `coords` avec des sentinelles (D29) ; rien à déclarer. Chaque entrée doit apparaître **au moins une fois** dans `glsl` ou `coords` (vérifié à la construction).
- **Portée `inner`** : les entrées `inner` sont compilées dans un nouveau contexte dont les coordonnées sont données par `coords`. Les entrées `inputs` (qui servent à calculer ces coordonnées) restent dans le contexte courant.
- **Règle** : `coords` doit renvoyer des coordonnées dans `[-1, 1]²`, sinon les terminaux `x` et `y` de l'intérieur casseraient le contrat. On replie l'espace avec la fonction auxiliaire `ra_fold2` (voir ci-dessous).

### Dépendance

```ts
type DependencySpec<Id extends string = string> =
    | { kind: 'function'; code: string; requires?: readonly Id[] }
    | { kind: 'uniform'; glslType: 'float' };
```

- Une **fonction** apporte du code GLSL au préambule. Elle peut en requérir d'autres.
- Un **uniform** est déclaré dans le préambule, et le renderer doit le fournir.
- **Le nom est la clé** (pas de champ `name`) : `u_phase`, `ra_fold2`. **Noms (D30)** : un uniform s'appelle `u_<nom>`, une fonction `ra_<nom>`. Les noms respectent `^[A-Za-z][A-Za-z0-9_]*$`, sans `__`. Ainsi aucune collision avec `v<n>`, `c<n>`, `v_p`, `o_color`, `main`, `PI` ni avec les mots-clés et fonctions prédéfinies du GLSL. Le `code` d'une fonction déclare lui-même son nom GLSL (il doit le contenir ; vérifié par un test).
- **`requires` est lié au registre.** Le registre est déclaré via un helper local `defineDependencies`, qui contraint les `requires` aux clés **du même objet** : une faute de frappe dans un `requires` échoue à la compilation TypeScript, pas au runtime.
- Le préambule de base, toujours émis, contient `#define PI 3.14159265359`.

Exemple :

```ts
const DEPENDENCIES = defineDependencies({
    u_phase: { kind: 'uniform', glslType: 'float' },
    ra_fold2: {
        kind: 'function',
        code: 'vec2 ra_fold2(vec2 v) { return abs(mod(v + 3.0, 4.0) - 2.0) - 1.0; }',
    },
});
```

`ra_fold2` laisse `[-1, 1]` inchangé et replie le reste dans cet intervalle, donc une déformation ne sort jamais de la plage.

## 5. Création et registre

```ts
// operators/types.ts — identité typée, n'infère que des types
defineOperator(spec): OperatorSpec<P, I, N, DependencyId>

// dependencies.ts — identité, lie les `requires` aux clés du registre
defineDependencies({ ... }): { ... }

// Catalog.ts
new Catalog(operators, dependencies): Catalog
createDefaultCatalog(): Catalog
```

`defineOperator` **infère** `P`, `I`, `N` du littéral (donc `args.a` et `params.value` sont typés) et fixe `D = DependencyId`. Il ne valide rien au runtime.

Ce qui lève une erreur **au runtime**, à la construction de l'`Operator` (donc du `Catalog`) — les seuls invariants « pas chers » :

- une entrée `inner` sans `coords`, ou `coords` sans entrée `inner` ;
- une entrée jamais écrite dans `glsl` ni `coords`.

Ce qui est vérifié **par les tests** (et, pour la plupart, déjà garanti par les types) :

- les clés d'opérateurs respectent `^[a-z][a-z0-9_]*$` ;
- les ids de dépendances suivent `u_*` / `ra_*`, sans `__`, et le `code` d'une fonction contient son nom ;
- chaque `requires` résout, sans cycle ; la fermeture de **chaque** dépendance du registre est résoluble (même celles que personne n'utilise) ;
- chaque `ParamRange` est non vide (`min < max`) ;
- la multiplicité d'une entrée ne dépend pas des paramètres (sondée à `min`, `max` et au milieu) ;
- le catalogue contient au moins un terminal.

L'**`Operator`** est la spec instanciée, telle que la consomment le générateur, le compilateur et l'UI :

```ts
type Operator = {
    readonly name: string;
    readonly label: string;
    readonly group: OperatorGroup;
    readonly params: readonly { name: string; min: number; max: number }[];
    readonly inputNames: readonly string[]; // [...inputs, ...inner]
    readonly currentCount: number; // nombre d'entrées `inputs`
    readonly requires: readonly string[];

    readonly arity: number;
    readonly isTerminal: boolean;
    readonly hasInner: boolean;

    scopeOf(index: number): 'current' | 'inner';
    multiplicity(index: number): number; // occurrences dans `glsl`
    coordsMultiplicity(index: number): number; // occurrences dans `coords` (entrées `inputs`)
    glsl(inputs: readonly string[], params: readonly number[], p: string): string;
    coords(inputs: readonly string[], params: readonly number[], p: string): string;
};
```

Le **`Catalog`** :

```ts
type Catalog = {
    operator(name: string): Operator; // erreur si inconnu
    operators(): readonly Operator[];
    terminals(): readonly Operator[]; // arité 0
    dependencies(): readonly ShaderDependency[];
    dependencyClosure(ids: readonly string[]): readonly ShaderDependency[];
    // fermeture transitive, sans doublon, dépendances d'abord
};
```

Les listes (`operators`, `terminals`, `dependencies`) sont calculées une fois, gelées. `withOutput` a disparu (un seul type de valeur). Le générateur utilise `operator`, `operators` et `terminals` ; le compilateur utilise `operator` et `dependencyClosure`.

`createDefaultCatalog()` (dans `catalog/Catalog.ts`, ré-exporté par `catalog/index.ts`) assemble `OPERATOR_SPECS` et `DEPENDENCIES` ; c'est le seul endroit qui les liste. Les autres modules reçoivent le catalogue en paramètre.

## 6. Opérateurs de départ

Toutes les formules gardent le résultat dans `[-1, 1]`. Dans la colonne GLSL, `p` désigne le contexte de coordonnées courant.

| Nom      | Groupe       | Entrées           | Formule                        | GLSL                  |
| -------- | ------------ | ----------------- | ------------------------------ | --------------------- |
| `x`      | terminal     | —                 | coordonnée x                   | `p.x`                 |
| `y`      | terminal     | —                 | coordonnée y                   | `p.y`                 |
| `const`  | terminal     | — (param `value`) | `value`                        | `value`               |
| `tsin`   | terminal     | —                 | `sin(2π·phase)`                | `sin(2.0*PI*u_phase)` |
| `tcos`   | terminal     | —                 | `cos(2π·phase)`                | `cos(2.0*PI*u_phase)` |
| `neg`    | arithmetic   | a                 | `-a`                           | `-a`                  |
| `abs`    | arithmetic   | a                 | `\|a\|`                        | `abs(a)`              |
| `sqr`    | arithmetic   | a                 | `a·a`                          | `a*a`                 |
| `add`    | arithmetic   | a, b              | `(a + b) / 2`                  | `(a+b)*0.5`           |
| `mul`    | arithmetic   | a, b              | `a·b`                          | `a*b`                 |
| `div`    | arithmetic   | a, b              | `a / (1 + \|b\|)`              | `a/(1.0+abs(b))`      |
| `min`    | arithmetic   | a, b              | `min(a, b)`                    | `min(a,b)`            |
| `max`    | arithmetic   | a, b              | `max(a, b)`                    | `max(a,b)`            |
| `mix`    | arithmetic   | a, b, t           | `a·(1−u) + b·u`, `u = (t+1)/2` | idem                  |
| `sin`    | trigonometry | a                 | `sin(π·a)`                     | `sin(PI*a)`           |
| `cos`    | trigonometry | a                 | `cos(π·a)`                     | `cos(PI*a)`           |
| `gt`     | logic        | a, b              | `a > b ? 1 : -1`               | `(a>b ? 1.0 : -1.0)`  |
| `select` | logic        | c, a, b           | `c > 0 ? a : b`                | `(c>0.0 ? a : b)`     |

`tsin` et `tcos` déclarent `requires: ['u_phase']`.

Choix à noter :

- `const.value` est dans `[-1, 1]` (`min = -1`, `max = 1`).
- **Pas de `log`, `sqrt`, `tan`, ni division brute** : pas de plage garantie. On pourra ajouter des versions « domestiquées » plus tard.
- `add` est une **moyenne**, pas une somme, pour garantir la plage.
- `sin` et `cos` ont une fréquence fixe (`π`). Une fréquence réglable sera un paramètre plus tard.
- Les valeurs de `x` et `y` sont normalisées dans `[-1, 1]`. Comment un canvas non carré est placé (étirement ou bandes) est un choix du **renderer**.

### Conditions et booléens

Il n'y a pas de type booléen en v1. Par convention, **vrai = `+1`**, **faux = `-1`**.

- `select` teste `c > 0` : tout ce qui est strictement positif est vrai. À `c = 0` exactement, on prend la branche « sinon ».
- `gt` renvoie exactement `+1` ou `-1`.
- Pas de second type : la génération et la terminaison restent identiques (D6, D7). Un booléen reste une valeur ordinaire qu'on peut passer à `mix`, `mul`…

Les opérateurs logiques existent déjà sous une autre forme :

| Logique             | Équivalent |
| ------------------- | ---------- |
| non                 | `neg`      |
| et                  | `min`      |
| ou                  | `max`      |
| inférieur (`a < b`) | `gt(b, a)` |

`select` s'appelle ainsi (comme en GLSL/WGSL) plutôt que `if`, mot réservé en TypeScript. Les deux branches sont toujours calculées, sans effet de bord.

Ces opérateurs créent des **bords nets**. En animation, ils produisent des bascules brutales quand une entrée franchit le seuil.

### Transformateur de départ : `warp` (v1)

| Nom               | Description                                                       | Mécanisme                                            |
| ----------------- | ----------------------------------------------------------------- | ---------------------------------------------------- |
| `warp(dx, dy, f)` | Évalue `f` aux coordonnées déplacées `ra_fold2(p + 0.5·(dx, dy))` | entrée `inner` + `coords` + `requires: ['ra_fold2']` |

```ts
defineOperator({
    label: 'Warp',
    group: 'transform',
    inputs: ['dx', 'dy'], // contexte courant
    inner: ['f'], // contexte déplacé, toujours en dernier
    requires: ['ra_fold2'],
    coords: ({ p, args: { dx, dy } }) => `ra_fold2(${p}+0.5*vec2(${dx},${dy}))`,
    glsl: ({ args: { f } }) => f,
});
```

`glsl` renvoie le texte de l'entrée `inner` : le résultat de `warp` _est_ la valeur de `f` calculée aux coordonnées déformées. Comme `dx` et `dy` valent au plus 1 en valeur absolue, `p + 0.5·(dx, dy)` reste dans `[-1.5, 1.5]²`, que `ra_fold2` replie dans `[-1, 1]²` : le contrat de D14 tient.

**Le contrat `coords` suffit pour les autres transformateurs** (vérifié sur le papier) : une rotation d'angle `π·a` s'écrit `ra_fold2(mat2(cos(PI*a),sin(PI*a),-sin(PI*a),cos(PI*a))*p)`, un zoom `ra_fold2(p*(1.0+a))`. Dans les deux cas, toutes les informations viennent de `p` et des entrées `inputs`. La multiplicité de `a` (4 pour la rotation) est mesurée par l'`Operator`, qui donne une variable à `a`.

`warp` est inclus dans la v1 : le mécanisme doit être validé par un vrai opérateur, et le fuzzing du compilateur le couvre. Poids par défaut `0.5`, car des `warp` imbriqués rendent les images très complexes.

### Opérateur prévu après la v1

| Nom           | Description                        | Mécanisme utilisé                       |
| ------------- | ---------------------------------- | --------------------------------------- |
| `noise(a, b)` | Bruit de valeur évalué en `(a, b)` | `requires: ['ra_hash22', 'ra_noise2d']` |

## 7. Organisation du code

```
catalog/
  format.ts             // formatGlslFloat (littéraux GLSL)
  dependencies.ts       // DependencySpec, defineDependencies, DEPENDENCIES, DependencyId
  Catalog.ts            // Catalog, createDefaultCatalog
  operators/
    types.ts            // OperatorGroup, ParamRange, OperatorSpec, defineOperator
    Operator.ts         // Operator : spec instanciée + sondage des multiplicités
    terminals.ts        // x, y, const, tsin, tcos
    arithmetic.ts       // neg, abs, sqr, add, mul, div, min, max, mix
    trigonometry.ts     // sin, cos
    logic.ts            // gt, select
    transforms.ts       // warp (et plus tard rotation, zoom)
    registry.ts         // OPERATOR_SPECS, OperatorId
  index.ts
```

Chaque fichier de `operators/` (sauf `types.ts`, `Operator.ts` et `registry.ts`) n'exporte que des `defineOperator(...)`. Aucune logique de génération ou de rendu n'y entre.

## 8. Animation

- Les terminaux `tsin` / `tcos` ne dépendent que de la phase : une animation boucle parfaitement.
- Les opérateurs continus (`sin`, `mix`, `add`…) donnent un mouvement fluide.
- `gt` et `select` produisent des **bascules brutales** : un pixel change de couleur d'un coup.
- Des `sin`, `mul` ou `sqr` imbriqués **accélèrent** le mouvement apparent.
- Ces effets se règlent par les poids de la grammaire, pas par un mode spécial.

## 9. Tests

1. **Registre** : clés d'opérateurs (`^[a-z][a-z0-9_]*$`) ; ids de dépendances (`u_*` / `ra_*`, sans `__`, le `code` d'une fonction contient son nom) ; chaque `requires` résout sans cycle ; la fermeture de **chaque** dépendance du registre est résoluble ; chaque `ParamRange` est non vide ; au moins un terminal.
2. **`Operator`** : rejette une entrée jamais utilisée ; rejette `inner` sans `coords` et l'inverse ; la **multiplicité ne dépend pas des paramètres** (sondée à `min`, `max` et au milieu) ; `sqr` a une multiplicité de 2, `warp` une `coordsMultiplicity` de 1 pour `dx`.
3. **Fermeture des dépendances** : `dependencyClosure` renvoie la fermeture transitive, sans doublon, dans un ordre où chaque dépendance précède celles qui l'utilisent.
4. **Plage (navigateur, requis)** : un shader de test applique chaque opérateur (y compris à travers `ra_fold2` pour `warp`) à des entrées contenant `-1`, `0`, `1`, `±1e-7` et des valeurs aléatoires. Il n'écrit pas la valeur (qu'un RGBA8 écrêterait) mais un **indicateur de violation** : sortie non finie (`isnan`, `isinf`) ou hors `[-1 - 1e-6, 1 + 1e-6]`. Le test lit l'indicateur. C'est une vérification de la promesse, pas une comparaison à une référence.

## 10. Décisions prises et questions restantes

Décidé (v0.3) :

- Une constante est toujours dans `[-1, 1]`.
- `warp` est dans la v1 (§6), avec son mécanisme.
- Le bruit vient après la v1.
- La plage est garantie à quelques ULP près ; les tests de plage sont requis.
- Conventions de noms `u_*` / `ra_*` (D30).

Restant ouvert (pas bloquant pour la v1) :

- Un paramètre d'harmonique entière sur `tsin` / `tcos` (`sin(2π·k·phase)`) pour que les canaux bougent à des vitesses différentes tout en bouclant. Il demande des paramètres entiers dans `ParamRange` (`integer?: true`). Repoussé en v2.
