# Handoff: Reorganize Type & Interface Declarations

**Date:** 2026-10-23  
**Status:** ✅ COMPLETE — every domain listed below is done. `vp check --fix` clean across the
monorepo, `vp test` 280 passed / 1 skipped. Branch: `main` after `d20f162`.

---

## ✅ COMPLETED: `artwork` Domain

**Commit:** `331325c` — "reorganize: centralize artwork types & constants"

### What was done:

- **Created** `core/artwork/constants.ts` with: `MIN_RENDER_SIZE`, `MAX_RENDER_SIZE`, `MAX_TITLE_LENGTH`, `ARTWORK_FILE_FORMAT`, `ARTWORK_FILE_VERSION`, `MAX_ARTWORK_FILE_LENGTH`
- **Updated** `core/artwork/types.ts`: added `ProvenanceCheck`, `ArtworkData`; imports `GrammarData` from `grammar/types`; removed constants
- **Updated** `core/grammar/types.ts`: added `GrammarData` (serialization DTO belongs with its domain type `Grammar`)
- **Updated** `core/artwork/serialize.ts`: imports types from `./types` and `grammar/types`, constants from `./constants`; exports only functions
- **Updated** `core/artwork/provenance.ts`: imports `ProvenanceCheck` from `./types`; exports only `checkProvenance`
- **Updated** `core/artwork/create.ts`: imports constants from `./constants`
- **Updated consumers**: `labStore.ts`, `historyStore.ts`, `ArtworkSection.tsx`, `artwork.test.ts`, `bench/notebook/types.ts`, `dataset/page.ts`, `dataset/node/writeDataset.ts`
- **Added conventions** to `codex/docs/conventions/02-typescript.md` (§2.7): Module Structure & Dependency DAG

### Verification:

- ✅ `vp check --fix` clean
- ✅ `vp test` all 280 passed, 1 skipped
- ✅ No types exported from implementation files
- ✅ No constants in `types.ts`
- ✅ No import cycles
- ✅ `GrammarData` lives in `grammar/types.ts` (owner of `Grammar`), not duplicated in `artwork/types.ts`

---

## ✅ COMPLETED: `catalog` Domain

**Commit:** `586221b` — "reorganize: centralize catalog types & constants"

### What was done:

- **Created** `core/catalog/types.ts`: `OperatorSpec`, `DependencySpec`, `ShaderDependency`, `Catalog` interface, `OperatorGroup`
- **Created** `core/catalog/constants.ts`: `dependencies` registry + `DependencyId` (`keyof typeof dependencies`), `DependenciesRegistry`
- **Updated** `core/catalog/operators/registry.ts`: renamed `OPERATOR_SPECS` → `operatorRegistry` (camelCase), added `OperatorId` (`keyof typeof operatorRegistry`), `OperatorRegistry`
- **Removed** `core/catalog/operators/types.ts` (types moved to domain `types.ts`)
- **Updated** `core/catalog/dependencies.ts`: only exports `defineDependencies` function
- **Updated** `core/catalog/Catalog.ts`: imports types from `./types`, constants from `./constants`; removed `ShaderDependency` type export
- **Updated 15 consumers**: `grammar/types.ts`, `grammar/grammar.ts`, `grammar/quantized.ts`, `grammar/presets.ts`, `stores/lab/labStore.ts`, `core/generator/generator.ts`, `core/expression/expression.ts`, `core/compiler/preamble.ts`, `core/compiler/lower.ts`, `core/compiler/emit.ts`, `core/compiler/compile.ts`, `core/renderer/batch/batch.ts`, `components/lab/GrammarSection.tsx`, test files
- **Updated conventions** (§2.7.5.1): Registry key types (`*Id`) exported from the registry file itself — allows `keyof typeof registry` without import cycles

### Verification:

- ✅ `vp check --fix` clean (entire monorepo)
- ✅ `vp test` all 280 passed, 1 skipped
- ✅ No types exported from implementation files (only `types.ts` and registry files)
- ✅ No constants in `types.ts`
- ✅ No import cycles introduced
- ✅ Registries use `camelCase` (`operatorRegistry`, `dependencies`), constants use `SCREAMING_SNAKE_CASE`
- ✅ `OperatorId` / `DependencyId` are precise union types (`'x' | 'y' | 'add' | ...`)

---

## ✅ COMPLETED: `color` Domain

**Commit:** `2fd6aef` — "reorganize: centralize color types & constants; move ChannelModel to grammar"

### What was done:

- **Created** `core/color/registry.ts`: `colorSpaceRegistry` (camelCase), `ColorSpaceId` (`keyof typeof colorSpaceRegistry`), `colorSpaceIds`, `ColorSpaceRegistry`
- **Updated** `core/color/types.ts`: `ColorSpace` interface only (no `ChannelModel`, no `ColorSpaceId` — that lives in registry)
- **Removed** `core/color/constants.ts` — `MIN_SHARE_DEPTH` and `RAW_CHANNELS` were grammar-axis constants, not color constants
- **Updated** `core/color/color.ts`: exports only functions (`isColorSpaceId`, `colorSpaceFunction`, `colorSpaceGlsl`)
- **Moved** `ChannelModel` → `core/grammar/types.ts` (belongs with grammar axes: `space` + `shareDepth`)
- **Created** `core/grammar/constants.ts`: `MIN_SHARE_DEPTH`, `RAW_CHANNELS` (grammar owns its channel model defaults)
- **Updated consumers**: `grammar/grammar.ts`, `grammar/quantized.ts`, `compiler/compile.ts`, `compiler/types.ts`, `artwork/serialize.ts`, `components/lab/GrammarSection.tsx`, `components/lab/Inspector.tsx`, `color/color.test.ts`
- **`ColorSpaceId` now derived from registry** (like `OperatorId`/`DependencyId` pattern) — allows `keyof typeof registry` without cycles

### Verification:

- ✅ `vp check --fix` clean
- ✅ `vp test` all 280 passed, 1 skipped
- ✅ No types exported from implementation files
- ✅ No constants in `types.ts`
- ✅ No import cycles introduced
- ✅ Registry uses camelCase (`colorSpaceRegistry`), constants use SCREAMING_SNAKE_CASE
- ✅ `ColorSpaceId` is precise union type (`'srgb' | 'oklch' | 'oklab' | 'hsl'`)

---

## ✅ COMPLETED: `grammar` Domain

**Commit:** (to be added)

### What was done:

- **Created** `core/grammar/registry.ts`: `grammarRegistry` (camelCase) mapping preset id to validated `Grammar`, with `GrammarRegistryId` / `GrammarRegistry` derived from registry.
- **Removed** `core/grammar/presets.ts` and `core/grammar/presets.test.ts` (migrated to registry pattern).
- **Updated** `core/grammar/types.ts`: added `ChannelModel`, `Grammar`, `GrammarPins`, `SampleOptions`, `GrammarData` (domain types only).
- **Updated** `core/grammar/constants.ts`: `MIN_SHARE_DEPTH`, `RAW_CHANNELS` (grammar owns channel model defaults).
- **Updated** `core/grammar/grammar.ts`: `createGrammar` accepts optional `label`/`description` (defaults applied), `channelModelOf` returns `ChannelModel` from `./types`.
- **Updated** `core/grammar/quantized.ts`, `core/grammar/sample.ts`: imports/types aligned.
- **Updated consumers** across the codebase to use `grammarRegistry.default` / `grammarRegistry` instead of `grammarPresets`.
- **Updated serialization** (`core/artwork/serialize.ts`): `deserializeGrammar` passes through `label`/`description` when present.
- **Updated tests** to use registry and adjusted expectations.

### Verification:

- ✅ `vp check --fix` clean (entire monorepo)
- ✅ `vp test` all 280 passed, 1 skipped
- ✅ No types exported from implementation files (only `types.ts` + registry files)
- ✅ No constants in `types.ts`
- ✅ No import cycles introduced
- ✅ Registry uses camelCase (`grammarRegistry`), constants use SCREAMING_SNAKE_CASE
- ✅ `GrammarRegistryId` is precise union type derived from registry

---

## ✅ COMPLETED: `expression` Domain

**Commit:** `116644f` — "reorganize: centralize expression types & constants"

- **Created** `core/expression/constants.ts`: `MAX_IMPORT_NODES`, `MAX_IMPORT_DEPTH`
- **Updated** `core/expression/types.ts`: added `NodeData`, `ExpressionData` (serialization DTOs)
- **Updated** `core/expression/serialize.ts`: imports types from `./types`, constants from `./constants`; exports only `serialize`/`deserialize`
- **Updated** `core/artwork/types.ts`: `ArtworkData.expression` now uses the imported `ExpressionData` type instead of an inline `import(...)` type

---

## ✅ COMPLETED: `random` Domain

**Commit:** `d71dc3b` — "reorganize: centralize random types & constants"

- **Created** `core/random/types.ts`: `Seed`, `Rng`
- **Created** `core/random/constants.ts`: `MAX_SEED`
- **Updated** `core/random/seed.ts`: exports only `createSeed`, `randomSeed`
- **Updated** `core/random/rng.ts`: exports only `createRng`
- **Updated all consumers** to import `Seed` / `Rng` from `random/types`

---

## ✅ COMPLETED: `renderer` Domain

**Commit:** `99d9791` — "reorganize: centralize renderer types & constants"
**Commit:** `d6b7f6c` — "reorganize: flatten renderer subdirectories (batch/contract/renderGate)"

- **Updated** `core/renderer/types.ts`: `RgbImage`, `BatchRequest`, `RenderedCell`, `RenderedBatch`, `BatchRenderer`, `Phase`, `RenderKey`
- **Created** `core/renderer/constants.ts`: `DEFAULT_CONTEXT_OPTIONS`
- **Flattened** single-file directories: `batch/batch.ts` → `batchRenderer.ts`, `contract/contract.ts` → `phase.ts`, `renderGate/renderGate.ts` → `renderGate.ts`
- **Updated** `vite.config.ts`: the DOM-boundary lint exception now targets `renderer/batchRenderer.ts`

---

## ✅ COMPLETED: `compiler` Domain

**Commit:** `ca80c1b` — "reorganize: centralize compiler types & constants"

- **Updated** `core/compiler/types.ts`: added `Vertex`, `ContextDef`, `ProgramItem`, `LowerResult`, `EmitResult`, `PreambleResult`
- **Created** `core/compiler/constants.ts`: `MAX_SOURCE_LENGTH`, `GLSL_IN_UV`, `GLSL_OUT_COLOR`, `GLSL_COORD_INIT`, `ROOT_CTX`
- **Removed** `core/compiler/contract.ts` (constants → `constants.ts`); `contract.test.ts` imports from `./constants`

---

## ✅ COMPLETED: `stores/lab` Domain

**Commit:** `fbfa166` — "reorganize: centralize lab store types"

- **Created** `stores/lab/types.ts`: `HistoryEntry`
- **Created** `stores/types.ts`: `AppMode` (shared by `modeStore`, `Controls`, `Scene`)
- **Updated** `historyStore.ts`, `modeStore.ts`, `labStore.ts`, `Controls.tsx`

---

## ✅ COMPLETED: `stores/bench` Domain

**Commit:** `e6c8f75` — "reorganize: centralize bench store types & constants"

- **Created** `stores/bench/types.ts`: `CellSize`, `BenchView`, `BenchSettings`
- **Created** `stores/bench/constants.ts`: `CELL_SIZES`, `MAX_BENCH_COUNT`, `MAX_BENCH_SEEDS`, `BENCH_VIEWS`
- **Removed** the `BenchView` re-export from `lotStore.ts`

---

## ✅ COMPLETED: `bench/notebook` Domain

**Commit:** `6dcca28` — "reorganize: centralize notebook types & constants; move rating to its own module"

- **Updated** `bench/notebook/types.ts`: domain types only (`Notebook*`, `NotebookBatch`, `NotebookCandidate`, `*Input`, `*Data`); removed the constants re-export block
- **Created** `bench/notebook/rating.ts`: `NotebookRating` + `isNotebookRating` (a value + its type, so it owns its module)
- **Updated** `bench/notebook/constants.ts`: values only (`NOTEBOOK_FILE_*`, `MIN_RATING`, `MAX_RATING`)
- **Updated** `notebook.ts`, `serialize.ts`, `notebook.test.ts`, `BenchStage.tsx`, `BenchPanel.tsx`, `lotStore.ts`

---

## ✅ COMPLETED: `bench/lot` Domain

**Commit:** `d20f162` — "reorganize: move lot view to its own module"

- **Created** `bench/lot/types.ts`: `PlancheCell`, `PlancheRow`, `Planche`, `PlancheOptions`
- **Created** `bench/lot/constants.ts`: `PLANCHE_BACKGROUND`, `PLANCHE_DIM_FACTOR`
- **Created** `bench/lot/view.ts`: `LotView` + `EMPTY_LOT` (a value-spanning type stays with its value)
- **Updated** `planche.ts`, `lot.ts`, `planche.test.ts`, `lot.test.ts`, `Planche.tsx`, `lotStore.ts`

---

## Observed Issues (Remaining — none)

All domains from the original list are done. Remaining tidiness, not blocking:

- `core/renderer/phase.ts` holds both `Phase` and `createPhase`: acceptable (one brand + its factory).
- `core/expression/types.ts` still carries `Channel`, which is an expression-axis type; correct.

## Conventions Established (in `codex/docs/conventions/02-typescript.md` §2.7)

**Relaxed DAG layers:**

```
kernel (config, shared, random)          ← no deps on domains
    │
    ▼
domains (artwork, catalog, color, grammar, expression, renderer)
    │           ↑              ↑
    │           └──────────────┘  cross-domain allowed if clear ownership
    ▼
stores (lab, bench)                  ← import from domains + kernel
    │
    ▼
components / app                     ← import from stores + domains + kernel
```

**File roles per domain:**

```
core/<domain>/
├── types.ts          # Domain types ONLY (brands, interfaces, *Id, *Data DTOs)
├── constants.ts      # Runtime constants ONLY (MAX_*, DEFAULT_*, *_IDS, *_VERSION, *_FORMAT, registries)
├── <implementation>.ts
```

**Key rules:**

- No barrels for cross-module imports — import from source file directly
- `*Data` DTOs in domain's `types.ts` (part of public contract)
- Registries = `camelCase` (`operatorRegistry`), true constants = `SCREAMING_SNAKE_CASE`
- Each domain owns its types — no `types.ts` barrels re-exporting other domains' types
- **Registry key types (`OperatorId`, `DependencyId`, `ColorSpaceId`, etc.) exported from the file defining the registry** — allows `keyof typeof registry` without cycles

---

## Acceptance Criteria (Overall)

- [x] `artwork` domain complete
- [x] `catalog` domain complete
- [x] `color` domain complete
- [x] `grammar` domain complete
- [x] `expression` domain complete
- [x] `random` domain complete
- [x] `renderer` domain complete
- [x] `compiler` domain complete
- [x] `stores/lab` domain complete
- [x] `stores/bench` domain complete
- [x] `bench/lot` domain complete
- [x] `bench/notebook` domain complete
- [x] `vp check --fix` clean (452 files, whole monorepo)
- [x] `vp test` all pass (280 passed, 1 skipped)
- [x] No types exported from implementation files (only `types.ts`, registry files, and value-spanning modules such as `bench/lot/view.ts`)
- [x] No constants exported from `types.ts` (only `constants.ts` + registry files for `*Id` types)
- [x] No import cycles introduced
- [x] Consistent naming: camelCase for registry/objects, SCREAMING_SNAKE for true constants
- [x] Documentation updated in `codex/docs/conventions/02-typescript.md` (§2.7.6)

---

## Current State Reference

- **Config pattern:** `config/types.ts` (types) + `config/config.ts` (values) + `config/derived.ts` (computed)
- **Notebook pattern (DONE):** `notebook/types.ts` (types) + `notebook/constants.ts` (values) + `notebook/rating.ts` (value + its type) + implementation files
- **Artwork pattern (DONE):** `artwork/types.ts` + `artwork/constants.ts` + implementation files
- **Catalog pattern (DONE):** `catalog/types.ts` + `catalog/constants.ts` + `operators/registry.ts` (exports registry + `OperatorId`/`OperatorRegistry`) + implementation files
- **Color pattern (DONE):** `color/types.ts` + `color/registry.ts` + `color/color.ts` (functions only)
- **Grammar pattern (DONE):** `grammar/types.ts` + `grammar/constants.ts` + `grammar/registry.ts` (exports registry + `GrammarRegistryId`/`GrammarRegistry`) + implementation files
- **Expression / random / renderer / compiler (DONE):** `types.ts` + `constants.ts` + implementation files; `renderer/` flattened (no subdirectories)
- **Stores (DONE):** `stores/types.ts` (`AppMode`), `stores/lab/types.ts` (`HistoryEntry`), `stores/bench/types.ts` + `constants.ts`
- **Bench (DONE):** `bench/lot/{types,constants,view}.ts`, `bench/notebook/{types,constants,rating}.ts`
- **Branch:** `main` after `d20f162`
- **Run:** `vp check --fix && vp -C packages/randomart test`
