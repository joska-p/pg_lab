# Randomart — Audit registry (first quantified pass)

Produced by step 1 of `_TMP/Audit de coherence de randomart.md`: the mechanical rules are now
tooled, and this file is their first output. No line under `src/` was changed.

Scope: `packages/randomart`. Baseline: `vp check` and `vp test` green (328 passed / 10 skipped for
randomart; 481 passed / 10 skipped repo-wide — this is the "328 vs 478" discrepancy in the report:
two scopes, not two counts), `GENERATOR_VERSION` unchanged.

## How to run

```bash
vp run audit                      # from the repository root; exits 1 when a gate fails
```

Each check also runs on its own (see the table below). The task lives in the root
`vite.config.ts`, so it is only visible from the root.

Per-tool commands:

| Check                      | Command                                                                   |
| -------------------------- | ------------------------------------------------------------------------- |
| Layers, purity, extensions | `vp lint -c tools/audit/oxlint.audit.jsonc packages/randomart`            |
| Vocabulary and patterns    | `node tools/audit/banned-words.mjs packages/randomart`                    |
| Dead code                  | `knip -W packages/randomart`                                              |
| Duplication                | `jscpd packages/randomart --ignore "**/*.test.ts" --threshold 1`          |
| Cycles (informational)     | `madge --circular --extensions ts,tsx packages/randomart/src .../scripts` |

## Summary

| Check                                    | Tool              | Result                    | Gate |
| ---------------------------------------- | ----------------- | ------------------------- | ---- |
| Import extensions                        | oxlint            | **35** sites / 19 files   | FAIL |
| Dependency direction (§2.4)              | oxlint            | **2** sites               | FAIL |
| Core purity (§1.2)                       | oxlint            | 0 (2 allow-listed files)  | pass |
| Vocabulary / patterns                    | banned-words      | **54** sites              | FAIL |
| Dead files                               | knip              | **1**                     | FAIL |
| Dead / redundant exports                 | knip              | **111** symbols           | FAIL |
| Duplication (production)                 | jscpd             | **6** clones, 0.64% lines | pass |
| Duplication (including tests)            | jscpd             | 26 clones, 1.84% lines    | —    |
| Runtime cycles                           | `import/no-cycle` | 0                         | pass |
| Cycles (all edges)                       | madge             | 19 — all type-only        | warn |
| `noUnusedLocals` / `noUnusedParameters`  | tsc               | already enabled           | pass |
| `useMemo` / `useCallback` / `React.memo` | banned-words      | 0                         | pass |

The registry lists `id | file | rule | type | action | cost`. Types: **A** mechanical, **B**
decision, **C** refactor, **D** docs.

## A — Mechanical (rename / delete, no behaviour change)

### A-01 — Import extensions (35 sites, 19 files) · §2.1.9 · A

`core/`, `stores/` and `scripts/` write the `.ts` extension; `components/`, `renderer/` and
`main.tsx`/`App.tsx` do not. `scripts/dataset/cli.ts` is run directly by Node, which forces `.ts`
in the core, so the convention becomes **explicit `.ts`/`.tsx` everywhere**.

Files (sites): `components/lab/LabPanel.tsx` (4), `components/Controls.tsx` (4),
`components/bench/BenchStage.tsx` (4), `renderer/index.ts` (3), `components/Scene.tsx` (3),
`renderer/renderGate.test.ts` (2), `renderer/RandomArtCanvas.tsx` (2), `App.tsx` (2),
`renderer/renderer.test.ts`, `main.tsx`, `lab/SessionSection.tsx`, `lab/GrammarSection.tsx`,
`lab/ArtworkSection.tsx`, `history/HistoryPanel.tsx`, `bench/Planche.tsx`, `bench/planche.test.ts`,
`bench/lot.ts`, `bench/lot.test.ts`, `bench/BenchPanel.tsx` (1 each).

Cost: low, purely textual. No PRNG impact.

### A-02 — `colour` → `color` (37 sites, 19 files) · §2.1.1 · A

One concept, one word: the code says `color` (`core/color/`, `ColorSpaceId`), while comments and
two error messages say `colour`.

Watch the two **visible** messages pinned by tests: `grammar.ts` (`unknown colour space`) and
`artwork/serialize.ts` (`unknown colour space`), plus `color.test.ts` which asserts
`/unknown colour space/`. Rename message and assertion together.

### A-03 — Acronym `CUSTOM_ID` → `CUSTOM_PRESET` (3 sites) · §2.1.7 · A

`components/lab/GrammarSection.tsx`: `CUSTOM_ID`. The only offending identifier in scope (the
`datasetApi` of `src/dataset/page.ts` is correct: `Api`, not `API`).

### A-04 — French words (8 sites) · AGENTS.md · A

- `generator.ts`: variable `libre` (3 sites × 2 branches = 6 lines); `budget - …` suggests an
  English name (`remaining`, `slack`).
- `appStore.ts:277`: comment `"Nouvelle seed"`.
- `budget.measure.test.ts:10`: same word in a comment.

### A-05 — `new` prefix (4 exports) · §2.1.4 · A

`appStore.ts` (`newSeed`, `newGrammar`, `newImage`), `benchStore.ts` (`newBenchBatch`). `new` is
not in the verb table; these are store actions (`resetSeed`, `drawGrammar`, …).

### A-06 — `failure` and `Mode` · §2.1.4 / §2.1.9 · A

- `benchStore.ts:208`: `function failure(...)` is not verb-first.
- `appStore.ts:81`: `export type Mode` → `AppMode` (the bare word is too vague).

### A-07 — Verified dead code (3 symbols) · knip · A

No reference outside the definition (production **and** tests):

- `cacheVignette` — `storage/notebookDb.ts:93`
- `selectRow` — `stores/benchStore.ts:165`
- `useGrammarSummary` — `stores/appStore.ts:192`

### A-08 — Dead file · knip · A

`src/core/index.ts` — barrel with no consumer (already flagged by the audit), absent from the rest
of `core`.

## B — Decisions to make

### B-01 — `core/` imports `renderer/` (2 sites) · §2.4 · B

`core/compiler/compiler.test.ts:3` and `core/compiler/fuzz.test.ts:3` import
`../../renderer/contract.ts` (`validateShaderContract`). The GLSL contract lives on the renderer
side, and the compiler tests depend on it. Two options: extract the contract into `core/`, or accept
the test-only exception. This is structural: it moves the `GLSL_*` snippets from the renderer to the
core.

### B-02 — Over-exporting barrels (87 + 15 symbols) · knip · B

Out of 111 flagged symbols:

- **87** are alive but their barrel re-export has no consumer through that barrel (e.g.
  `renderer/index.ts` re-exports all of `contract.ts`, which only the core tests import directly);
- **15** are referenced by _nothing but_ barrels: `ARTWORK_FILE_VERSION`, `BatchRequest`,
  `DEFAULT_BATCH_SIZE`, `DEFAULT_KEEP`, `GRAMMAR_FILE_FORMAT`, `GRAMMAR_FILE_VERSION`,
  `RenderedCell`, `SIZE_PROFILES`, `STRUCTURE_RECIPE`, `WeightLevelKnobs`, `generateNotebookId`,
  `grammarSignature`, `serializeBatch`, `serializeCandidate`, `serializeRecipe`;
- **6** are used only inside their own module (`CompiledShaderStats`, `CompiledShaderUniform`,
  `FLAT_SHARE_THRESHOLD`, `PcaComponent`, `ProgramItem`, `publishArtwork`).

Decision: barrel policy ("every `index.ts` re-exports the public API" **or** "export only what is
consumed"). Until it is settled, these 108 sites are not dead code.

### B-03 — Dataset/bench crosstalk (already open) · B

`sampleGrammars` / `randomGrammar` / `randomizeWeights` / `drawSpread` only serve the dataset and
the tests (question D in `randomize.ts` / the plan). The dashboard sees them alive; the decision
"migrate the dataset to `sampleRecipes` or accept the dual distribution" is still pending
(`randomart-coherence-plan.md`, session D).

### B-04 — Cycles: madge 19, oxlint 0 · B

Verified: `import/no-cycle` (type-aware) does detect a **value** cycle (temporary files) and ignores
`import type` edges. The 19 madge cycles therefore run through re-exports and type-only edges
(`config/index → config.ts → color/index → config/index`, where `config.ts → color` is
`import type`; the `grammar/types.ts ↔ quantized.ts` pair). No runtime cycle.

Decision: keep madge informational (as here), configure it to ignore type-only edges, or move to
`dependency-cruiser`.

### B-05 — Duplication (6 production clones, 0.64% lines) · C

| Clone                                                           | Lines |
| --------------------------------------------------------------- | ----- |
| `core/analysis/descriptors.ts` ↔ `core/analysis/pca.ts`         | 9     |
| `core/artwork/serialize.ts` ↔ `core/notebook/serialize.ts`      | 18    |
| `core/generator/generator.ts` (two sibling branches)            | 9     |
| `stores/benchStore.ts` (3 pairs, same error/`setState` pattern) | 7-11  |

The remaining 20 clones are test fixtures. Gate threshold: `--threshold 1` (current production
budget is 0.64%).

### B-06 — Core purity: allow-list · §1.2 · A/B

The rule forbids `Math.random` / `Date.now` / `performance.now` / `document` / `window` in `core/`,
with two accepted exceptions: `core/random/seed.ts` (documented non-deterministic source) and
`core/notebook/notebook.ts` (timestamp ids). Core tests are excluded (timing probes). 0 violations
today. If an exception should go away, this is where it shows.

## D — Documentation

Not quantified in this pass (outside the mechanical scope). The source text
(`_TMP/Audit de coherence de randomart.md`, §2 "Commentaires et docs obsolètes") remains the
reference list: `Controls` "two faces", `LabPanel`, `benchStore`/`Planche` `row` vs
`'sheet'|'focus'`, `appStore.commit`, `dataset/page.ts` "generate.mjs", `emit.test`, "8000 ms"
titles, `index.html` `<title>randomart-next</title>`, hard-coded `/tmp/opencode/field`.

## Already covered by existing tooling

- `noUnusedLocals` / `noUnusedParameters`: enabled in `tsconfig.app.json` and `tsconfig.node.json`.
- `import/no-cycle`: enabled in `tools/lint/base.ts`.
- `useMemo` / `useCallback` / `React.memo`: 0 occurrences.

## Proposed next steps

1. Work through the A batch (A-01 → A-08): one commit per item, generator snapshots unchanged.
2. Decide B-01, B-03, B-04, then B-02 (barrel policy).
3. Once A is green, promote the audit rules to `error` in `tools/lint/` (not only
   `tools/audit/`) and wire `vp run audit` into CI (`.github/workflows/deploy.yml` currently only
   runs `vp check --fix` and the build).
