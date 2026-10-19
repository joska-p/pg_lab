# Session prompt — finish the test repairs + remove the static/animated notion

> Context: a previous session replaced the motion system with time carried by
> the `x`/`y` terminals (commit `ec5194d`), and started repairing the test
> suite but ran out of context mid-way. This session finishes that work and
> cleanly removes the outdated "static vs animated" concept.
> Working language: French for discussion, English for code/docs.

Read first: `codex/notes/randomart-time-in-xy.md` (how the pipeline and the
time terminals work) and `codex/docs/conventions/README.md`.

## Concept to settle: there is no "static vs animated" any more

The user's words: _"il n'y a plus qu'un seul type de shader. plus de notion
static vs animated. static est juste animated en pause."_

- `x`/`y` declare `requires: ['u_phase']` **statically** (per operator, not
  per node). So any expression containing an `x` or `y` reads `u_phase`.
- A "still" image is just a shader whose `u_phase` is frozen (paused play).
- Consequence: the `animated: boolean` flag on `CompiledShader` (and the whole
  render-gate logic keyed on it) is now largely meaningless. Decide how far to
  remove it: options are (a) keep it as "does this shader read u_phase" (a
  factual dep-closure property, useful for the render gate to skip phase
  updates only for const-only shaders), or (b) drop it entirely and always
  feed `u_phase`. **Ask the user which** before ripping it out; the render
  gate (`src/renderer/renderGate.ts`, `contract.ts`) is the only real
  consumer.

## Already done (do NOT redo)

- Source changes are committed in `ec5194d`: time in x/y, motion module
  deleted, motion axis removed from grammar/compiler/recipe/UI.
- `src/core/compiler/compiler.test.ts`: rewritten (passes, 34/34). Motion
  tests replaced by time-terminal tests (oscillator GLSL, amp=0 fallback,
  cycles 1..3 mapping). Add a `xNode` helper.
- `src/core/compiler/testing.test.ts`, `fuzz.test.ts`: `{ motion: ... }`
  removed from `compile(...)`; fuzz computes `expectedAnimated` via
  `usesOperator(expression[channel], new Set(['x','y']))`.
- Bulk `sed` replaced every `createNode(catalog, 'x'|'y')` **in test files**
  with `createNode(catalog, 'x'|'y', [], [0, 0, 0])` (amp=0 = plain
  coordinate). Verify no production code was touched by this sed.

## Remaining work

1. **`src/core/grammar/quantized.test.ts`** — still has `motion` refs:
    - "carries the motion axis into the grammar" test (lines ~98-108): delete
      it (the axis no longer exists).
    - `recipeToGrammar` calls still pass `motion: 'off'` / `'swing'` — remove
      the property.
2. **`src/core/grammar/sample.test.ts`** (~line 23-26) — "draws the
   still-image default (motion off)": drop the `grammar.motion` assertion,
   keep the `grammar.channels` one. Rename the test.
3. **`src/core/grammar/randomGrammar.test.ts`** (~line 38-41) — "draws the
   still-image default (motion off)": delete the whole test (no motion axis).
4. **`src/core/grammar/describe.test.ts`** — the animated test was already
   removed; confirm it still makes sense (GrammarSummary no longer has
   `animated`).
5. **`src/core/grammar/grammar.test.ts`** — the `g.motion` assertion was
   removed; confirm nothing else references motion. (There was also a stale
   `SampleRecipesOptions` type error referenced at line ~248 — check.)
6. **Snapshots**: `src/core/generator/__snapshots__/generator.test.ts.snap`
   is stale (predates the new x/y draws, GENERATOR_VERSION 4). Regenerate:
   `vp test src/core/generator -u` (or the vite-plus equivalent). Review the
   diff is sane, not blindly accept.
7. **`animated` concept**: per the decision above, either keep `animated` as
   a factual "reads u_phase" flag or remove it. If kept, make sure
   `compile()` derives it purely from the dep closure (it already does via
   `buildPreamble`) and that renderGate tests still pass.
8. Run `vp check` (must be clean on source AND tests) and `vp test` (full
   suite green). Fix any fallout from the sed (e.g. tests that asserted
   `createNode` param-count errors, inspect/serialize/artwork tests).

## Constraints

- No back-compat needed (no old artworks exist); do not add param defaults
  to `createNode` — keep it strict (exact param count).
- `x`/`y` params order is `[amp, phase, cycles]`; amp=0 emits the plain
  `${p}.x`/`${p}.y`.
- Commit when green, updating `codex/notes/randomart-time-in-xy.md`
  ("Known-broken state" section) to reflect the fixed tests.
