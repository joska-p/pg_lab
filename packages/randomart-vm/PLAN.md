# RandomArt VM — Multi-Session Plan

> Keep focus across sessions. Update this file as you progress. Do not implement everything at once.

## Session 0: Setup (this session)

- [x] Understand randomart core thoroughly
- [x] Create package `randomart-vm`
- [x] Write `SPEC.md`
- [ ] Scaffold directories and base files
- [ ] Write this plan
- [ ] Commit checkpoint

## Session 1: Foundation

Goal: pure utilities, RNG, errors, shared types.

Files:

- `src/spec/errors.ts`
- `src/spec/constants.ts`
- `src/shared/types.ts` (Brand)
- `src/shared/guards.ts` (isRecord)
- `src/shared/asserts.ts`
- `src/rng/types.ts`
- `src/rng/seed.ts`
- `src/rng/rng.ts`

Tests:

- `test/rng.test.ts` (determinism, split if any)

Exit criteria:

- [ ] RNG matches randomart behavior
- [ ] Seed creation/validation matches
- [ ] Basic asserts match

## Session 2: ISA

Goal: operator/catalog mirror or reuse.

Options:

1. Re-export from `@repo/randomart/src/core/catalog/*` (fastest parity)
2. Copy minimal subset

Recommend: start with re-exports/wrappers that enforce VM types, can copy later.

Files:

- `src/isa/types.ts`
- `src/isa/catalog.ts` (wrapper)
- `src/isa/index.ts`

Tests:

- `test/isa.test.ts`

Exit criteria:

- [ ] Can access operators, multiplicities, deps
- [ ] Arity/params correct

## Session 3: Grammar

Goal: exact parity with grammar/quantized/sample.

Files:

- `src/grammar/types.ts`
- `src/grammar/constants.ts`
- `src/grammar/grammar.ts`
- `src/grammar/quantized.ts`
- `src/grammar/sample.ts`

Tests:

- Mirror `core/grammar/grammar.test.ts`, `quantized.test.ts`, `sample.test.ts` (subset)

Exit criteria:

- [ ] `createGrammar` validation identical
- [ ] `drawGrammar` deterministic
- [ ] `sampleGrammars` matches

## Session 4: IR

Goal: Node/Expression, serialize/deserialize

Files:

- `src/ir/types.ts`
- `src/ir/ir.ts`
- `src/ir/serialize.ts`
- `src/ir/index.ts`

Tests:

- Mirror `core/expression/expression.test.ts`, `serialize.test.ts`

Exit criteria:

- [ ] Canonical serialization
- [ ] Import limits enforced
- [ ] Round-trip stable

## Session 5: Generation

Goal: port generator exactly (order critical)

Files:

- `src/gen/generator.ts`
- `src/gen/constants.ts` (`GENERATOR_VERSION`)

Tests:

- Mirror key generator cases + parity with randomart

Exit criteria:

- [ ] Deterministic for seeds
- [ ] Trunk/shareDepth correct
- [ ] Budget allocation correct
- [ ] Parity: same expr for test vectors

## Session 6: Lowering

Goal: DAG lowering

Files:

- `src/lower/types.ts`
- `src/lower/lower.ts`
- `src/lower/constants.ts`

Tests:

- Part of compiler parity

Exit criteria:

- [ ] Vertex/context creation matches
- [ ] Usages/multiplicities correct
- [ ] Sharing keys correct

## Session 7: Codegen

Goal: GLSL emission

Files:

- `src/codegen/types.ts`
- `src/codegen/constants.ts`
- `src/codegen/format.ts`
- `src/codegen/preamble.ts`
- `src/codegen/emit.ts`
- `src/codegen/compile.ts`
- `src/codegen/contract.ts`

Tests:

- Mirror `core/compiler/compiler.test.ts` heavily

Exit criteria:

- [ ] GLSL contract passes
- [ ] Policies work
- [ ] Warp/contexts correct
- [ ] Source matches where possible

## Session 8: VM + Parity

Goal: orchestration and verification

Files:

- `src/vm/vm.ts`
- `src/index.ts` (public API)

Tests:

- `test/parity.test.ts` comparing VM vs randomart
- Generate 50 random (grammar,seed) pairs, compare serialized expressions
- Compile and compare source

Exit criteria:

- [ ] Parity on sampled cases
- [ ] Clean public API
- [ ] No DOM deps
- [ ] `vp check` passes in package

## Guidelines

- **Preserve order**: RNG draw order is sacred. Copy logic linearly.
- **Test first**: port test cases before implementing when possible.
- **Reuse**: import from randomart for ISA/color/config initially to avoid drift.
- **Pure only**: enforce in lint if needed.
- **Small steps**: one phase per session minimum, don't jump ahead.
- **Document quirks**: add comments explaining non-obvious parts.
- **Checkpoint**: update PLAN.md after each session.
