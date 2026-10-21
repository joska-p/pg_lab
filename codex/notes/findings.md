# Findings (inbox)

Things noticed while working on the config/SSOT pass (2026-10-19). Not addressed unless
stated; each item names the file so a future session can pick it up. Generated during the
`tuning.ts` → `config.ts` rename (see `codex/notes/randomart-config-knobs.md`).

## Where to start next

The randomart split (core / lab / bench / dataset) is done and verified. What is left, by
value:

1. **Test the Lab and the app shell.** `@repo/randomart-lab` and `@repo/randomart` have no test
   script and no test file. The Lab owns the WebGL lifecycle and the history coalescing; the
   shell owns the mode switch. Start with the pure parts (history coalescing, mode store), then
   the canvas. Add a `test` script to both packages once there is something to run.
2. **Decide the fate of the dataset pipeline.** `pca.json` and `features.json` are written but
   read by no UI, and the pipeline needs a Chromium, so the CI never runs it. Either wire a smoke
   test or state that it is a local tool only.
3. **The open items below**, smallest first: `HANDWRITTEN_TEST_SHADER` in production code, the
   `renderer/contract/contract.ts` grab-bag, the `core/grammar/grammar.ts` import extension, the
   `MIN/MAX_LOOP_MS` ownership question, the `CONFIG.color.oklabChroma` placement.

## Type placement (observed, not fixed)

1. ~~**`GrammarData` ownership.** Declared in `packages/randomart/src/core/artwork/serialize.ts`
   but consumed by `core/notebook/types.ts`: the notebook depends on the artwork's
   serialization type. Pick an owner (a versioned-format module? the notebook?) instead of
   leaving the cross-dependency.~~ Resolved 2026-10-21: the notebook moved to
   `packages/randomart-bench/src/notebook`; it now depends on core, and core no longer depends
   on the notebook.
2. ~~**`LotView` layer inversion.** Declared in `components/bench/lot.ts`, imported by
   `stores/benchStore.ts` — a store depending on a component module. The type (or the store
   contract) should move to a store/app-level file.~~ Resolved 2026-10-21: the lot shape and the
   planche geometry moved to `packages/randomart-bench/src/lot/`; `src/ui/` now holds React
   components only, and the store depends on `../lot/lot`, never on the UI folder.
3. **`renderer/contract/contract.ts` is still a grab-bag.** The GLSL contract it used to hold is
   gone (it lives in `compiler/contract.ts` now, and no core test reaches into the renderer
   layer). What remains: `Phase` + `createPhase`, `DEFAULT_LOOP_DURATION`,
   `DEFAULT_CONTEXT_OPTIONS` and `HANDWRITTEN_TEST_SHADER`. The last one is a test fixture
   living in production code — it belongs in the test file that uses it.
4. **Runtime values in `types.ts` files** (tolerated by the agreed rule, listed for the
   record): `catalog/operators/types.ts` exports the `defineOperator` factory;
   `randomart-bench/src/notebook/types.ts` exports `NOTEBOOK_FILE_FORMAT`/`_VERSION`,
   `MAX_NOTEBOOK_FILE_LENGTH` and the `isNotebookRating` validator. Validators/factories are
   code, not types. `renderer/types.ts` used to be a third case: it now holds the `RgbImage` type
   only, the flatness check moved to `renderer/flatness.ts`.
5. ~~**`grammar/types.ts` ↔ `grammar/quantized.ts` type-only cycle.**~~ Resolved 2026-10-20:
   families and share choices are gone, and `quantized.ts` only imports `types.ts`; no cycle.
6. **`Seed`/`Phase` brands** stay colocated with their factories (`random/seed.ts`,
   `renderer/contract/contract.ts`) — deliberate exception, kept.

## Core and shell boundary

Decided 2026-10-21, after the split into core / lab / bench / dataset.

1. **`@repo/randomart-core` keeps the renderer.** The renderer is not extracted into its own
   package: its consumers are the Bench and the dataset, both inside randomart, and a
   one-file package would buy ceremony, not a boundary (§1.5). The trigger to revisit is a
   consumer **outside** randomart, not a second one — the second already exists.
2. **One DOM boundary, named.** `renderer/batch/batch.ts` is the only module of the package that
   reaches for the DOM; everything else is pure TypeScript. The lint config enforces it:
   `no-restricted-globals` bans the browser globals in `packages/randomart-core/src/**` except
   `renderer/batch/**`. The README states the seam in the same words, so the two cannot drift.
3. **The subpath split (`/domain` vs `/renderer`) was rejected.** The `renderer/` directory is
   already the separation, and renaming every import site would move 150 lines of diff for a
   purely cosmetic gain (§13 rule 10). If the domain ever needs a DOM-free build (a node tool
   that only wants `grammar → expression → GLSL`), extract the package then.
4. **Still open:** `renderer/contract/contract.ts` keeps `HANDWRITTEN_TEST_SHADER`, a test
   fixture in production code.

## Config-adjacent smells

1. **`CONFIG.color.oklabChroma` becomes GLSL text** at module init in `core/color/index.ts`
   (interpolated in the OKLCH/OKLab templates). It is the only place where the config turns
   into shader source. Question: is chroma an app taste value (config) or a parameter of the
   colour space (it belongs next to `COLOR_SPACES`)?
2. **`MIN/MAX_LOOP_MS`** (`core/artwork/types.ts`) are a UI slider range and a file-validation
   bound, not a safety guard (already a TODO in the coherence plan).
3. ~~**`DEFAULT_KEEP = ['x', 'y']`** duplicates the anchor list.~~ Resolved 2026-10-20:
   `randomize.ts`, the anchor lists and the family vocabulary are gone.
4. ~~**`STRUCTURE_RECIPE` mixes sources.**~~ Resolved 2026-10-20: presets are named grammars;
   `structure` reads `CONFIG.channels` for `shareDepth`/`space` and its own weight literals.
5. ~~**`defaultGrammar`** is a calibration fixture, not the app default.~~ Resolved 2026-10-20:
   it is the app's initial grammar and the `structure` preset.
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
- After the split (2026-10-21): `vp check` clean, 287 passed / 1 skipped across core, bench and
  dataset. Three test files deleted by the split were restored in their new homes
  (`renderer/contract/contract.test.ts`, `renderer/renderGate/renderGate.test.ts`,
  `randomart-bench/src/storage/notebookDb.test.ts`): 14 tests.
- `@repo/randomart-lab` and `@repo/randomart` still have **no test script and no test file**.
  The Lab owns the WebGL lifecycle and the history coalescing; the app shell owns the mode
  switch. That is the biggest remaining coverage gap in randomart.
