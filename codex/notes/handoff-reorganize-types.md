# Handoff: Reorganize Type & Interface Declarations

**Date:** 2026-10-22  
**Context:** After config centralization pass — codebase clean, tests pass (286/1 skipped), `vp check --fix` clean. Branch: `main` at `331325c` (after artwork reorganization commit).

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

## Observed Issues (Remaining)

### 1. `core/catalog/operators/registry.ts` — Naming weirdness

```ts
export const OPERATOR_SPECS: ReadonlyArray<OperatorSpec> = [...];
// Also exports: operator(name), operators(), operatorNames
```

- `OPERATOR_SPECS` in SCREAMING_SNAKE_CASE but it's not a constant — it's a registry array
- Name suggests "specs" but it's the registry itself
- **Better:** `operatorRegistry` or `catalogOperators`, camelCase

### 2. `core/catalog/Catalog.ts` — Exports `ShaderDependency` type

```ts
export type ShaderDependency = { ... };
```

Used in `compiler/preamble.ts`, `compiler/emit.ts`. **Should live in `catalog/types.ts`** (or `operators/types.ts` if operator-specific).

### 3. `core/catalog/dependencies.ts` — Exports types + constants

```ts
export type DependencySpec<Id extends string = string> = ...
export type DependencyId = keyof typeof DEPENDENCIES;
export const DEPENDENCIES = defineDependencies({...});
```

Types → `catalog/types.ts`, constants → `catalog/constants.ts`.

### 4. `core/color/types.ts` — Already has `ChannelModel` but...

...`MIN_SHARE_DEPTH` and `RAW_CHANNELS` are in `color.ts` (implementation). Should they be in `types.ts` or `constants.ts`?

### 5. `core/color/color.ts` — Exports many constants + `ColorSpace` interface

`COLOR_SPACES`, `COLOR_SPACE_IDS`, `MIN_SHARE_DEPTH`, `RAW_CHANNELS`, `ColorSpace` interface.

### 6. `core/grammar/types.ts` — Has `Grammar`, `GrammarPins`, `GrammarData` (added), `GrammarPreset`...

...`GrammarPreset` is in `presets.ts`. Should be in `types.ts`.

### 7. `core/grammar/presets.ts` — Exports `GRAMMAR_PRESETS` (constant) + `GrammarPreset` (type)

Type → `types.ts`, constant → `constants.ts`.

### 8. `core/expression/types.ts` — Exports `Expression`, `Node`, `NodeData`, `Channel`

...but `NodeData` is serialization shape. Convention: `*Data` DTOs belong in domain's `types.ts` (already done for `GrammarData`).

### 9. `core/expression/serialize.ts` — Exports `NodeData`, `ExpressionData`, constants

Types → `expression/types.ts` (already there), constants → `expression/constants.ts`.

### 10. `core/random/seed.ts` — Exports `Seed` brand + `createSeed`, `randomSeed`

`Seed` type is domain; functions are implementation. Already mostly clean. `MAX_SEED` constant → `random/constants.ts`.

### 11. `core/random/rng.ts` — Exports `Rng` interface

Type → `random/types.ts` (create if needed).

### 12. `core/renderer/*` — Multiple type exports from implementation files

- `contract/contract.ts`: `Phase` (brand)
- `batch/batch.ts`: `RenderedBatch`, `BatchRenderer`
- `renderGate/renderGate.ts`: `RenderKey`
- `types.ts` exists but may not have all types

### 13. `core/compiler/*` — Types in implementation files

- `emit.ts`: `EmitResult`
- `lower.ts`: `Vertex`, `ContextDef`, `LowerResult`
- `preamble.ts`: `PreambleResult`
- `types.ts` exists — consolidate there
- Constants: `MAX_SOURCE_LENGTH` in `types.ts` → `constants.ts`, GLSL constants in `contract.ts` → `constants.ts`

### 14. `stores/lab/historyStore.ts` — Exports `HistoryEntry` type

Used in `labStore.ts`. **Should live in `stores/lab/types.ts`** (new file) or `labStore.ts` if single-consumer.

### 15. `stores/lab/modeStore.ts` — Exports `AppMode` type

Used in `Controls.tsx`, `Scene.tsx`. Single-consumer? Keep in `modeStore.ts` or move to `stores/lab/types.ts`.

### 16. `stores/bench/benchSettingsStore.ts` — Exports `CellSize`, `BenchView`, `BenchSettings` + constants

Types → `stores/bench/types.ts`, constants → `stores/bench/constants.ts`.

### 17. `bench/lot/planche.ts` — Exports `PlancheCell`, `PlancheRow`, `Planche`, `PlancheOptions`, `PLANCHE_DIM_FACTOR`

### 18. `bench/lot/lot.ts` — Exports `LotView`

### 19. `bench/notebook/notebook.ts` — Exports `CandidateInput`, `BatchInput`, `NotebookInput`

### 20. `components/*` — Some type exports (`PlancheProps`, `AppMode` re-export)

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

---

## Next Recommended Domain: `catalog`

**Why:**

- Clear ownership: `ShaderDependency` in `Catalog.ts`, `OPERATOR_SPECS` rename
- Used by `compiler`, `generator`, `grammar` — centralizing helps consumers
- `dependencies.ts` already has types + constants mixed

**Files to touch:**

- `core/catalog/types.ts` (create) ← `ShaderDependency`, `DependencySpec`, `DependencyId`, `OperatorSpec`, `OperatorId`
- `core/catalog/constants.ts` (create) ← `operatorRegistry`, `dependencies`, `DEPENDENCIES`
- `core/catalog/Catalog.ts` — remove type exports
- `core/catalog/operators/registry.ts` — rename `OPERATOR_SPECS` → `operatorRegistry`, remove type exports
- `core/catalog/dependencies.ts` — remove type/constant exports
- Update consumers: `compiler/preamble.ts`, `compiler/emit.ts`, `grammar/types.ts`, `grammar/quantized.ts`, `grammar/presets.ts`, `generator/generator.ts`, tests

---

## Acceptance Criteria (Overall)

- [x] `artwork` domain complete
- [ ] `catalog` domain
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
- [ ] No types exported from implementation files (only `types.ts`)
- [ ] No constants exported from `types.ts` (only `constants.ts`)
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

---

## Current State Reference

- **Config pattern:** `config/types.ts` (types) + `config/config.ts` (values) + `config/derived.ts` (computed)
- **Notebook pattern:** `notebook/types.ts` (types) + `notebook/constants.ts` (values) + re-export from types
- **Artwork pattern (DONE):** `artwork/types.ts` + `artwork/constants.ts` + implementation files
- **Branch:** `main` at `331325c`
- **Run:** `vp -C packages/randomart check --fix && vp -C packages/randomart test` before starting
