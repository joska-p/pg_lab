# Spec — Compilateur GLSL

Version de travail 0.3. Termes définis dans `glossary.md`, décisions dans `architecture.md`, opérateurs et dépendances dans `catalog-spec.md`, expressions dans `expression-spec.md`.

## 1. Responsabilité

Le compilateur transforme une **expression** en un **fragment shader** complet, en :

1. construisant le préambule à partir des dépendances utilisées ;
2. gérant les contextes de coordonnées créés par les transformateurs ;
3. partageant les sous-expressions identiques.

Il ne dessine rien et ne connaît ni la grammaire, ni l'UI, ni la persistance. Il suppose seulement que le catalogue donné est celui avec lequel l'expression a été construite.

## 2. Principes

- **Pur et déterministe.** Mêmes entrées → même texte, caractère pour caractère (les noms de variables sont numérotés de façon stable). C'est ce qui permet les tests d'instantanés sans GPU.
- **Le texte GLSL est la sémantique.** Le compilateur ne réécrit pas les formules des opérateurs ; il les assemble.
- **Le partage est une optimisation, pas une règle.** Il se règle par une politique et se mesure (§6).
- **Aucune connaissance d'un opérateur précis.** Il lit les capacités déclarées que l'`Operator` expose (`glsl`, `coords`, `requires`), jamais le nom d'un opérateur.

## 3. Interface

```ts
type SharingPolicy = 'shared' | 'all' | 'none';

type CompileOptions = {
  sharing?: SharingPolicy;              // défaut : 'shared'
};

type CompiledShader = {
  source: string;                       // le fragment shader, GLSL ES 3.00
  uniforms: readonly { name: string; glslType: 'float' }[];   // ce que le renderer doit fournir
  animated: boolean;                    // vrai si l'uniform de phase (u_phase) est requis
  stats: {
    nodes: number;                      // taille de l'arbre (3 canaux)
    vertices: number;                   // sommets distincts du graphe après partage
    variables: number;                  // variables GLSL émises (hors coordonnées)
    contexts: number;                   // contextes de coordonnées (le contexte racine compte pour 1)
    sourceLength: number;               // longueur du source
  };
};

compile(catalog, expression, options?): CompiledShader
```

`stats` sert à l'UI (information) et aux mesures de §6.

**Erreur** : `compile` lève une erreur si le source dépasse `MAX_SOURCE_LENGTH = 200 000` caractères (D35). Cela borne la politique `none`, où des opérateurs à forte multiplicité (`sqr`, `mix`) recopient leurs entrées et font croître le texte de façon exponentielle avec la profondeur.

## 4. Contrat avec le renderer

Le renderer possède le vertex shader. Le compilateur, lui, ne produit que le fragment shader, et suppose que :

- l'entrée `in vec2 vUv;` (`[0, 1]²`, fournie par glaze) est convertie en tête de `main` par `vec2 v_p = vUv * 2.0 - 1.0;` ; `v_p` contient les coordonnées du pixel, dans `[-1, 1]²`, avec `x` vers la droite et `y` vers le **haut** de l'image. Sur une image non carrée, `[-1, 1]²` est simplement étiré sur toute l'image ; les bandes éventuelles à l'affichage relèvent de la passe finale du renderer (voir `renderer-spec.md`) ;
- la sortie est `out vec4 o_color;` ;
- les uniforms listés dans `CompiledShader.uniforms` sont fournis par le renderer (en v1 : `u_phase`, dans `[0, 1)`).

Le shader cible **GLSL ES 3.00** (`#version 300 es`, WebGL2), avec `precision highp float;`.

## 5. Algorithme

Deux temps : **abaisser** l'expression en un graphe de _sommets_ (les multiplicités sont déjà mesurées par le catalogue, §5.0), **compter** les usages, puis **émettre** le texte en décidant au passage quels sommets reçoivent une variable.

### 5.0 Multiplicité (mesurée par le catalogue, pas ici)

Le compilateur ne sonde plus : c'est l'`Operator` qui l'a fait **une fois, à sa construction** (catalogue §4–5), en appelant `glsl` et `coords` avec des **sentinelles** à la place des entrées (`@0@`, `@1@`, … ; contexte `p = '@p@'`) et les **paramètres à leur minimum**. Le nombre d'occurrences de `@i@` dans le résultat donne la multiplicité de l'entrée `i` : `multiplicity(i)` dans `glsl`, `coordsMultiplicity(i)` dans `coords` (entrées `inputs` seulement). Comme la sonde utilise le minimum des paramètres, une multiplicité ne doit pas dépendre de leur valeur — ce que le catalogue vérifie par un test (catalogue §9).

C'est ce qui rend le partage correct : dans `sqr(a)` (`a*a`), l'entrée `a` n'est référencée qu'une fois par l'arbre mais **écrite deux fois** dans le texte. Sans ces multiplicités, `a` serait écrit en ligne deux fois, et une chaîne de `sqr` ferait croître le texte comme `2^profondeur` (D29). Le catalogue garantit que chaque entrée apparaît au moins une fois (catalogue §5).

### 5.1 Abaissement (lowering)

On parcourt les trois canaux avec une **table de sommets** commune, ce qui permet le partage **entre canaux**.

Un **contexte** est un `vec2` de coordonnées. Le contexte racine s'appelle `v_p`. Il a une identité, comme les sommets.

```
lower(nœud, contexte c) → identifiant de sommet
  1. Pour chaque entrée `inputs` : id_i = lower(enfant_i, c)
  2. Si l'opérateur a des entrées `inner` :
       clé de contexte = (c, opérateur, paramètres, [id des entrées `inputs`])
       c' = contexte interné pour cette clé
       si c' vient d'être créé : usages[id_i] += mc[i] pour chaque entrée `inputs`
       pour chaque entrée `inner` : id_i = lower(enfant_i, c')
  3. clé = « c | opérateur[paramètres](id_1, id_2, …) »
     Si la clé existe dans la table → renvoyer son sommet existant.
     Sinon créer un sommet, usages[id_i] += mg[i] pour chaque entrée, l'ajouter à la table, le renvoyer.
```

Après les trois canaux, `usages[racine] += 1` pour chaque canal dont c'est la racine.

Points importants :

- **La clé d'un sommet contient son contexte.** `sin(x)` dans deux contextes différents donne deux sommets ; dans le même contexte, un seul, même s'il apparaît dans plusieurs canaux ou à plusieurs endroits.
- **Les contextes sont internés** : deux transformateurs qui ont le même contexte parent, le même opérateur, les mêmes paramètres et les mêmes entrées `inputs` créent **un seul** contexte, donc leurs entrées `inner` peuvent se partager.
- La clé utilise les **identifiants de sommets** des entrées (pas le texte des sous-arbres).
- Les **usages** d'un sommet comptent ses occurrences dans le texte des autres sommets (multiplicité `mg`), dans les coordonnées des contextes (multiplicité `mc`, comptée **une fois par contexte créé**, pas à chaque référence) et une par canal racine. Une référence répétée vers un sommet déjà existant ajoute les usages de son nouveau parent, pas les siens.
- Seuls les sommets atteignables depuis les trois racines sont créés.
- Les identifiants de sommets (`0, 1, 2…`) et de contextes (`c1, c2…`) sont attribués **dans l'ordre de création**, qui est un **ordre topologique** : un sommet ou un contexte est toujours créé après ce dont il dépend. On garde cet ordre comme **programme**.

Limite connue : un terminal qui ne dépend pas des coordonnées (une constante, `tsin`) est dupliqué d'un contexte à l'autre, puisque le compilateur ne sait pas qu'il est indépendant du contexte. C'est sans conséquence en pratique (le compilateur du pilote simplifie les constantes).

### 5.2 Partage : qui reçoit une variable

Un **atome** est un texte GLSL qui est un identifiant, un littéral (un négatif entre parenthèses compris) ou un accès de composante (`v_p.x`, `0.3`, `(-0.3)`, `u_phase`). Les atomes ne valent jamais la peine d'une variable. **`tsin` n'est pas un atome** : son texte est `sin(2.0*PI*u_phase)`. Utilisé deux fois, il reçoit une variable.

Un sommet reçoit une **variable** selon la politique :

| Politique         | Un sommet a une variable si…                                     |
| ----------------- | ---------------------------------------------------------------- |
| `none`            | jamais (tout est écrit en ligne ; un sommet partagé est recopié) |
| `shared` (défaut) | il a **au moins 2 usages** et son texte n'est pas un atome       |
| `all`             | toujours (même les atomes)                                       |

Les variables de **contexte** sont toujours émises, quelle que soit la politique.

Savoir si un texte est un atome demande de connaître ce texte, qui dépend des variables de ses entrées. La décision se prend donc **dans l'ordre du programme, au moment de l'émission** (§5.3), et non avant.

### 5.3 Émission

On parcourt le programme dans l'ordre. Le texte d'un sommet est :

- le **nom de sa variable** si elle en a une (`v<id>`) ;
- sinon le résultat de `operator.glsl(textes des entrées, paramètres, nom du contexte)`.

Règles de texte :

- **Parenthésage.** Tout texte en ligne qui n'est pas un atome est entouré de parenthèses quand il sert d'entrée à un autre opérateur. Cela évite les erreurs de précédence, et un cas particulier de GLSL : `-` suivi d'une constante négative donnerait `--0.3`, qui est un décrément invalide ; avec les parenthèses on obtient `-(-0.3)`.
- **Littéraux.** Un nombre est écrit avec sa représentation JavaScript la plus courte, avec `.0` ajouté s'il n'a ni point ni exposant (`1e-7` est un littéral GLSL ES 3.00 valide tel quel). Un nombre négatif est entouré de parenthèses. Exemples : `1` → `1.0`, `0.3` → `0.3`, `-0.3` → `(-0.3)`.
- **Variable** : `float v<id> = <texte brut>;`.
- **Contexte** : `vec2 c<n> = <operator.coords(entrées inputs, paramètres, contexte parent)>;`.

Fin de `main` : on assemble les trois canaux et on convertit de `[-1, 1]` vers `[0, 1]` :

```glsl
vec3 rgb = vec3(<r>, <g>, <b>);
o_color = vec4(clamp(rgb * 0.5 + 0.5, 0.0, 1.0), 1.0);
```

Le `clamp` ne masque pas le contrat `[-1, 1]` des opérateurs (testé par ailleurs, D31) : il protège seulement des erreurs d'arrondi de quelques ULP.

### 5.4 Le préambule

Dans cet ordre :

1. `precision highp float;` (pas de `#version` : glaze l'ajoute à l'exécution)
2. `in vec2 vUv;` et `out vec4 o_color;`
3. `uniform float u_phase;` (toujours déclaré), puis les autres uniforms de la fermeture des dépendances
4. `const float PI = 3.141592653589793;`
5. le code des fonctions de la **fermeture des dépendances** (`catalog.dependencyClosure`) des opérateurs utilisés, sans doublon et dans l'ordre de dépendance

Une dépendance que personne n'utilise n'est jamais émise.

### Exemple

Expression : `r = sin(x)`, `g = add(sin(x), y)`, `b = tsin`.

Identifiants dans l'ordre de création : `x` = 0, `sin(x)` = 1, `y` = 2, `add` = 3, `tsin` = 4. `sin(x)` a 2 usages (la racine `r` et `add`) : c'est un sommet partagé, donc une variable. `tsin` n'a qu'un usage et reste en ligne.

```glsl
precision highp float;

in vec2 vUv;
out vec4 o_color;

uniform float u_phase;

const float PI = 3.141592653589793;

void main() {
  vec2 v_p = vUv * 2.0 - 1.0;

  float v1 = sin(PI*v_p.x);
  vec3 rgb = vec3(v1, (v1+v_p.y)*0.5, sin(2.0*PI*u_phase));
  o_color = vec4(clamp(rgb * 0.5 + 0.5, 0.0, 1.0), 1.0);
}
```

Les atomes (`x`, `y`) ont aussi un identifiant de sommet ; seuls les sommets à variable apparaissent dans le texte, d'où `v1` et pas `v0`. C'est voulu : l'identifiant est stable.

## 6. Mesurer plutôt que deviner

Le partage n'est pas toujours favorable : trop de variables peuvent augmenter la pression sur les registres, trop peu dupliquent du calcul. Les pilotes GPU font déjà une partie du travail. La politique est donc **réglable**, et `none` / `shared` / `all` sont des moyens de comparer :

- `none` : le calcul brut de référence, sans partage (borné par `MAX_SOURCE_LENGTH`) ;
- `shared` : le compromis par défaut ;
- `all` : tous les sommets nommés, qui laisse au pilote le soin de décider.

À mesurer plus tard sur de vraies expressions : temps de compilation du shader, temps d'image, sur plusieurs machines. Le défaut sera ajusté d'après les chiffres, pas d'après l'intuition.

## 7. Organisation du code

```
compiler/
  types.ts        // SharingPolicy, CompileOptions, CompiledShader
  lower.ts        // abaissement : sommets, contextes internés, usages (multiplicités)
  emit.ts         // programme → lignes GLSL, décision de variable (atomes, politique)
  format.ts       // littéraux, parenthésage, atomes
  preamble.ts     // préambule
  compile.ts      // assemble le tout
  index.ts
```

Chaque fichier a une seule tâche, et `compile.ts` ne fait qu'enchaîner : `lower` → `emit` → préambule.

## 8. Tests

Les tests utilisent le catalogue par défaut, `warp` compris (transformateur réel : entrée `inner`, `coords`, dépendance `ra_fold2`).

1. **Instantanés** du GLSL pour des expressions écrites à la main : un terminal seul, une sous-expression partagée, une constante négative sous `neg`, un transformateur.
2. **Partage entre canaux** : une même sous-expression dans `r` et `g` produit une seule variable.
3. **Contextes** : la même sous-expression dans deux contextes différents produit **deux** sommets ; deux transformateurs identiques ne créent **qu'un** contexte.
4. **Préambule** : fermeture dans le bon ordre, sans doublon, sans dépendance inutilisée, uniform déclaré une fois.
5. **Politiques** : `none`, `shared` et `all` produisent des programmes différents, avec les bonnes valeurs de `stats` (dont `vertices`).
6. **Déterminisme** : deux compilations donnent le même texte.
7. **Littéraux** : `1`, `0.3`, `-0.3`, `1e-7` sont écrits comme du GLSL valide.
8. **Fuzzing (navigateur, requis)** : on génère un millier d'expressions avec le générateur, on les compile avec chaque politique, et on vérifie que le **pilote accepte le shader** (aucune erreur de compilation).
9. **Équivalence des politiques (navigateur, requis)** : une même expression rendue avec `none`, `shared` et `all` donne la même image, à une petite tolérance près.

## 9. Décisions prises

- **Cible : WebGL2 (GLSL ES 3.00)**, confirmée. WebGPU, si elle vient, demandera un champ `wgsl` à côté de `glsl` ; ce n'est pas dans le périmètre.
- **Aperçu d'une sous-expression** (inspection par `Address`) : on la compile seule, dans le contexte racine. Si elle se trouve sous un transformateur, l'aperçu **n'inclut pas la déformation de ses ancêtres**. Limite acceptée en v1, à signaler dans l'UI.
- **Terminaux indépendants du contexte** : dupliqués par contexte, sans conséquence. Pas de champ de catalogue en v1.
- **Mesures de performance** (§6) : à faire quand il y aura un renderer. Le défaut `shared` est provisoire.
