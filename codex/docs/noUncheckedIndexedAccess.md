# TypeScript — Guide de robustesse des types

L'objectif est de produire du code dont les types reflètent réellement les invariants du programme. Face à une erreur TypeScript, corriger d'abord la modélisation des données plutôt que de contourner le compilateur.

### 1. Itérer plutôt qu'indexer

Boucles `for (let i...)` qui lisent `arr[i]` : réécrire en `for...of`.

Si l'index est nécessaire : `for (const [i, x] of arr.entries())`.

Pour deux tableaux parallèles, parcourir l'un avec `entries()` et traiter explicitement le cas où l'autre n'a pas d'élément à l'index `i`.

```ts
for (const [i, user] of users.entries()) {
    const score = scores[i];

    if (score === undefined) continue;

    process(user, score);
}
```

Ne pas supposer que deux tableaux ont la même longueur sans invariant explicite qui le garantit.

### 2. Typer plus finement (fixer la cause, pas le symptôme)

- **Clés connues à l'avance** : préférer une union de clés (`Record<"a" | "b", T>`) ou une interface à `Record<string, T>`. Le type exprime alors précisément les clés autorisées.
- **Tableau de longueur fixe** (couleurs RGB, coordonnées, etc.) : utiliser un tuple (`[number, number, number]`) plutôt que `number[]`.
- **Clé dynamique pouvant réellement manquer** : envisager `Map<K, V>`. `Map.get()` renvoie `V | undefined`, ce qui rend l'absence explicite.
- **Propriété facultative** : utiliser `prop?: T` si l'absence fait partie du modèle, plutôt que de rendre artificiellement la propriété obligatoire.

Attention : `Record<string, T>` ne garantit pas que toutes les clés possibles existent. Avec `noUncheckedIndexedAccess`, une lecture par clé dynamique renvoie `T | undefined`.

### 3. Valeur par défaut, quand un fallback est légitime

```ts
const home = env['HOME'] ?? '/tmp';
const first = users.at(0) ?? fallbackUser;
const [first = 'anonymous'] = users;
```

Ne l'utiliser que si le fallback a un sens métier.

Ne pas inventer une valeur bidon (`""`, `0`, `false`) juste pour faire passer le compilateur.

Un fallback doit représenter un comportement réellement prévu, pas masquer une donnée manquante ou un invariant violé.

### 4. Narrowing explicite quand l'élément est requis

Extraire l'élément dans une variable locale, puis vérifier cette variable (ne pas se reposer sur un contrôle de `length`, le narrowing est peu fiable) :

```ts
const first = xs[0];

if (first === undefined) {
    throw new Error('Liste vide');
}

return first; // T
```

- Si l'absence est une vraie erreur de programmation, lever une erreur claire.
- Si elle est normale, retourner tôt (`return null`, `continue`, etc.).
- Éviter les assertions non nulles (`!`) lorsqu'un contrôle explicite est possible.

### 5. Registres statiques : déclarer les données, dériver les types

Pour une collection finie et connue à l'avance (expériences, routes, plugins, commandes...), préférer un tableau de définitions explicites.

```ts
interface Experiment<TId extends string = string> {
    readonly id: TId;
    readonly label: string;
}

export const EXPERIMENTS = [
    { id: 'spirale', label: 'Spirale' },
    { id: 'seed', label: 'Seed' },
    { id: 'folded-space', label: 'Folded space' },
] as const satisfies readonly Experiment[];
```

Dériver les types depuis la source de vérité :

```ts
export type ExperimentDefinition = (typeof EXPERIMENTS)[number];
export type ExperimentKey = ExperimentDefinition['id'];
```

On obtient automatiquement l'union :

```ts
type ExperimentKey = 'spirale' | 'seed' | 'folded-space';
```

Construire les options et autres représentations dérivées depuis le registre, plutôt que maintenir plusieurs listes synchronisées :

```ts
export const experimentOptions = EXPERIMENTS.map(({ id, label }) => ({ value: id, label }));
```

**Pour les recherches par identifiant**, construire un index `Map` :

```ts
const experimentsById = new Map<string, ExperimentDefinition>(
    EXPERIMENTS.map((experiment) => [experiment.id, experiment]),
);

export function getExperiment(id: string | undefined): ExperimentDefinition {
    const experiment = experimentsById.get(id ?? '');

    if (experiment === undefined) {
        return EXPERIMENTS[0];
    }

    return experiment;
}
```

Le `string` de la `Map` est volontaire : une valeur venant d'une URL, d'un paramètre externe ou d'un stockage est une chaîne arbitraire, pas nécessairement un `ExperimentKey`.

La fonction `getExperiment` centralise la résolution et le fallback. Elle constitue aussi la frontière entre une entrée externe non vérifiée et les données internes typées.

**Principes à retenir :**

- Le tableau est la source de vérité.
- Les unions de types sont dérivées des données, jamais maintenues manuellement.
- `as const` préserve les valeurs littérales.
- `satisfies` vérifie la structure sans élargir le type inféré.
- Une `Map<string, T>` convient à la recherche depuis une clé externe potentiellement inconnue.
- Ne pas utiliser `Object.keys(obj) as (keyof typeof obj)[]` pour récupérer artificiellement un typage que JavaScript ne garantit pas.

### 6. Assertions : dernier recours

Une assertion (`as T`) ne vérifie pas une valeur à l'exécution : elle demande simplement à TypeScript de faire confiance au développeur.

Avant d'en utiliser une :

1. Peut-on mieux typer la donnée à sa source ?
2. Peut-on dériver le type depuis une définition existante ?
3. Peut-on effectuer un contrôle explicite à l'exécution ?
4. Peut-on restructurer le code pour rendre l'invariant évident ?

Si une assertion reste nécessaire, la limiter à une frontière bien identifiée et documenter l'invariant qui la justifie.

Éviter les chaînes d'assertions (`as unknown as T`) et les assertions utilisées uniquement pour faire taire une erreur.
