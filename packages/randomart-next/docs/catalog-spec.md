# Spec — Catalogue

Version de travail 0.3. Termes définis dans `glossary.md`, décisions dans `architecture.md`.

## 1. Responsabilité

Le catalogue **déclare** les opérateurs et les dépendances shader, et permet de les retrouver. Il ne génère rien et ne compile rien : il fournit les définitions que les autres modules consomment.

## 2. Principes

- **Un opérateur est une donnée.** Ajouter un opérateur = ajouter une entrée, sans modifier le générateur ou le compilateur.
- **Opérateurs honnêtes.** Chaque opérateur accepte des valeurs dans `[-1, 1]` et promet de renvoyer une valeur dans `[-1, 1]`, finie, pour toute entrée, **à quelques ULP près** (tolérance de test `1e-6`, D31 ; le `clamp` final du shader absorbe l'arrondi). Il est _construit_ pour que ce soit vrai, sans cas d'erreur.
- **Le GLSL est la sémantique.** Il n'y a pas de seconde implémentation à garder cohérente.
- **Des capacités, pas des genres.** Un opérateur déclare ce dont il a besoin (`requires`, portée des entrées). Aucun code ne fait de `switch` sur un « type d'opérateur ».

## 3. Types

```ts
type ValueType = 'float'; // v1 : un seul type, dans [-1, 1] par contrat
```

La plage `[-1, 1]` est un **contrat du catalogue**, vérifié par la construction des formules et par un test en navigateur (§9). `ValueType` existe pour qu'un `vec3` puisse être ajouté plus tard sans changer la forme des définitions.

## 4. Définitions

### Opérateur

```ts
type InputDef = {
    type: ValueType;
    scope?: 'current' | 'inner'; // défaut : 'current'
};

type ParamDef = {
    name: string; // "value"
    min: number;
    max: number;
};

type GlslContext = {
    p: string; // nom GLSL du vec2 de coordonnées courant : "v_p" (racine) ou "c1", "c2"…
};

type OperatorDef = {
    name: string; // unique, ex. "sin"
    family: string; // "terminal" | "arithmetic" | "trigonometry" | "logic" | ...
    inputs: readonly InputDef[]; // [] pour un terminal
    output: ValueType;
    params?: readonly ParamDef[]; // ex. la constante a un paramètre "value"
    requires?: readonly string[]; // noms de dépendances (§ ci-dessous)
    innerCoords?: (
        inputs: readonly string[],
        params: readonly number[],
        ctx: GlslContext,
    ) => string;
    // requis si une entrée a scope 'inner' ; reçoit UNIQUEMENT les entrées
    // 'current' (dans l'ordre), car les entrées 'inner' en dépendent ;
    // renvoie une expression GLSL vec2
    glsl: (inputs: readonly string[], params: readonly number[], ctx: GlslContext) => string;
    cost?: number; // optionnel, réservé
};
```

Remarques :

- **Arité** = `inputs.length`. **Terminal** = arité 0.
- `glsl` renvoie une _expression_ GLSL à partir des expressions GLSL de ses entrées et du contexte. Le compilateur décide s'il faut les stocker dans des variables.
- `params` sont les valeurs propres à un nœud (la constante), tirées par le générateur dans `[min, max]`.
- **Contexte de coordonnées** : un terminal comme `x` écrit `` `${ctx.p}.x` ``, jamais `p.x` en dur.
- **Entrées de `glsl`** : `glsl` reçoit les textes de **toutes** les entrées, dans l'ordre déclaré (`current` et `inner` mêlées). `innerCoords` ne reçoit que les entrées `current`.
- **Multiplicité** : un opérateur peut écrire une même entrée plusieurs fois (`sqr` : `a*a`). Le compilateur le mesure en sondant `glsl` et `innerCoords` avec des sentinelles (D29) ; rien à déclarer. Chaque entrée doit apparaître **au moins une fois** dans `glsl` ou `innerCoords` (vérifié à la création du catalogue).
- **Portée `inner`** : les entrées `inner` sont compilées dans un nouveau contexte dont les coordonnées sont données par `innerCoords`. Les entrées `current` (qui servent à calculer ces coordonnées) restent dans le contexte courant.
- **Règle** : `innerCoords` doit renvoyer des coordonnées dans `[-1, 1]²`, sinon les terminaux `x` et `y` de l'intérieur casseraient le contrat. On replie l'espace avec la fonction auxiliaire `ra_fold2` (voir ci-dessous).

### Dépendance

```ts
type ShaderDependency =
    | { kind: 'function'; name: string; code: string; requires?: readonly string[] }
    | { kind: 'uniform'; name: string; glslType: 'float' };
```

- Une **fonction** apporte du code GLSL au préambule. Elle peut en requérir d'autres.
- Un **uniform** est déclaré dans le préambule, et le renderer doit le fournir.
- **Noms (D30)** : un uniform s'appelle `u_<nom>`, une fonction `ra_<nom>`. Les noms respectent `^[A-Za-z][A-Za-z0-9_]*$`, sans `__`. Ainsi aucune collision avec `v<n>`, `c<n>`, `v_p`, `o_color`, `main`, `PI` ni avec les mots-clés et fonctions prédéfinies du GLSL.
- Le préambule de base, toujours émis, contient `#define PI 3.14159265359`.

Exemple :

```ts
defineDependency({
    kind: 'function',
    name: 'ra_fold2',
    code: 'vec2 ra_fold2(vec2 v) { return abs(mod(v + 3.0, 4.0) - 2.0) - 1.0; }',
});
```

`ra_fold2` laisse `[-1, 1]` inchangé et replie le reste dans cet intervalle, donc une déformation ne sort jamais de la plage.

## 5. Création et registre

```ts
defineOperator(def): OperatorDef
defineDependency(dep): ShaderDependency
createCatalog({ operators, dependencies }): Catalog
```

`defineOperator` lève une erreur si :

- le nom ne respecte pas `^[a-z][a-z0-9_]*$` (il apparaît dans les clés canoniques et dans les fichiers) ;
- `glsl` manque ;
- un `ParamDef` a `min >= max` ;
- une entrée a `scope: 'inner'` sans `innerCoords`, ou l'inverse.

`createCatalog` lève une erreur si :

- deux opérateurs ou deux dépendances ont le même nom ;
- un `requires` référence une dépendance inconnue ;
- les dépendances forment un cycle ;
- aucun terminal n'existe ;
- un nom de dépendance ne respecte pas la convention de §4 (`u_*` pour un uniform, `ra_*` pour une fonction). Pour une fonction, `name` est le nom GLSL de la fonction ;
- une entrée n'apparaît ni dans `glsl` ni dans `innerCoords` : le catalogue sonde chaque opérateur avec des sentinelles et les paramètres à `min` ;

```ts
type Catalog = {
    operator(name: string): OperatorDef; // erreur si inconnu
    operators(): readonly OperatorDef[];
    terminals(): readonly OperatorDef[]; // arité 0
    withOutput(type: ValueType): readonly OperatorDef[];
    dependencyClosure(names: readonly string[]): readonly ShaderDependency[];
    // fermeture transitive, sans doublon, triée
};
```

Le générateur utilise `terminals`, `operators` et `withOutput`. Le compilateur utilise `dependencyClosure`.

`createDefaultCatalog(): Catalog` (dans `catalog/index.ts`) assemble les opérateurs et dépendances de départ ; c'est le seul endroit qui les liste. Les autres modules reçoivent le catalogue en paramètre.

## 6. Opérateurs de départ

Toutes les formules gardent le résultat dans `[-1, 1]`. Dans la colonne GLSL, `p` désigne le contexte de coordonnées courant.

| Nom      | Famille      | Entrées           | Formule                        | GLSL                  |
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

| Nom               | Description                                                       | Mécanisme                                                 |
| ----------------- | ----------------------------------------------------------------- | --------------------------------------------------------- |
| `warp(dx, dy, f)` | Évalue `f` aux coordonnées déplacées `ra_fold2(p + 0.5·(dx, dy))` | portée `inner` + `innerCoords` + `requires: ['ra_fold2']` |

```ts
defineOperator({
    name: 'warp',
    family: 'transform',
    inputs: [{ type: 'float' }, { type: 'float' }, { type: 'float', scope: 'inner' }],
    output: 'float',
    requires: ['ra_fold2'],
    innerCoords: ([dx, dy], _params, ctx) => `ra_fold2(${ctx.p}+0.5*vec2(${dx},${dy}))`,
    glsl: ([, , f]) => f,
});
```

`glsl` renvoie le texte de l'entrée `inner` : le résultat de `warp` _est_ la valeur de `f` calculée aux coordonnées déformées. Comme `dx` et `dy` valent au plus 1 en valeur absolue, `p + 0.5·(dx, dy)` reste dans `[-1.5, 1.5]²`, que `ra_fold2` replie dans `[-1, 1]²` : le contrat de D14 tient.

**Le contrat `innerCoords` suffit pour les autres transformateurs** (vérifié sur le papier) : une rotation d'angle `π·a` s'écrit `ra_fold2(mat2(cos(PI*a),sin(PI*a),-sin(PI*a),cos(PI*a))*p)`, un zoom `ra_fold2(p*(1.0+a))`. Dans les deux cas, toutes les informations viennent de `p` et des entrées `current`. La multiplicité de `a` (4 pour la rotation) est mesurée par le compilateur, qui donne une variable à `a`.

`warp` est inclus dans la v1 : le mécanisme doit être validé par un vrai opérateur, et le fuzzing du compilateur le couvre. Poids par défaut `0.5`, car des `warp` imbriqués rendent les images très complexes.

### Opérateur prévu après la v1

| Nom           | Description                        | Mécanisme utilisé                       |
| ------------- | ---------------------------------- | --------------------------------------- |
| `noise(a, b)` | Bruit de valeur évalué en `(a, b)` | `requires: ['ra_hash22', 'ra_noise2d']` |

## 7. Organisation du code

```
catalog/
  types.ts              // ValueType, InputDef, ParamDef, OperatorDef, ShaderDependency
  define.ts             // defineOperator, defineDependency
  catalog.ts            // createCatalog
  operators/
    terminals.ts        // x, y, const, tsin, tcos
    arithmetic.ts       // neg, abs, sqr, add, mul, div, min, max, mix
    trigonometry.ts     // sin, cos
    logic.ts            // gt, select
    index.ts            // assemble la liste complète
  dependencies/
    uniforms.ts         // u_phase
    helpers.ts          // ra_fold2 (et plus tard ra_hash22, ra_noise2d)
    index.ts
```

Chaque fichier n'exporte que des `defineOperator(...)` ou `defineDependency(...)`. Aucune logique de génération ou de rendu n'y entre.

## 8. Animation

- Les terminaux `tsin` / `tcos` ne dépendent que de la phase : une animation boucle parfaitement.
- Les opérateurs continus (`sin`, `mix`, `add`…) donnent un mouvement fluide.
- `gt` et `select` produisent des **bascules brutales** : un pixel change de couleur d'un coup.
- Des `sin`, `mul` ou `sqr` imbriqués **accélèrent** le mouvement apparent.
- Ces effets se règlent par les poids de la grammaire, pas par un mode spécial.

## 9. Tests

1. **Catalogue** : noms uniques, définitions valides, dépendances résolues, pas de cycle, au moins un terminal.
2. **Définitions invalides** : `defineOperator` et `createCatalog` rejettent chaque cas listé en §5.
3. **Fermeture des dépendances** : `dependencyClosure` renvoie la fermeture transitive, sans doublon, dans un ordre où chaque dépendance précède celles qui l'utilisent.
4. **Plage (navigateur, requis)** : un shader de test applique chaque opérateur (y compris à travers `ra_fold2` pour `warp`) à des entrées contenant `-1`, `0`, `1`, `±1e-7` et des valeurs aléatoires. Il n'écrit pas la valeur (qu'un RGBA8 écrêterait) mais un **indicateur de violation** : sortie non finie (`isnan`, `isinf`) ou hors `[-1 - 1e-6, 1 + 1e-6]`. Le test lit l'indicateur. C'est une vérification de la promesse, pas une comparaison à une référence.
5. **Sondage** : pour chaque opérateur, chaque entrée apparaît au moins une fois dans `glsl` ou `innerCoords` ; la multiplicité de `sqr` est 2, celle de `add` est 1 par entrée.

## 10. Décisions prises et questions restantes

Décidé (v0.3) :

- Une constante est toujours dans `[-1, 1]`.
- `warp` est dans la v1 (§6), avec son mécanisme.
- Le bruit vient après la v1.
- La plage est garantie à quelques ULP près ; les tests de plage sont requis.
- Conventions de noms `u_*` / `ra_*` (D30).

Restant ouvert (pas bloquant pour la v1) :

- Un paramètre d'harmonique entière sur `tsin` / `tcos` (`sin(2π·k·phase)`) pour que les canaux bougent à des vitesses différentes tout en bouclant. Il demande des paramètres entiers dans `ParamDef` (`integer?: true`). Repoussé en v2.
- Un champ `display` sur `OperatorDef` pour la formule lisible (v2, voir `expression-spec.md`).
