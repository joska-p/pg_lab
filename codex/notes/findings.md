# Findings (inbox)

Things noticed while working on the config/SSOT pass (2026-10-19). Not addressed unless
stated; each item names the file so a future session can pick it up. Generated during the
`tuning.ts` → `config.ts` rename (see `codex/notes/randomart-config-knobs.md`).

## Type placement (observed, not fixed)

1. **`GrammarData` ownership.** Declared in `packages/randomart/src/core/artwork/serialize.ts`
   but consumed by `core/notebook/types.ts`: the notebook depends on the artwork's
   serialization type. Pick an owner (a versioned-format module? the notebook?) instead of
   leaving the cross-dependency.
2. **`LotView` layer inversion.** Declared in `components/bench/lot.ts`, imported by
   `stores/benchStore.ts` — a store depending on a component module. The type (or the store
   contract) should move to a store/app-level file.
3. **`renderer/contract.ts` is a grab-bag.** It mixes the GLSL contract snippets, `Phase` +
   `createPhase`, `DEFAULT_LOOP_DURATION`, `DEFAULT_CONTEXT_OPTIONS` and
   `HANDWRITTEN_TEST_SHADER`. Worse, `core/compiler/compiler.test.ts` and `fuzz.test.ts`
   import `renderer/contract.ts` (core tests reaching into the renderer layer). Candidate:
   extract the shader contract (`GLSL_*`, `validateShaderContract`) into core.
4. **Runtime values in `types.ts` files** (tolerated by the agreed rule, listed for the
   record): `catalog/operators/types.ts` exports the `defineOperator` factory;
   `notebook/types.ts` exports `NOTEBOOK_FILE_FORMAT`/`_VERSION`, `MAX_NOTEBOOK_FILE_LENGTH`
   and the `isNotebookRating` validator. Validators/factories are code, not types.
5. **`grammar/types.ts` ↔ `grammar/quantized.ts` type-only cycle.** `FamilyId`/`ShareChoice`
   are derived from the value lists (`FAMILY_IDS`, `SHARE_CHOICES`) that live in
   `quantized.ts`, while `quantized.ts` imports `Recipe`/`FamilyId`/`ShareChoice` back from
   `types.ts`. It is type-only (erased at runtime, TS handles it), but a
   `grammar/vocabulary.ts` holding the lists + their id types would remove the tangle.
6. **`Seed`/`Phase` brands** stay colocated with their factories (`random/seed.ts`,
   `renderer/contract.ts`) — deliberate exception, kept.

## Config-adjacent smells

1. **`CONFIG.color.oklabChroma` becomes GLSL text** at module init in `core/color/index.ts`
   (interpolated in the OKLCH/OKLab templates). It is the only place where the config turns
   into shader source. Question: is chroma an app taste value (config) or a parameter of the
   colour space (it belongs next to `COLOR_SPACES`)?
2. **`MIN/MAX_LOOP_MS`** (`core/artwork/types.ts`) are a UI slider range and a file-validation
   bound, not a safety guard (already a TODO in the coherence plan).
3. **`DEFAULT_KEEP = ['x', 'y']`** (`core/grammar/randomize.ts`) duplicates
   `FAMILY_OPERATORS.anchors`/`ANCHOR_LEVELS` at a lower layer (existing finding).
4. **`STRUCTURE_RECIPE` mixes sources**: `share`/`space` from `CONFIG.channels`, `size`/`levels`
   as literals. Documented as intentional (the preset's own definition); worth a second look
   if `medium` becomes configurable.
5. **`defaultGrammar`** is a calibration fixture, not the app default (existing TODO).
6. **`core/grammar/grammar.ts:1`** imports `'../catalog'` without the `.ts` extension, unlike
   every other import in the package.
7. **`DEFAULT_LOOP_DURATION` vs `CONFIG.artwork.loopMs / 1000`**: the division was duplicated
   in `appStore.parseDurationInput`; now it reads `DEFAULT_LOOP_DURATION`. Watch for the
   conversion reappearing.

## Docs

- Dated session notes (`codex/notes/randomart-time-in-xy.md`,
  `randomart-colour-pipeline.md`) still say `TUNING`/`config/tuning.ts`; left untouched on
  purpose (they record the state at their date). Only the living docs were updated
  (`randomart-config-knobs.md`, `randomart-coherence-plan.md`,
  `docs/conventions/02-typescript.md`).

## Verified during this pass

- All `CONFIG` values are byte-identical; `config.test.ts` pins them; no `GENERATOR_VERSION`
  bump. `vp check --fix` clean, `vp test` 328 passed / 10 skipped.
