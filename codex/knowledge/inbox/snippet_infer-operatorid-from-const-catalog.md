
---
## title: 'Inférer OperatorId depuis un catalogue d\'opérateurs `as const satisfies`'

date: 2026-11-03
type: snippet
tags: [typescript, randomart-vm, isa, typage-infere]

**Contexte :** Pour éviter de maintenir une liste manuelle des noms d'opérateurs, il faut dériver le type `OperatorId` directement de la déclaration du catalogue.

**Corps :**

```ts
const defs = [
    { name: 'x', label: 'x', group: 'terminal', ... },
    { name: 'y', label: 'y', group: 'terminal', ... },
    // ...
] as const satisfies OperatorDef[];

export type OperatorId = (typeof defs)[number]['name'];
```

Résultat : `OperatorId` est l'union littérale `'x' | 'y' | 'const' | 'add' | ...`. Toute modification du catalogue (`defs`) met à jour automatiquement `OperatorId` et donc les types des poids de grammaire (`GrammarWeights = Readonly<Partial<Record<OperatorId, number>>>`).

## **Lien codebase :** `packages/randomart-vm/src/isa/default.ts`, `packages/randomart-vm/src/grammar/types.ts`
