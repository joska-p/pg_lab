# Spec — Modèle d'expression

Version de travail 0.2. Termes définis dans `glossary.md`, décisions dans `architecture.md`, opérateurs dans `catalog-spec.md`.

## 1. Responsabilité

Le module **expression** représente une expression, garantit qu'elle est valide, et la sérialise. C'est de la donnée pure : il ne génère rien, ne compile rien, ne dessine rien.

Il dépend uniquement du catalogue (pour valider). Il ne sait rien de la grammaire, du GPU, du temps ni de l'UI.

## 2. Principes

- **Un état invalide est impossible à construire.** On ne peut obtenir un nœud ou une expression qu'à travers `createNode` et `createExpression`, qui valident. Pas de vérification dispersée plus tard (même esprit que les constructeurs validants du reste du code, du type `createFontSize`).
- **Immuable.** Une expression ne change jamais ; modifier = en construire une nouvelle.
- **Les nœuds ne connaissent que des noms.** Un nœud référence son opérateur par son nom, pas par un objet du catalogue. La sérialisation devient triviale et le catalogue peut évoluer sans casser les données.
- **Le modèle n'a aucune notion de portée ou de coordonnées.** Qu'une entrée soit évaluée dans un autre contexte est l'affaire du catalogue et du compilateur.

## 3. Types

```ts
type Node = Brand<
    {
        readonly op: string; // nom de l'opérateur
        readonly params: readonly number[]; // valeurs propres au nœud (ex. la constante)
        readonly inputs: readonly Node[]; // sous-expressions, dans l'ordre des entrées de l'opérateur
    },
    'Node'
>;

type Channel = 'r' | 'g' | 'b';

type Expression = Brand<
    {
        readonly r: Node;
        readonly g: Node;
        readonly b: Node;
    },
    'Expression'
>;

type Address = {
    // désigne un nœud dans une expression
    readonly channel: Channel;
    readonly path: readonly number[]; // indices d'entrée à suivre depuis la racine ; [] = la racine
};
```

Les nœuds sont gelés (`Object.freeze`). Le même nœud peut être référencé à plusieurs endroits en mémoire ; cela ne change pas la sémantique (c'est de l'économie de mémoire, pas du partage logique, qui est la tâche du compilateur).

## 4. Construction et validation

```ts
createNode(catalog, op, inputs, params?): Node
createExpression(r, g, b): Expression
```

`createNode` lève une erreur si :

- l'opérateur n'existe pas dans le catalogue ;
- le nombre d'entrées ne correspond pas à l'arité de l'opérateur ;
- le type d'une entrée ne correspond pas à son `InputDef` (en v1 : tout est `float`, donc toujours vrai, mais la vérification existe pour l'arrivée d'autres types) ;
- le nombre de paramètres ne correspond pas à `params` de l'opérateur ;
- un paramètre n'est pas fini ou sort de `[min, max]`.

`createExpression` ne vérifie rien de plus : chaque canal est déjà un `Node` valide, de type `float` en sortie.

Les **contraintes de grammaire** (profondeur max, nombre de nœuds max, vocabulaire) ne sont **pas** vérifiées ici : c'est le travail de la grammaire et du générateur. Une expression valide n'est pas forcément issue d'une grammaire.

## 4 bis. Sécurité à l'import

`deserialize` (§7) refuse une expression de plus de **5 000 nœuds** au total ou de profondeur supérieure à **64**, pour éviter de compiler un shader absurde et de saturer la pile à partir d'un fichier (D35). Les limites sont des constantes du module (`MAX_IMPORT_NODES`, `MAX_IMPORT_DEPTH`), pas des règles de grammaire. Le contrôle de la profondeur se fait pendant la lecture, avant de créer les nœuds, et le parcours est récursif borné par 64.

## 5. Identité structurelle

Deux nœuds sont **structurellement égaux** s'ils ont le même opérateur, les mêmes paramètres et des entrées structurellement égales.

```ts
nodeKey(node): string        // clé canonique, calculée une fois puis mise en cache (`WeakMap` sur les nœuds gelés)
equals(a, b): boolean        // nodeKey(a) === nodeKey(b)
```

La clé est canonique et déterministe :

```
op[p1,p2](clé1,clé2,…)
```

Par exemple `add[](x[](),const[0.3]())`. Les nombres utilisent leur écriture JavaScript la plus courte qui se relit exactement, donc deux valeurs identiques donnent toujours la même clé. `createNode` normalise `-0` en `0`. Le format est non ambigu parce que les noms d'opérateurs respectent `^[a-z][a-z0-9_]*$` (catalogue §5).

La clé **ne contient pas le contexte de coordonnées**. Elle dit seulement « même sous-arbre ». C'est le compilateur qui y ajoute le contexte pour décider du partage (voir `architecture.md`).

## 6. Mesures et parcours

```ts
depth(node): number                      // une feuille a une profondeur de 1
nodeCount(target: Node | Expression): number
usedOperators(expression): ReadonlySet<string>

getNode(expression, address): Node       // erreur si l'adresse n'existe pas
walk(expression, visitor): void          // visite chaque nœud avec son Address
```

- `nodeCount` d'une expression est la somme des trois canaux (les nœuds égaux comptent pour autant d'occurrences : c'est la taille de l'arbre, pas du graphe).
- `usedOperators` sert au compilateur pour collecter les dépendances, et à l'UI pour résumer une œuvre.
- `Address` est ce que l'UI utilise pour désigner un sous-arbre (survol, aperçu d'une sous-expression, plus tard édition).

Les opérations suivantes ne sont **pas** du ressort de ce module, mais l'UI peut les dériver des fonctions ci-dessus :

- la **vue graphe** : fusionner les nœuds de même `nodeKey` ;
- la **vue arbre** : parcourir avec `walk` ;
- la **formule lisible** : voir §10.

## 7. Sérialisation

```ts
serialize(expression): ExpressionData      // objet JSON simple
deserialize(catalog, data: unknown): Expression
```

Format :

```json
{
    "r": { "op": "sin", "in": [{ "op": "x" }] },
    "g": { "op": "add", "in": [{ "op": "y" }, { "op": "const", "params": [0.3] }] },
    "b": { "op": "tsin" }
}
```

- Les champs vides sont omis : `in` si l'opérateur est un terminal, `params` s'il n'en a pas.
- Les clés sont toujours dans le même ordre (`op`, `params`, `in`), donc deux expressions égales sont sérialisées en un texte identique.
- Le format **ne contient pas de version** : la version de fichier appartient à l'œuvre (D4, module `artwork`).

`deserialize` accepte une entrée de type inconnu et la **valide** à travers `createNode`. En cas d'erreur, le message indique l'adresse précise, par exemple :

```
Expression invalide à g.in[1] : l'opérateur "foo" n'existe pas dans le catalogue
```

Il refuse aussi toute forme inattendue (champ manquant, type incorrect) et la limite de §4 bis.

## 8. Organisation du code

```
expression/
  types.ts           // Node, Expression, Channel, Address
  node.ts            // createNode et ses validations
  expression.ts      // createExpression
  key.ts             // nodeKey, equals
  metrics.ts         // depth, nodeCount, usedOperators, getNode, walk
  serialize.ts       // serialize, deserialize
  index.ts
```

## 9. Tests

1. **Construction valide** : un nœud correct est accepté, et gelé.
2. **Rejets** : opérateur inconnu, mauvaise arité, mauvais nombre de paramètres, paramètre hors plage, paramètre non fini.
3. **Identité** : deux nœuds de même structure ont la même clé ; changer un paramètre, un opérateur ou l'ordre des entrées change la clé.
4. **Mesures** : `depth`, `nodeCount`, `usedOperators` sur des exemples écrits à la main.
5. **Adresses** : `getNode` et `walk` sont cohérents (chaque adresse visitée est retrouvée par `getNode`).
6. **Aller-retour** : `deserialize(serialize(e))` est égal à `e` pour des expressions variées.
7. **Erreurs d'import** : champ manquant, opérateur inconnu, plus de 5 000 nœuds, profondeur supérieure à 64 : chacun donne une erreur avec la bonne adresse.

## 10. Décisions prises

- **Formule lisible.** En v1, l'inspecteur affiche une notation fonctionnelle générée automatiquement à partir des noms (`add(sin(x), 0.3)`). Un champ `display` sur `OperatorDef` (`(a+b)/2`, `sin(πa)`) viendra en v2, quand l'UI en aura besoin.
- **Arrondi des paramètres.** Le **générateur** arrondit à 3 décimales (grammaire §6) ; le modèle n'arrondit rien.
- **Édition.** `replaceNode(expression, address, node)` (renvoie une nouvelle expression) suffira plus tard ; non spécifié maintenant.
- **Limites d'import.** 5 000 nœuds et profondeur 64 (D35), à ajuster à l'usage.
