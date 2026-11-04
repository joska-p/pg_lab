### 1. Itérer plutôt qu'indexer

Boucles `for (let i...)` qui lisent `arr[i]` : réécrire en `for...of`.
Si l'index est nécessaire : `for (const [i, x] of arr.entries())`.
Pour deux tableaux parallèles, parcourir l'un avec `entries()` et traiter
explicitement le cas où l'autre n'a pas d'élément à l'index `i`.

### 2. Typer plus finement (fixer la cause, pas le symptôme)

- `Record<string, T>` dont les clés sont connues : remplacer par une union de clés
  (`Record<"a" | "b", T>`) ou un objet/interface. Aucun `undefined` n'est ajouté.
- Tableau de longueur fixe (couleurs RGB, coordonnées, etc.) : typer comme tuple
  (`[number, number, number]`) au lieu de `number[]`.
- Si la clé est dynamique et peut vraiment manquer : envisager `Map<K, V>`
  (`Map.get` renvoie déjà `T | undefined`, donc le code est honnête).

### 3. Valeur par défaut, quand un fallback est légitime

```ts
const home = env['HOME'] ?? '/tmp';
const first = users.at(0) ?? fallbackUser;
const [first = 'anonymous'] = users; // destructuring avec défaut
```

Ne l'utiliser que si le fallback a un sens métier. Ne pas inventer une valeur
bidon (`""`, `0`, `false`) juste pour faire passer le compilateur.

### 4. Narrowing explicite quand l'élément est requis

Extraire l'élément dans une variable locale, puis vérifier cette variable
(ne pas se reposer sur un contrôle de `length`, le narrowing est peu fiable) :

```ts
const first = xs[0];
if (first === undefined) throw new Error('liste vide');
return first; // T
```

Si l'absence est une vraie erreur de programmation, lever une erreur claire.
Si elle est normale, retourner tôt (`return null`, `continue`, etc.).
