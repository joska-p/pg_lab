# randomart-vm : `any` au cœur du codegen + code mort `operatorName`

**Contexte :** Revue qualité du module `codegen` — le module central du pipeline opère sur des types fantômes et contient une logique dupliquée divergente.

**Corps :**
- `lowerNode(node: any, …)` (`codegen/compile.ts:79`), `(ch: any)` :84,112, `isTerminal(op: any)` (`grammar/grammar.ts:134,138`), `zipRecord(values: readonly any[])` (`isa/catalog.ts:6`), `(seed as any).brand` (`gen/generator.ts:51`) — alors que les types `Node`/`OperatorId`/`Seed` existent.
- Logique `isAtom` dupliquée avec **regex divergentes** : `codegen/format.ts:3-24` vs inline `compile.ts:183-186` = deux sources de vérité sur ce qu'est un atome.
- Code mort : `(node as any).operatorName ?? node.op` (`ir/formula.ts:10,24`) — `operatorName` n'est posé nulle part dans tout le repo, l'expression vaut toujours `node.op`.
- Bonus : `rng.int()` retourne silencieusement 0 si `max<=0` (`rng/rng.ts:35-38`) ; `Vm.catalog` public et mutable (`vm/vm.ts:14`).

**Lien codebase :** `packages/randomart-vm/src/codegen/compile.ts:79,84,112,183-186`, `src/codegen/format.ts:3-24`, `src/grammar/grammar.ts:134,138`, `src/ir/formula.ts:10,24`, `src/rng/rng.ts:35-38`.

### Action Issue GitHub

```bash
gh issue create --title "randomart-vm: any types in codegen + dead operatorName property + duplicated isAtom" --body "Revue randomart-vm. (1) lowerNode(node: any) compile.ts:79, isTerminal(op: any) grammar.ts:134 — real types (Node, OperatorId, Seed) exist. (2) isAtom logic duplicated with diverging regexes: codegen/format.ts:3-24 vs compile.ts:183-186. (3) (node as any).operatorName ?? node.op in ir/formula.ts:10,24 — operatorName is never set anywhere, always undefined. Also rng.int() silently returns 0 when max<=0 (rng.ts:35-38)."

```

---
