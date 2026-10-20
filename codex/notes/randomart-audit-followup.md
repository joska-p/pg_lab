# Randomart — Audit follow-up (after the gate repairs)

Source: `_TMP/verif.md` (external review of the first audit pass). Step 1 (repair the coherence
gates) landed in two commits, then the repaired gates were re-run to see what they flag.

## Step 1 — gates repaired (done)

| Commit    | Change                                                                                            |
| --------- | ------------------------------------------------------------------------------------------------- |
| `d209e9c` | banned-words: scan `src/dataset`/`scripts/dataset`, check file names, flag directory imports      |
| `d209e9c` | randomart lint: layer rules for renderer/storage/stores, core purity extended (`Date`, `crypto`, timers, `fetch`, `navigator`) |
| `d209e9c` | knip `--production` (reported, not gating), jscpd threshold `0`                                    |
| `207eaf6` | randomart fixes the repaired gates flagged, plus the Space-key rating bug (`Number(' ') === 0`)    |

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
  `GRAMMAR_FILE_VERSION`, `MAX_GRAMMAR_FILE_LENGTH` and their tests: the grammar *file* format was
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

## Step 4 — remaining items (not yet done)

- **A restant**: stale comments (`RandomArtCanvas` "Default to 8 seconds" → 60 s, the coherence-plan
  and config-knobs "8 000 ms", `MIN_ACTIVE_WEIGHT` "The UI also uses it", `HistoryEntry.recipe`
  "Present when…" while the field is required), naming (`randomRecipe`/`randomGrammar` consume the
  PRNG so `draw*`; `LotView` counters not `*Count`; `BenchView = 'sheet'` mixes planche/sheet;
  the `shareDepth` slider edits `share`; `serializeArtwork` returns text while `serializeGrammar`
  returns data), the `*.measure.test.ts` probes (still evaluate `tsin`/`tcos` and ignore the x/y
  oscillation parameters; `fieldDist` strong and structured candidates are identical), and the dead
  `grammarSummary` store field (recomputed on every commit for nothing).
- **Single state document**: `PLAN.md`, `randomart-coherence-plan`, `findings`,
  `randomart-config-knobs`, `randomart-audit-handoff` and this registry coexist; the handoff says
  "Nothing open" while the plan lists sessions A–E and `PLAN.md` lists T1–T5. Collapse into one.
- **C batch**: `appStore` SSOT (grammar/recipe/HistoryEntry.grammar stored while the grammar should
  be derived), the `commit`/`publishArtwork`/`restoreImportedEntry` repeated block, `downloadBlob`
  duplicated with two behaviours, `resolveActiveBatch`/`useBenchActiveBatch`/`removeActiveBatch`
  variants, and the error/async/lifecycle list (`createSeed(Number(value))` throws in a handler,
  unbounded `setBenchCount`/`setBenchSeeds`, `await file.text()` outside the `try`,
  `void saveNotebookToDb`, `openDatabase` never closed, `initBenchNotebook` may overwrite a newer
  batch, `setCanvas`/`setClockStore` never reset on unmount).
