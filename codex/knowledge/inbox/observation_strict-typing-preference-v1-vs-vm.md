
# Préférence pour le typage strict de randomart-v1

## **Corps :** L'utilisateur a exprimé une préférence claire pour le typage resserré de `randomart-v1` (ex: `setGrammarWeight(name: OperatorId, ...)`, `setGrammarSize(size: SizeProfileId)`) par rapport à la permissivité de `randomart-vm` / `randomart-ui` (ex: `name: string`). Lorsqu'il reprend des éléments de v1 dans vm/ui, il veut que les noms d'opérateur et les profils de taille soient typés en union de littéraux, pas en `string` libre.

## Exemple session : Lors du resserrement de `GrammarWeights` et de `setGrammarWeight`, l'utilisateur a demandé que `OperatorId` soit déclaré et exporté depuis le même fichier que le catalogue (`isa/default.ts`), puis a modifié lui-même le catalogue en `as const satisfies OperatorDef[]` pour permettre l'inférence littérale.
