# Handoff: Reorganize Type & Interface Declarations

**Date:** 2026-10-22  
**Context:** After config centralization pass — codebase clean, tests pass (286/1 skipped), `vp check --fix` clean. Branch: `main` at `2fd6aef` (after color reorganization commit).

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
- ✅ `vp test` all 286 tests pass
- ✅ No types exported from implementation files
- ✅ No constants in `types.ts`
- ✅ No import cycles introduced
- ✅ Registry uses camelCase (`colorSpaceRegistry`), constants use SCREAMING_SNAKE_CASE
- ✅ `ColorSpaceId` is precise union type (`'srgb' | 'oklch' | 'oklab' | 'hsl'`)

---

## ⚠️ NEXT: `grammar` Domain — **Types Are a Mess Here**

**This is the next target and it needs serious cleanup.**

### Current State (as of `2fd6aef`):

`core/grammar/types.ts` currently has **overlapping/duplicate definitions** that only became visible after the methodical cleanup of `color`:

| Type | Location | Issue |
|------|----------|-------|
| `Grammar` | `types.ts` | Brand type — OK |
| `GrammarPins` | `types.ts` | OK — input shape for `drawGrammar` |
| `GrammarPreset` | `types.ts` | **Also exported from `presets.ts`** — duplicate! |
| `GrammarData` | `types.ts` | OK — serialization DTO |
| `ChannelModel` | `types.ts` | Just moved here from `color` — OK |
| `SampleOptions` | `types.ts` | Extends `GrammarPins` — OK |

### Specific Problems to Fix:

1. **`GrammarPreset` duplicated** — defined in `types.ts` AND exported from `presets.ts`. The type belongs in `types.ts`; the constant `GRAMMAR_PRESETS` belongs in `constants.ts` (new) or stays in `presets.ts` but re-exports the type from `types.ts`.

2. **`presets.ts` exports both type + constant** — violates separation. Type → `types.ts`, constant → `constants.ts` (create).

3. **`grammar.ts` exports `channelModelOf` which returns `ChannelModel`** — this is fine, but `ChannelModel` now lives in `grammar/types.ts` so no cross-domain import needed.

4. **Need to check if `GrammarPins` / `SampleOptions` are truly domain types or just internal** — if only used in `grammar/` + `quantized.ts`, keep in `types.ts`.

### Files to Touch:

- `core/grammar/types.ts` — deduplicate, ensure only domain types
- `core/grammar/constants.ts` — **create** (add `GRAMMAR_PRESETS` here, keep `MIN_SHARE_DEPTH`, `RAW_CHANNELS`)
- `core/grammar/presets.ts` — remove `GrammarPreset` type export, import from `./types`; export only `GRAMMAR_PRESETS` constant (or move constant to `constants.ts`)
- `core/grammar/grammar.ts` — update imports
- `core/grammar/quantized.ts` — update imports
- `core/grammar/sample.ts` — check imports
- Consumers: `stores/lab/labStore.ts`, `components/lab/GrammarSection.tsx`, `components/lab/Inspector.tsx`, `bench/notebook/notebook.ts`, test files

---

## Observed Issues (Remaining — After Grammar)

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
- **Registry key types (`OperatorId`, `DependencyId`, `ColorSpaceId`, etc.) exported from the file defining the registry** — allows `keyof typeof registry` without cycles

---

## Acceptance Criteria (Overall)

- [x] `artwork` domain complete
- [x] `catalog` domain complete
- [x] `color` domain complete
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

## Tips for Next Agent (Grammar Domain)

- **Start here:** `rg -n "export (type|interface|const) [A-Z]" packages/randomart/src/core/grammar --type ts` to find all exports in grammar
- **The duplicate `GrammarPreset` is the smoking gun** — it's in both `types.ts` and `presets.ts`
- **Create `grammar/constants.ts`** for `GRAMMAR_PRESETS` (and keep `MIN_SHARE_DEPTH`, `RAW_CHANNELS`)
- **`GrammarPreset` type → `types.ts`**, constant → `constants.ts`
- **Follow the pattern:** `artwork` (types + constants + impl), `catalog` (types + constants + registry + impl), `color` (types + registry + impl, no constants)
- **Watch for:** `SampleOptions` extends `GrammarPins` — both are domain types, keep in `types.ts`
- **Config pattern:** `config/types.ts` + `config/config.ts` + `config/derived.ts`
- **Notebook pattern:** `notebook/types.ts` + `notebook/constants.ts` + re-export from types
- **Artwork pattern (DONE):** `artwork/types.ts` + `artwork/constants.ts` + implementation files
- **Catalog pattern (DONE):** `catalog/types.ts` + `catalog/constants.ts` + `operators/registry.ts` + implementation files
- **Color pattern (DONE):** `color/types.ts` + `color/registry.ts` + `color/color.ts` (functions only)
- **Branch:** `main` at `2fd6aef`
- **Run:** `vp -C packages/randomart check --fix && vp -C packages/randomart test` before starting

---

## Current State Reference

- **Config pattern:** `config/types.ts` (types) + `config/config.ts` (values) + `config/derived.ts` (computed)
- **Notebook pattern:** `notebook/types.ts` (types) + `notebook/constants.ts` (values) + re-export from types
- **Artwork pattern (DONE):** `artwork/types.ts` + `artwork/constants.ts` + implementation files
- **Catalog pattern (DONE):** `catalog/types.ts` + `catalog/constants.ts` + `operators/registry.ts` (exports registry + `OperatorId`/`OperatorRegistry`) + implementation files
- **Color pattern (DONE):** `color/types.ts` + `color/registry.ts` + `color/color.ts` (functions only)
- **Branch:** `main` at `2fd6aef`
- **Run:** `vp -C packages/randomart check --fix && vp -C packages/randomart test` before starting