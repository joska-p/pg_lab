# Randomart — Tuning knobs vs hard constraints (2026-10-19)

Entry point for the consolidation track: `randomart-coherence-plan.md`.

Follow-up of `randomart-time-in-xy.md`. Landed with the config-file session
(prompt: `codex/prompts/session-config-file.md`). `GENERATOR_VERSION` is
**not** bumped: every wired value is byte-identical to what it replaced; the
pinning tests (`core/config/tuning.test.ts`) lock that. A second pass closed
the first TODO list (param rounding, sampler policy, artwork/shell defaults,
`DEFAULT_CONSTRAINTS`, the 8 s loop duplication) and added the colour chroma
knob; still no version bump, every value unchanged.

## What landed

- `packages/randomart/src/core/config/tuning.ts` — a single typed module,
  `TUNING`, holding the taste knobs: the time terminals' draw ranges (`amp`,
  `phase`, `cycles`) and cycle-count mapping, plus the recipe space. The
  config is the **single source of truth of the quantized axes**: one entry
  per weight level (`weight` + `odds` + `allowsAnchors`) and per size profile,
  and the public `WeightLevel`/`SizeProfileId` types are `keyof` those entries
  — adding a `medium-low` or a `xx-large` is adding one entry, and the
  compiler then points at every site that must handle it (`LEVEL_WEIGHT`, the
  UI selects, the pins test). The axis id arrays (`WEIGHT_LEVELS`,
  `SIZE_PROFILE_IDS`, `ANCHOR_LEVELS`) are derived from the entry order, which
  is the PRNG draw order — **append, don't reorder**.
- Wiring (kept minimal on purpose): `catalog/operators/terminals.ts` and
  `grammar/quantized.ts`. The latter keeps its exported names
  (`SIZE_PROFILES`, `LEVEL_WEIGHT`, …), so no consumer moved. Bonus dedup:
  the anchor-eligibility list existed three times (`ANCHOR_LEVELS` and
  `ANCHOR_OK` in `quantized.ts`, again in `GrammarSection.tsx`) — now one
  derived list, exported from the grammar.
- `core/config/tuning.test.ts` — pins every group so a knob tweak cannot slip
  in silently: a failure is the reminder that comes with a consequence
  (below).
- **Second pass** — `TUNING` gained `generator.paramDecimals`, `sampling`,
  `artwork`, `color` (OKLab chroma), `channels` (the curated space/shareDepth,
  now the single source for both `DEFAULT_CHANNELS` and `STRUCTURE_RECIPE`)
  and `app` (history limit, initial seed). Wiring touched `generator.ts`
  (`PARAM_SCALE`), `grammar.ts` (`DEFAULT_CONSTRAINTS` =
  `TUNING.recipe.sizeProfiles.medium`), `randomize.ts`, `randomGrammar.ts`,
  `sample.ts`, `quantized.ts`, `benchStore.ts`, `appStore.ts`,
  `artwork/types.ts`, `renderer/contract.ts` (the 8 s loop now derives from
  `DEFAULT_LOOP_MS`) and `color/index.ts` (chroma interpolation). The
  sampler defaults are named by policy: `exploreSpread` for a UI step,
  `drawSpread` for a full draw, `benchSeedsPerGrammar` (36) vs
  `datasetSeedsPerGrammar` (16).
- **Naming convention** — `codex/docs/conventions/02-typescript.md` §2.1 now
  covers casing, `type` vs `interface`, role suffixes, function prefixes
  (`create`/`fit`/`parse`/`serialize`/`draw`/`sample`/…), booleans, constants
  and units, abbreviations, domain vocabulary and renames. This pass applied
  it to two existing names: `WeightLevelKnobs.anchor` →
  `allowsAnchors` (a boolean reads as an assertion) and `PROFILE_IDS` →
  `SIZE_PROFILE_IDS` (the type is `SizeProfileId`).

## The split: knobs vs guards

**Knobs** (`TUNING`): values that express taste — how the art should feel.
Iterating on them should never require reading (much less editing) code.

**Guards** (stay next to their invariant): values that keep the system safe
or make an invariant checkable. Tuning them is a bug, not an experiment.

| Constant                                                                      | File                                            | Category                                             |
| ----------------------------------------------------------------------------- | ----------------------------------------------- | ---------------------------------------------------- |
| `amp`/`phase`/`cycles` bounds                                                 | `TUNING.terminals`                              | knob ✅                                              |
| cycle mapping `1..3`                                                          | `TUNING.terminals`                              | knob ✅                                              |
| `levels` (`weight` + `odds` + `allowsAnchors`)                                | `TUNING.recipe`                                 | knob ✅                                              |
| `minActiveFamilies`                                                           | `TUNING.recipe`                                 | knob ✅                                              |
| `sizeProfiles`                                                                | `TUNING.recipe`                                 | knob ✅                                              |
| param rounding (`paramDecimals = 3`)                                          | `TUNING.generator`                              | knob ✅ (draw-affecting)                             |
| sampler defaults (`baseSeed`, spreads, `changeRate`, seeds per grammar)       | `TUNING.sampling`                               | knob ✅                                              |
| `DEFAULT_CONSTRAINTS`                                                         | `grammar/grammar.ts`                            | knob ✅ (derived from `sizeProfiles.medium`)         |
| OkLab chroma `0.4`                                                            | `TUNING.color`                                  | knob ✅ (shader output, not PRNG)                    |
| curated space/shareDepth                                                      | `TUNING.channels`                               | knob ✅ (single source for the default recipe)       |
| `HISTORY_LIMIT`, initial seed `42`                                            | `TUNING.app`                                    | knob ✅                                              |
| render defaults (1024², 8 000 ms)                                             | `TUNING.artwork`                                | knob ✅                                              |
| `DEFAULT_LOOP_DURATION` (8 s, renderer) vs `DEFAULT_LOOP_MS` (8 000 ms, core) | `renderer/contract.ts`, `core/artwork/types.ts` | resolved ✅ (renderer derives from core)             |
| calibrated weights in `defaultGrammar`                                        | `grammar/grammar.ts`                            | TODO (a calibration preset; keep in code or name it) |
| `MIN/MAX_LOOP_MS`                                                             | `core/artwork/types.ts`                         | TODO (bounds are slider + validation, semi-guard)    |
| dataset continuous draw vs quantized recipe space                             | `grammar/sample.ts`, `grammar/randomGrammar.ts` | TODO (dataset/bench policy)                          |
| `MAX_DEPTH`, `MAX_NODES`, `MAX_WEIGHT`, `MIN_ACTIVE_WEIGHT`                   | `grammar/types.ts`                              | guard — stays                                        |
| `MAX_SOURCE_LENGTH`                                                           | `compiler/types.ts`                             | guard — stays (shader blow-up)                       |
| `MIN/MAX_RENDER_SIZE`, `MAX_TITLE_LENGTH`                                     | `core/artwork/types.ts`                         | guard — stays                                        |
| attempt caps in `randomRecipe`/`sampleRecipes`                                | `grammar/quantized.ts`                          | guard — stays (loop termination)                     |

## PRNG consequences (the rule behind the pins)

- **Draw-affecting** (`TUNING.terminals`, `TUNING.generator.paramDecimals`):
  same `(grammar, seed)` → different numbers → different image. Changing these
  **must bump `GENERATOR_VERSION`** and regenerate the generator snapshots.
- **Sampler-affecting** (`TUNING.recipe`, `TUNING.sampling`): changes which
  recipes and seeds the app/dataset explores, but `generate()` for a given
  `(grammar, seed)` still draws the same numbers. No version bump; the
  exploration just moves. (`sizeProfiles` sits on this side because
  `recipeToGrammar` re-derives the grammar from the recipe — nothing stored
  replays through old profiles.)
- **Render-affecting** (`TUNING.color`): changes the shader's output, not the
  expression or the draws. No `GENERATOR_VERSION` bump; a shader change is
  its own event (the colour note's open lead).
- **Shell/render policy** (`TUNING.artwork`, `TUNING.channels`, `TUNING.app`):
  no PRNG impact. `channels` curates both `DEFAULT_CHANNELS` and
  `STRUCTURE_RECIPE`, so the curated default has one source.

## Decisions and rationale

1. **Shape: one typed TS module, not JSON — and it is the SSOT of the
   axes** (decision, 2026-10-19 follow-up). `WeightLevel` and `SizeProfileId`
   are `keyof` the config entries: adding a `medium-low` is one entry in
   `TUNING.recipe.levels`, after which the compiler points at every site that
   must handle it (the derived `LEVEL_WEIGHT`, the UI selects, the pins).
   Entry order is the PRNG draw order, so the rule is **append, don't
   reorder**. Vite HMR gives the iteration loop JSON would. JSON buys
   parsing flexibility only once tuning must live outside the code process —
   not the case.
2. **Seam: direct import of the const, not config-parameter threading.**
   `TUNING` is compile-time-constant data, same category as `MAX_DEPTH`;
   injecting it through `createDefaultCatalog` → grammar → sampler would be
   indirection with no second implementation (§1.5, decision rules 3 + 8).
   Revisit only if live in-UI tuning wants multiple coexisting profiles —
   then the single seam is a `Tuning` argument on catalog construction.
3. **Guards do not move.** Dumping `MAX_DEPTH` into a tunable file would
   invite the one edit that breaks the shader-size invariant. They stay
   beside the code that relies on them.

## Patterns worth promoting (framing Q4)

- **`{min, max}` pairs** recur (all param ranges). The concept already
  exists as `ParamRange` (catalog) — `TUNING` reuses it; new bound pairs
  should too, not invent ad-hoc objects.
- **One entry per level of a discrete axis** (the merged construct): a level
  is one concept carrying `weight` (its meaning), `odds` (how often it is
  drawn) and `allowsAnchors` (eligibility), so all three live in one config
  entry instead of three parallel maps. Same shape for future per-family or
  per-preset metadata. The former three copies of the anchor list
  (`ANCHOR_LEVELS`, `ANCHOR_OK`, `GrammarSection.tsx`) were the cost of the
  parallel-map shape — now one derived list.
- **Named points of a discrete axis**: `sizeProfiles` is the pattern for
  "a few curated settings instead of a range" — `DEFAULT_CONSTRAINTS` now
  derives from `sizeProfiles.medium`.
- **Unit/owner duplication**: resolved. The renderer's
  `DEFAULT_LOOP_DURATION` derives from the core `DEFAULT_LOOP_MS`; the
  artwork spec owns the number, the renderer only brands it as seconds.

## TODO (next passes, smallest first)

1. `defaultGrammar`: the app's default is the `Structure` preset
   (`STRUCTURE_RECIPE`); `defaultGrammar` is a measured calibration fixture
   used by tests and compiler fuzzing. Its name still reads as "the app
   default". Either rename it (`calibrationGrammar`) or document the
   distinction at the definition; no behaviour change.
2. `MIN/MAX_LOOP_MS`: decide knob vs guard. They are a UI slider range and a
   file-validation bound, not a safety guard; if they stay, say why in
   `artwork/types.ts`.
3. Dataset sampler: the offline dataset still draws continuous grammars
   (`sampleGrammars` → `randomGrammar`), while the app and the bench explore
   the quantized recipes. Decide whether the dataset should move to
   `sampleRecipes` (same space as the bench) and retire the continuous draw,
   or keep and document the wider survey.
4. Naming-convention cleanup batch (see §2.1): `LotView` counts
   (`cells`/`grammars`/`failed`/`flats` → `*Count`), the `serializeArtwork`
   (`string`) vs `serializeGrammar` (`data`) asymmetry, and
   `validateChannels` (it throws on content and repairs `shareDepth`, so
   neither `assert` nor `fit` names it exactly).
