# RandomArt VM — Specification

> Goal: formalize RandomArt as a VM (ISA + IR + Generator + Codegen) rather than an app.
> Start from a clean slate that preserves the exact semantics of the existing `@repo/randomart` core while making them explicit, testable, and easier to extend.
> The text DSL and UI are out of scope for the initial VM; they may be added later as frontends.

## 1) Core Philosophy

- **IR is the source of truth**: `Node`/`Expression` remain the canonical program form. Serialization/deserialization must be byte-for-byte canonically stable.
- **Determinism is non-negotiable**: `(grammar, seed) -> Expression` is pure and deterministic. Order of RNG draws must be preserved exactly as observed in `randomart` unless there is an explicit, tested reason to change it.
- **ISA is explicit**: operators form a closed instruction set with arity, params (ranges/steps), terminals/non-terminals, `requires` (deps), multiplicities, and optional coordinate transforms.
- **Separation of concerns**: generation, validation, lowering, and codegen are distinct layers. No React, DOM, Canvas, Zustand in the VM core.
- **Throw-vs-repair policy**: follow `randomart` conventions (structure/types throw; editing quantities repair where specified).
- **Versioning**: track `GENERATOR_VERSION` semantics if behavior-affecting changes occur; do not silently change outputs for same `(grammar, seed)`.

## 2) Layers

| Layer      | Path           | Responsibility                                                                                                                                                                  |
| ---------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `spec/`    | `src/spec/`    | Errors, invariants, shared constants/limits, contracts (GLSL contract).                                                                                                         |
| `isa/`     | `src/isa/`     | Catalog/Operator types and access. Reuse or mirror `randomart` ISA exactly.                                                                                                     |
| `rng/`     | `src/rng/`     | Seed, PRNG, splitting/derivation. Deterministic, pure.                                                                                                                          |
| `grammar/` | `src/grammar/` | Grammar type, constraints, vocabulary, weights validation, quantized helpers.                                                                                                   |
| `ir/`      | `src/ir/`      | `Node`, `Expression`, factories (`createNode`/`createExpression`), structural ops (`nodeCount`, `depth`), serialization (`serialize`/`deserialize`) with import limits.         |
| `gen/`     | `src/gen/`     | Program synthesis from `(grammar, seed)`. Must match `randomart/core/generator/generator.ts` behavior (trunk/shareDepth, budget allocation, param drawing, operator selection). |
| `lower/`   | `src/lower/`   | DAG lowering (vertex/context/program), usage/multiplicities, cross-channel sharing.                                                                                             |
| `codegen/` | `src/codegen/` | GLSL emission respecting contract (`vUv`, `v_p`, `o_color`, `u_phase`, color space). Preamble/deps.                                                                             |
| `vm/`      | `src/vm/`      | Orchestration helpers (`generateAndCompile`, pipeline), stats, validation.                                                                                                      |
| `artwork/` | `src/artwork/` | Minimal artwork/render/provenance types + serialization compatible with `randomart` format (optional in early phases).                                                          |
| `index.ts` | `src/index.ts` | Public API surface.                                                                                                                                                             |

## 3) ISA (Instruction Set)

Operators are defined by:

- `name`, `label`, `group` (`terminal` | `non-terminal` | `transform`),
- `inputs` (current) + `inner` (coordinates) with `coords` function when inner exist,
- `params` with `{ name, min, max, step? }`,
- `requires: string[]` (deps),
- `glsl({ p, args, params })` and optional `coords(...)`,
- multiplicities probed at construction (must use all inputs).

Constraints:

- Terminal if `arity == 0`. Non-terminal if `arity > 0`.
- At least one terminal and one non-terminal must be active in a grammar vocabulary.
- Off-grid stepped params are refused (not rounded). Ranges enforced.
- Operators may not leave inputs unused (validated).

The catalog is the single source of truth for the ISA.

## 4) Grammar & Quantized Space

- `Grammar` has `id`, `label`, `description`, `weights` (partial by operator, 0/absent = off), `size` (profile), `shareDepth` (clamped to `[0, maxDepth]` of size), `space` (color space).
- `createGrammar` validates weights/ranges, checks vocabulary has >=1 terminal and >=1 non-terminal, sorts weights deterministically, generates `id` from hash.
- `drawGrammar` samples uniformly over quantized axes (respecting pins), repairs vocabulary with `ensureUsableVocabulary`.
- `sampleGrammars` samples independent grammars (not chained) with deduplication, derives image seeds.
- Determinism: same base seed/index -> same grammar/keys/seeds.

## 5) IR (Intermediate Representation)

```ts
type Node = { operatorName: string, params: readonly number[], inputs: readonly Node[] } (branded)
type Expression = { r: Node, g: Node, b: Node } (branded)
```

- Construction via `createNode`/`createExpression` only (validation + freezing).
- `nodeCount`, `depth` pure.
- Serialization: canonical JSON form `NodeData { op, params?, in? }`, `ExpressionData { r,g,b }` with fixed key order, no empty fields.
- Deserialization: strict shape checks, unknown fields refused, import limits (`MAX_IMPORT_DEPTH`, `MAX_IMPORT_NODES`), precise error paths, round-trip stable.

## 6) Generation

Algorithm (must match `randomart/core/generator/generator.ts`):

- `generate(grammar, seed)` uses `createRng(seed)`.
- Get vocabulary via `getVocabulary(weights)`.
- `drawOperator(depth, budget)`: filter candidates by arity/minDepth/maxDepth and budget feasibility using `minSize`. Sort candidates by name for stability, then weighted draw by grammar weights.
- `drawParams`: continuous params rounded to `PARAM_DECIMALS` (scale 10^d) then clamped; stepped params drawn uniformly over grid levels. Normalize `-0` -> `0`.
- Budget allocation: `buildChildren` splits remaining budget across `k` children ensuring each gets >= `minSize(depth+1, minDepth, vocab)`, distributes remainder by floor/remaining logic.
- `generateTrunk`: if `currentDepth > shareDepth` -> three independent nodes (each gets budget). Else share operator/params at trunk; recurse into children as trunks; if all children shared and mono case applies (`shareDepth >= maxDepth` context) build single node shared across channels, else build three nodes sharing trunk structure.
- Cannot get stuck on valid grammar.
- `GENERATOR_VERSION = 4` (track changes).

## 7) Lowering & Codegen

- Lowering: build DAG of vertices/contexts, intern by key, track usages (including coords multiplicities), emit program order (contexts then vertices). `ROOT_CTX = 'v_p'`.
- Emission policies: `'none'` | `'shared'` | `'all'`. `shared` shares when `usages >= 2` and not atom.
- GLSL contract (must match): `precision highp float;`, `in vec2 vUv;`, `out vec4 o_color;`, `uniform float u_phase;` declared when used, `const float PI = 3.141592653589793;`, `vec2 v_p = vUv * 2.0 - 1.0;` in `main()`. Single color path ends with `o_color = vec4(<space>(vec3(r,g,b)), 1.0);`.
- Dependencies collected from operators/contexts. Preamble built per color space.
- `MAX_SOURCE_LENGTH` enforced. Stats: `nodes`, `vertices`, `variables`, `contexts` (>=1), `sourceLength`.

## 8) Determinism & Oracle

Tests must verify:

- `generate(grammar, seed) == generate(grammar, seed)`
- `serialize(deserialize(x)) == serialize(x)` canonically
- `compile(catalog, expr).source` deterministic
- Pipeline `generate -> serialize -> deserialize -> compile` stable
- Cross-channel sharing behavior matches
- Warp/context sharing matches
- Import limits enforced with precise paths

Oracle: existing `randomart` tests in `packages/randomart/src/core/**/*.test.ts` (especially grammar/generator/expression/compiler/artwork). Port or mirror key cases.

## 9) Implementation Plan (multi-session safe)

### Phase 0: Scaffold & Spec (done conceptually)

- [x] Create package
- [ ] Write `SPEC.md` (this file)
- [ ] Create directory structure
- [ ] Add minimal `package.json`, `tsconfig.json`, `index.ts`

### Phase 1: Foundation (pure utils)

- [ ] `spec/errors.ts`, `spec/constants.ts`, `spec/invariants.ts`
- [ ] `shared/` equivalents (brands, type guards, asserts) matching `randomart` behavior
- [ ] `rng/` (seed, rng) — exact semantics
- [ ] Tests: basic determinism

### Phase 2: ISA

- [ ] `isa/types.ts`, `isa/Operator.ts`, `isa/Catalog.ts` or import strategy
- [ ] Decide: re-export from `randomart` or copy minimal ISA. Prefer re-export first to guarantee parity, then can diverge.
- [ ] Tests: catalog invariants

### Phase 3: Grammar

- [ ] `grammar/types.ts`, `grammar/grammar.ts`, `grammar/quantized.ts`, `grammar/constants.ts`
- [ ] Mirror `createGrammar`, `drawGrammar`, `sampleGrammars` exactly
- [ ] Tests against `randomart` grammar tests

### Phase 4: IR

- [ ] `ir/types.ts`, `ir/ir.ts`, `ir/serialize.ts`
- [ ] `createNode/createExpression`, `nodeCount/depth`, canonical serialize/deserialize with limits
- [ ] Tests: round-trip, limits, errors

### Phase 5: Generation

- [ ] `gen/generator.ts` — port algorithm exactly (order sensitive)
- [ ] Track `GENERATOR_VERSION`
- [ ] Tests: determinism, trunk/shareDepth cases, budget/feasibility

### Phase 6: Lowering + Codegen

- [ ] `lower/lower.ts`, `codegen/emit.ts`, `codegen/compile.ts`, `codegen/preamble.ts`, `codegen/format.ts`, `codegen/contract.ts`
- [ ] GLSL contract validation
- [ ] Tests: mirror compiler tests (sharing, contexts/warp, policies)

### Phase 7: VM Orchestration & Parity

- [ ] `vm/vm.ts` high-level API
- [ ] Parity tests: generate with VM vs randomart on fixed seeds/grammars, compare serialized expressions; compile and compare source where possible
- [ ] Artwork serialization compatibility (if needed)

### Phase 8: Hardening

- [ ] Property tests, edge cases
- [ ] Docs, examples

## 10) Notes on Reuse vs Copy

- **Reuse first**: import types/utils from `@repo/randomart/src/core/...` where safe (pure). This guarantees parity during migration.
- **Copy only if needed**: if circular deps or to enforce "no DOM" strictly. Better to have VM depend on randomart core initially? Or vice versa? Keep VM independent: VM can import pure core modules from randomart as reference/oracle, but randomart must not depend on VM.
- **Tests as oracle**: run VM tests against behaviors extracted from randomart tests.

## 11) Success Criteria

- VM can generate identical expressions to randomart for same `(grammar, seed)` across suite of cases.
- VM can compile to identical GLSL source (or semantically equivalent) for those expressions.
- All invariants from SPEC hold with tests.
- No UI/DOM deps. Pure, tree-shakeable.
- Clear boundaries, easy to add alternative backends later.
