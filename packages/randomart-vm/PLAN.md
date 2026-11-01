# RandomArt VM — Multi-Session Plan

> Keep focus across sessions. Update this file as you progress. Do not implement everything at once.

## Session 0: Setup

- [x] Understand randomart core thoroughly
- [x] Create package `randomart-vm`
- [x] Write `SPEC.md`
- [x] Scaffold directories and base files
- [x] Write initial plan

## Session 1: Foundation

Goal: pure utilities, RNG, errors, shared types.

Files:

- `src/spec/errors.ts`
- `src/spec/constants.ts`
- `src/shared/brand.ts`
- `src/shared/guards.ts`
- `src/shared/asserts.ts`
- `src/rng/types.ts`
- `src/rng/seed.ts`
- `src/rng/rng.ts`

Exit criteria:

- [x] RNG matches randomart behavior
- [x] Seed creation/validation matches
- [x] Basic asserts match

## Session 2: ISA

Goal: operator/catalog mirror or reuse.

Files:

- `src/isa/types.ts`
- `src/isa/catalog.ts`
- `src/isa/default.ts`
- `src/isa/index.ts`

Exit criteria:

- [x] Can access operators, multiplicities, deps
- [x] Arity/params correct

## Session 3: Grammar

Goal: exact parity with grammar/quantized/sample.

Files:

- `src/grammar/types.ts`
- `src/grammar/constants.ts`
- `src/grammar/grammar.ts`
- `src/grammar/index.ts`

Exit criteria:

- [x] `createGrammar` validation implemented
- [x] Vocabulary validation (terminals and non-terminals)
- [x] Share depth and size constraints clamping

## Session 4: IR

Goal: Node/Expression, serialize/deserialize

Files:

- `src/ir/types.ts`
- `src/ir/ir.ts`
- `src/ir/serialize.ts`
- `src/ir/index.ts`

Exit criteria:

- [x] Canonical serialization
- [x] Import limits enforced
- [x] Round-trip stable

## Session 5: Generation

Goal: port generator exactly (order critical)

Files:

- `src/gen/generator.ts`
- `src/gen/constants.ts` (`GENERATOR_VERSION`)
- `src/gen/index.ts`

Exit criteria:

- [x] Deterministic for seeds
- [x] Trunk/shareDepth implemented
- [x] Budget allocation logic

## Session 6: Lowering

Goal: DAG lowering (vertex/context/usages)

Status:

- [x] Lowering integrated directly in `src/codegen/compile.ts` (vertex deduplication, usage counting)

## Session 7: Codegen

Goal: GLSL emission

Files:

- `src/codegen/types.ts`
- `src/codegen/format.ts`
- `src/codegen/compile.ts`
- `src/codegen/index.ts`

Exit criteria:

- [x] GLSL emission adhering to contract (`vUv`, `v_p`, `o_color`, `u_phase`)
- [x] Inlining vs variable sharing based on usage count
- [x] Source length verification

## Session 8: VM Orchestration

Goal: orchestration and verification

Files:

- `src/vm/vm.ts`
- `src/index.ts` (public API)
- `test/basic.test.ts`

Exit criteria:

- [x] High-level `Vm` class and singleton `vm`
- [x] End-to-end `createGrammar -> generate -> compile -> render`
- [x] Basic tests passing with `vp test`
- [x] Pure package without DOM dependencies

## Session 9: Color Spaces, Presets & Inspection

Goal: Bring color space conversion, grammar presets, and expression formatting to the VM.

Files:

- `src/color/types.ts`, `src/color/color.ts`, `src/color/registry.ts`, `src/color/index.ts`
- `src/grammar/registry.ts` (grammar presets and `presetOf`)
- `src/grammar/quantized.ts` (`drawGrammar`, `grammarKey`, `SIZE_PROFILE_IDS`)
- `src/grammar/grammar.ts` (added `isLastTerminal`, `isLastNonTerminal`)
- `src/ir/formula.ts` (`formatFormula`, `formatNodeLabel`)
- `src/codegen/compile.ts` (color space preamble and execution, context and dependency emission)

Exit criteria:

- [x] Color spaces (sRGB, OKLCH, OKLab, HSL) registered and emitted in GLSL
- [x] Presets accessible in VM
- [x] `formatFormula` available for inspector
- [x] `vp check` passes
- [x] Tests passing in `test/basic.test.ts`

## Session 10: Parity & Hardening

Goal: Parity test suite against `@repo/randomart` and property tests.

Files:

- `test/parity.test.ts`
