# Handoff: Reorganize Type & Interface Declarations

**Date:** 2026-10-22  
**Context:** After config centralization pass — codebase clean, tests pass (286/1 skipped), `vp check --fix` clean. Branch: `main` at `586221b` (after catalog reorganization commit).

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
- ✅ `vp test` all 286 tests pass
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
- ✅ `vp test` all 286 tests pass
- ✅ No types exported from implementation files (only `types.ts` and registry files)
- ✅ No constants in `types.ts`
- ✅ No import cycles introduced
- ✅ Registries use `camelCase` (`operatorRegistry`, `dependencies`), constants use `SCREAMING_SNAKE_CASE`
- ✅ `OperatorId` / `DependencyId` are precise union types (`'x' | 'y' | 'add' | ...`)

---

## Observed Issues (Remaining)

### 1. `core/color/types.ts` — Already has `ChannelModel` but...

...`MIN_SHARE_DEPTH` and `RAW_CHANNELS` are in `color.ts` (implementation). Should they be in `types.ts` or `constants.ts`?

### 2. `core/color/color.ts` — Exports many constants + `ColorSpace` interface

`COLOR_SPACES`, `COLOR_SPACE_IDS`, `MIN_SHARE_DEPTH`, `RAW_CHANNELS`, `ColorSpace` interface.

### 3. `core/grammar/types.ts` — Has `Grammar`, `GrammarPins`, `GrammarData` (added), `GrammarPreset`...

...`GrammarPreset` is in `presets.ts`. Should be in `types.ts`.

### 4. `core/grammar/presets.ts` — Exports `GRAMMAR_PRESETS` (constant) + `GrammarPreset` (type)

Type → `types.ts`, constant → `constants.ts`.

### 5. `core/expression/types.ts` — Exports `Expression`, `Node`, `NodeData`, `Channel`

...but `NodeData` is serialization shape. Convention: `*Data` DTOs belong in domain's `types.ts` (already done for `GrammarData`).

### 6. `core/expression/serialize.ts` — Exports `NodeData`, `ExpressionData`, constants

Types → `expression/types.ts` (already there), constants → `expression/constants.ts`.

### 7. `core/random/seed.ts` — Exports `Seed` brand + `createSeed`, `randomSeed`

`Seed` type is domain; functions are implementation. Already mostly clean. `MAX_SEED` constant → `random/constants.ts`.

### 8. `core/random/rng.ts` — Exports `Rng` interface

Type → `random/types.ts` (create if needed).

### 9. `core/renderer/*` — Multiple type exports from implementation files

- `contract/contract.ts`: `Phase` (brand)
- `batch/batch.ts`: `RenderedBatch`, `BatchRenderer`
- `renderGate/renderGate.ts`: `RenderKey`
- `types.ts` exists but may not have all types

### 10. `core/compiler/*` — Types in implementation files

- `emit.ts`: `EmitResult`
- `lower.ts`: `Vertex`, `ContextDef`, `LowerResult`
- `preamble.ts`: `PreambleResult`
- `types.ts` exists — consolidate there
- Constants: `MAX_SOURCE_LENGTH` in `types.ts` → `constants.ts`, GLSL constants in `contract.ts` → `constants.ts`

### 11. `stores/lab/historyStore.ts` — Exports `HistoryEntry` type

Used in `labStore.ts`. **Should live in `stores/lab/types.ts`** (new file) or `labStore.ts` if single-consumer.

### 12. `stores/lab/modeStore.ts` — Exports `AppMode` type

Used in `Controls.tsx`, `Scene.tsx`. Single-consumer? Keep in `modeStore.ts` or move to `stores/lab/types.ts`.

### 13. `stores/bench/benchSettingsStore.ts` — Exports `CellSize`, `BenchView`, `BenchSettings` + constants

Types → `stores/bench/types.ts`, constants → `stores/bench/constants.ts`.

### 14. `bench/lot/planche.ts` — Exports `PlancheCell`, `PlancheRow`, `Planche`, `PlancheOptions`, `PLANCHE_DIM_FACTOR`

### 15. `bench/lot/lot.ts` — Exports `LotView`

### 16. `bench/notebook/notebook.ts` — Exports `CandidateInput`, `BatchInput`, `NotebookInput`

### 17. `components/*` — Some type exports (`PlancheProps`, `AppMode` re-export)

---

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
- **Registry key types (`OperatorId`, `DependencyId`, etc.) exported from the file defining the registry** — allows `keyof typeof registry` without cycles

---

## Next Recommended Domain: `color`

**Why:**

- Clear ownership: `ColorSpace` interface in `color.ts`, `COLOR_SPACES`/`COLOR_SPACE_IDS` constants
- Used by `artwork`, `compiler`, `generator`, `renderer` — centralizing helps consumers
- `color.ts` already mixes types + constants + implementation

**Files to touch:**

- `core/color/types.ts` (update) ← `ColorSpace`, `ChannelModel`, `ColorSpaceId` (move from `color.ts`)
- `core/color/constants.ts` (create) ← `COLOR_SPACES`, `COLOR_SPACE_IDS`, `MIN_SHARE_DEPTH`, `RAW_CHANNELS`
- `core/color/color.ts` — remove type/constant exports, keep only implementation functions
- Update consumers: `artwork/types.ts`, `artwork/serialize.ts`, `compiler/preamble.ts`, `generator/generator.ts`, `renderer/batch/batch.ts`, `grammar/grammar.ts`, tests

---

## Acceptance Criteria (Overall)

- [x] `artwork` domain complete
- [x] `catalog` domain complete
- [ ] `color` domain
- [ ] `grammar` domain
- [ ] `expression` domain
- [ ] `random` domain
- [ ] `renderer` domain
- [ ] `compiler` domain
- [ ] `stores/lab` domain
- [ ] `stores/bench` domain
- [ ] `bench/lot` domain
- [ ] `bench/notebook` domain
- [ ] `vp check --fix` clean
- [ ] `vp test` all pass
- [ ] No types exported from implementation files (only `types.ts` + registry files)
- [ ] No constants exported from `types.ts` (only `constants.ts` + registry files for `*Id` types)
- [ ] No import cycles introduced
- [ ] Consistent naming: camelCase for registry/objects, SCREAMING_SNAKE for true constants
- [ ] Documentation updated in `codex/docs/conventions/typescript.md`

---

## Tips for Next Agent

- Start with `rg -n "export (type|interface|const) [A-Z]" packages/randomart/src --type ts` to find all exports
- The `bench/notebook/constants.ts` pattern is the model to follow
- Don't over-abstract: if a type is truly only used in one file, keep it local
- Watch for import cycles when centralizing — may need barrel files
- The `config/` module is already clean (types.ts + config.ts + derived.ts) — use as reference
- **New:** `artwork` domain is the reference for the pattern (types.ts + constants.ts + implementation files)
- **New:** `GrammarData` lives in `grammar/types.ts` (owner of `Grammar`) — follow this for other `*Data` DTOs
- **New:** `catalog` domain shows registry key type pattern — `OperatorId`/`DependencyId` exported from registry/constants file with `keyof typeof registry`

---

## Current State Reference

- **Config pattern:** `config/types.ts` (types) + `config/config.ts` (values) + `config/derived.ts` (computed)
- **Notebook pattern:** `notebook/types.ts` (types) + `notebook/constants.ts` (values) + re-export from types
- **Artwork pattern (DONE):** `artwork/types.ts` + `artwork/constants.ts` + implementation files
- **Catalog pattern (DONE):** `catalog/types.ts` + `catalog/constants.ts` + `operators/registry.ts` (exports registry + `OperatorId`/`OperatorRegistry`) + implementation files
- **Branch:** `main` at `586221b`
- **Run:** `vp -C packages/randomart check --fix && vp -C packages/randomart test` before starting
