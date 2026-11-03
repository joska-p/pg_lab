
---
## title: 'Typer les poids de grammaire par OperatorId, pas par index signature libre'

date: 2026-11-03
type: rule
tags: [typescript, randomart-vm, grammar, typage]

**Contexte :** `GrammarWeights` dans `randomart-vm` utilisait une index signature libre `{ [op: string]: number | undefined }`. Une faute de frappe dans un nom d'opérateur (ex: `'sinus'` au lieu de `'sin'`) passait inaperçue à la compilation, contrairement à `randomart-v1` qui utilise `Partial<Record<OperatorId, number>>`.

**Corps :** La règle est de typer les poids de grammaire par un `OperatorId` inféré du catalogue concret, jamais par une index signature `string` libre. Cela transforme les erreurs de runtime (opérateur inconnu, poids ignoré silencieusement) en erreurs de compilation.

Piège à éviter : ne pas mélanger `Record<string, number>` et `Record<OperatorId, number>` aux frontières (générateur, compilateur, quantized, store UI) sans cast explicite `as OperatorId`, sinon TypeScript remonte des erreurs d'indexation partout où `op.name` est typé `string` par `Catalog.operators()`.

## **Lien codebase :** `packages/randomart-vm/src/grammar/types.ts`, `packages/randomart-vm/src/isa/default.ts`, `packages/randomart-ui/src/stores/vmStore.ts`
