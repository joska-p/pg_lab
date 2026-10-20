# Randomart — Audit follow-up (after the gate repairs)

Source: `_TMP/verif.md` (external review of the first audit pass). Step 1 (repair the coherence
gates) landed in two commits, then the repaired gates were re-run to see what they flag.

## Step 1 — gates repaired (done)

| Commit    | Change                                                                                                                         |
| --------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `d209e9c` | banned-words: scan `src/dataset`/`scripts/dataset`, check file names, flag directory imports                                   |
| `d209e9c` | randomart lint: layer rules for renderer/storage/stores, core purity extended (`Date`, `crypto`, timers, `fetch`, `navigator`) |
| `d209e9c` | knip `--production` (reported, not gating), jscpd threshold `0`                                                                |
| `207eaf6` | randomart fixes the repaired gates flagged, plus the Space-key rating bug (`Number(' ') === 0`)                                |

## Step 2 — re-run of the repaired gates

- **banned vocabulary**: 5 findings, all fixed (see below).
- **duplication (jscpd, threshold 0)**: pass, 0 clones.
- **knip (`--production`)**: 56 unused exports, 2 unused files, 9 unused types — triaged below.
- **cycles (madge)**: 19, all type-only / barrel edges (the real gate, `import/no-cycle`, passes).
- **banned-words rule change**: the `french` and `french-accent` rules are **removed**. Tracking
  French words in code by regex is a losing game (the word list never covers the language, and an
  accent is not inherently a violation); the convention stays in AGENTS.md, the lint does not police
  it. `colour`/`catalogue`/`TUNING` keep their rules: those are one-concept-one-word renames, not
  language policing.

## Step 3 — triage of `knip --production` (targeted cleanup, decided)

Policy (validated): **delete what is genuinely dead, prune the barrels that re-export live symbols,
but keep the tested `core/` API and mark it `ignore` in `knip.json`.** Deleting tested pure
functions (`isLastTerminal`, `createRecipe`, `defaultGrammar`, …) trades real behavioural coverage
for a shorter symbol list — not worth it while they document the core contracts.

Deleted (dead in production **and** not part of the kept API):

- `src/core/compiler/testing.ts` and `scripts/dataset/testing.ts` (+ their `testing.test.ts`), test
  helpers that no longer serve a live test path;
- `getCachedVignette` + `CachedVignette` (`storage/notebookDb.ts`): the vignette store has no writer
  since `cacheVignette` was dropped (A-07);
- `assertStrictlyPositive` (`core/shared/index.ts`): no production reader;
- `serializeGrammarFile` / `parseGrammarFile` (`core/artwork/serialize.ts`) with `GRAMMAR_FILE_FORMAT`,
  `GRAMMAR_FILE_VERSION`, `MAX_GRAMMAR_FILE_LENGTH` and their tests: the grammar _file_ format was
  superseded by the artwork bundle.

Pruned barrels (live symbols, no consumer through that barrel): `core/catalog`, `core/expression`,
`core/grammar`, `core/random`.

Kept and `ignore`d in `knip.json` (tested core API, no production caller yet):
`isLastTerminal`, `createRecipe`, `addRecipeToNotebook`, `defaultGrammar`, `validateShaderContract`,
`depth`, plus the module-internal exports that knip flags in duplicate with their definition.

`knip` 6.42 has no per-symbol ignore, only per-file `ignore`. The list is therefore the exact files
that carry the kept API — no glob, no wildcard: `src/core/compiler/contract.ts`,
`src/core/compiler/index.ts`, `src/core/expression/index.ts`, `src/core/expression/traverse.ts`,
`src/core/expression/types.ts`, `src/core/grammar/grammar.ts`, `src/core/grammar/index.ts`,
`src/core/notebook/notebook.ts`. `ignoreExportsUsedInFile` covers the rest (a symbol used inside its
own module is not dead).

Result: `vp check` green, `vp test` green (303 passed / 3 skipped), `knip --production` silent,
`vp run audit` green except the informational cycles warning.

## Step 4 — Lot A restant (done)

- naming: `randomRecipe` → `drawRecipe`, `randomGrammar` → `drawGrammar` (both consume the PRNG, the
  file names keep `randomGrammar.ts`); `BenchView = 'sheet'` → `'planche'` (the in-app grid is the
  planche, `sheet` is the dataset's contact sheet); the `shareDepth` slider relabelled `share` (it
  edits the recipe choice, not the resolved trunk depth); `serializeArtwork`/`parseArtwork` →
  `serializeArtworkFile`/`parseArtworkFile` (they handle text, the four-name convention in
  §2.1.4); `LotView` numeric fields to `*Count` (`columnCount`, `grammarCount`, `cellCount`,
  `failedCount`, `flatCount`).
- the `fieldRender.measure.test.ts` probe evaluates `x`/`y` with their oscillator params
  (`amp`/`phase`/`cycles`) instead of the removed `tsin`/`tcos`.
- the dead `grammarSummary` store field dropped (`describeGrammar` keeps its test).
- stale comments: already gone in `a342694` (`8 seconds` → 60 s, `HistoryEntry.recipe`), nothing left
  to fix here.

## Step 5 — remaining items

- **Single state document**: done. `codex/notes/randomart-state.md` is the one entry point (goal,
  state, T1–T5, the C batch, open decisions and frictions). `PLAN.md`, `randomart-coherence-plan.md`
  and `randomart-audit-handoff.md` are now one-line pointers to it; `findings.md`,
  `randomart-config-knobs.md` and the dated session notes stay as referenced detail; the registry
  keeps the per-commit audit history.
- **C batch** (still open, tracked in `randomart-state.md` §Next): `appStore` SSOT (grammar/recipe/
  HistoryEntry.grammar stored while the grammar should be derived), the `commit`/`publishArtwork`/
  `restoreImportedEntry` repeated block, `downloadBlob` duplicated with two behaviours,
  `resolveActiveBatch`/`useBenchActiveBatch`/`removeActiveBatch` variants, and the error/async/
  lifecycle list (`createSeed(Number(value))` throws in a handler, unbounded `setBenchCount`/
  `setBenchSeeds`, `await file.text()` outside the `try`, `void saveNotebookToDb`, `openDatabase`
  never closed, `initBenchNotebook` may overwrite a newer batch, `setCanvas`/`setClockStore` never
  reset on unmount).
