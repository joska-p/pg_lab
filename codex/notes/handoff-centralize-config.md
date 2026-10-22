# Handoff: Centralize Hardcoded Values & Untangle Import/Re-export Juggling

**Date:** 2026-10-22  
**Context:** After comment cleanup pass — codebase is clean, tests pass (439/1 skipped), `vp check --fix` clean.

---

## The Problem

`packages/randomart/src/core/config/config.ts` was created as the **single source of truth** for curated values (the "quantized axes"). But over time, a mess of imports/re-exports/derivations has grown around it. The next agent needs to:

1. **Audit** every hardcoded value in the codebase
2. **Decide** what belongs in `CONFIG` vs. what are guards/constants vs. what are derived models
3. **Centralize** with a clear strategy — no more juggling

---

## Current State (What I Observed)

### `config.ts` — The Intended SSOT

```ts
// packages/randomart/src/core/config/config.ts
export const CONFIG = {
    terminals: { amp, phase, cycles, cycleCounts }, // draw-affecting
    generator: { paramDecimals }, // draw-affecting
    grammar: { maxWeight, sizeProfiles }, // sampler-affecting
    sampling: { baseSeed, changeRate, benchSeedsPerGrammar, datasetSeedsPerGrammar },
    artwork: { width, height, loopMs }, // shell defaults
    color: { oklabChroma }, // shader-only
    channels: { space, shareDepth }, // shared with presets
    app: { historyLimit, initialSeed }, // lab workspace
} as const;
```

**Rule from the header:** "One value, one name. Consumers read `CONFIG.<section>.<key>`; no re-declaration. Derived models (`constraintsOf`, `DEFAULT_LOOP_DURATION`, `channelModelOf`) are composition, not renaming. Guards (`MAX_SOURCE_LENGTH`, `MAX_LOOP_MS`) live next to the invariants they protect — not in config."

### The Juggling (What Actually Happens)

| Location                             | What it does                                                                                                                | Problem                                                                                                                       |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `core/color/color.ts`                | Imports `CONFIG.color.oklabChroma` at **module init**, interpolates into GLSL template strings (`OKLCH_GLSL`, `OKLAB_GLSL`) | Only place config → shader source. Is chroma a taste value (config) or color-space parameter (belongs in `COLOR_SPACES`)?     |
| `core/renderer/contract/contract.ts` | `DEFAULT_LOOP_DURATION = createDurationSeconds(CONFIG.artwork.loopMs / 1000)`                                               | Derived value, but lives in renderer layer. `parseDurationInput` in `labStore` now reads this instead of duplicating `/1000`. |
| `core/artwork/types.ts`              | `MIN_LOOP_MS = 100`, `MAX_LOOP_MS = 300_000`                                                                                | **Guards** (UI slider bounds + file validation), not config. But `parseDurationInput` uses them.                              |
| `core/grammar/grammar.ts`            | `constraintsOf(size)` reads `CONFIG.grammar.sizeProfiles[size]`                                                             | Good — this is the intended "derived model" pattern.                                                                          |
| `core/grammar/quantized.ts`          | `SIZE_PROFILE_IDS = Object.keys(CONFIG.grammar.sizeProfiles)`                                                               | Good — derives from config.                                                                                                   |
| `core/generator/generator.ts`        | `PARAM_SCALE = 10 ** CONFIG.generator.paramDecimals`                                                                        | Good — module-level constant derived from config.                                                                             |
| `core/config/types.ts`               | Exports `ParamRange`, `SizeProfileId`, `ColorSpaceId`, `SizeProfiles`                                                       | Types only — fine.                                                                                                            |
| `core/catalog/operators/types.ts`    | Exports `defineOperator` factory                                                                                            | **Runtime value in types.ts** (flagged in findings).                                                                          |
| `bench/notebook/types.ts`            | Exports `NOTEBOOK_FILE_FORMAT`, `NOTEBOOK_FILE_VERSION`, `MAX_NOTEBOOK_FILE_LENGTH`, `isNotebookRating`                     | **Runtime values in types.ts** (flagged in findings).                                                                         |

### The Import Graph (Simplified)

```
config.ts (CONFIG)
    │
    ├─► color.ts (oklabChroma → GLSL templates)  ← ONLY config→shader path
    ├─► grammar.ts (constraintsOf, channelModelOf)
    ├─► quantized.ts (SIZE_PROFILE_IDS, drawGrammar)
    ├─► generator.ts (PARAM_SCALE)
    ├─► renderer/contract/contract.ts (DEFAULT_LOOP_DURATION)
    ├─► artwork/types.ts (MIN/MAX_LOOP_MS — guards, NOT config)
    ├─► labStore.ts (parseDurationInput uses MIN/MAX_LOOP_MS + DEFAULT_LOOP_DURATION)
    └─► presets.ts (reads CONFIG.channels for Structure preset)
```

---

## Open Questions to Resolve

1. **`oklabChroma`**: Config taste value or color-space parameter? If the latter, move into `COLOR_SPACES` in `color.ts` and remove from `CONFIG.color`.

2. **`MIN_LOOP_MS` / `MAX_LOOP_MS`**: Currently in `artwork/types.ts` as guards. `parseDurationInput` uses them. Should they be in `CONFIG.app` (tunable) or stay as guards next to `Artwork` brand? Findings says: "UI slider range and file-validation bound, not a safety guard."

3. **`DEFAULT_LOOP_DURATION`**: Derived in `contract.ts` from `CONFIG.artwork.loopMs`. Only used by `RandomArtCanvas` (default prop) and `labStore.parseDurationInput` (fallback). Is `contract.ts` the right home?

4. **`HANDWRITTEN_TEST_SHADER`**: Test fixture in production code (`contract.ts`). Used as default `fragmentShader` in `RandomArtCanvas`. Move to test file.

5. **Runtime values in `types.ts`**: `defineOperator`, `NOTEBOOK_FILE_FORMAT`, `MAX_NOTEBOOK_FILE_LENGTH`, `isNotebookRating`. These are code, not types. Move to proper modules.

6. **`catalog` import in `grammar.ts:1`**: Imports `'../catalog'` without `.ts` extension — inconsistent with rest of package.

---

## Suggested Strategy

### Phase 1: Audit & Classify

Run a search for all hardcoded numbers/strings that should be configurable or are duplicated. Categorize each:

- **Config** (tunable, curated defaults) → `CONFIG`
- **Guard** (hard limit, invariant protection) → next to the brand/invariant
- **Derived** (computed from config) → single derivation site, re-exported
- **Constant** (never changes, not tunable) → `const` in owning module
- **Test fixture** → test file

### Phase 2: Centralize Config

- Ensure every `CONFIG` value has exactly **one** definition
- Every consumer reads `CONFIG.<section>.<key>` — no local copies
- Derived models (`constraintsOf`, `DEFAULT_LOOP_DURATION`, `PARAM_SCALE`, `SIZE_PROFILE_IDS`, `channelModelOf`) are **functions/constants in their domain module**, not in config

### Phase 3: Clean Up Juggling

- Move `oklabChroma` decision (config vs. color-space)
- Move `MIN/MAX_LOOP_MS` to clear home (config or guards)
- Move `DEFAULT_LOOP_DURATION` to single derivation site
- Move `HANDWRITTEN_TEST_SHADER` to test
- Move runtime values out of `types.ts` files

### Phase 4: Enforce

- Add lint rule or test that pins `CONFIG` values (already have `config.test.ts`)
- Document the "one value, one name" rule in conventions

---

## Files to Touch (Likely)

| File                                 | Role                                                         |
| ------------------------------------ | ------------------------------------------------------------ |
| `core/config/config.ts`              | The SSOT — audit every key                                   |
| `core/config/types.ts`               | Types only — remove runtime exports                          |
| `core/color/color.ts`                | `oklabChroma` decision, `COLOR_SPACES`                       |
| `core/artwork/types.ts`              | `MIN/MAX_LOOP_MS` — guard vs config                          |
| `core/renderer/contract/contract.ts` | `DEFAULT_LOOP_DURATION`, `HANDWRITTEN_TEST_SHADER`           |
| `core/grammar/grammar.ts`            | `constraintsOf`, `channelModelOf` (keep), fix catalog import |
| `core/grammar/quantized.ts`          | `SIZE_PROFILE_IDS`, `drawGrammar` (keep derivations)         |
| `core/generator/generator.ts`        | `PARAM_SCALE` (keep)                                         |
| `core/catalog/operators/types.ts`    | Move `defineOperator` out                                    |
| `bench/notebook/types.ts`            | Move runtime values out                                      |
| `stores/lab/labStore.ts`             | `parseDurationInput` — single source for bounds              |
| `components/lab/RandomArtCanvas.tsx` | Default `fragmentShader` — use test shader import            |

---

## Acceptance Criteria

- [ ] `vp check --fix` clean
- [ ] `vp test` all pass
- [ ] No hardcoded numbers that should be configurable
- [ ] No duplicated values (same number in two places)
- [ ] Clear separation: config / guards / derived / constants
- [ ] No runtime values in `types.ts` files
- [ ] `HANDWRITTEN_TEST_SHADER` in test file
- [ ] `config.test.ts` still pins all `CONFIG` values
- [ ] Documentation in `codex/docs/conventions/` updated if patterns change

---

## Tips for the Next Agent

- Start with `rg -n "const\|MAX_\|MIN_\|DEFAULT_" packages/randomart/src --type ts` to find candidates
- Check `config.test.ts` — it defines the expected `CONFIG` shape
- The `findings.md` has more context on past decisions (search "Config-adjacent smells")
- Don't over-engineer: the current `CONFIG` object is well-structured. The fix is mostly **moving strays to their right home** and **removing duplicate derivations**.

---

**Previous session:** Comment cleanup (15 files, -149 lines net).  
**Current branch:** `main` at `f9afd0b`.  
**Run:** `vp -C packages/randomart check --fix && vp -C packages/randomart test` before starting.
