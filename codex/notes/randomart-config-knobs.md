# Randomart — Tuning knobs vs hard constraints (2026-10-19)

Follow-up of `randomart-time-in-xy.md`. Landed with the config-file session
(prompt: `codex/prompts/session-config-file.md`). `GENERATOR_VERSION` is
**not** bumped: every wired value is byte-identical to what it replaced; the
pinning tests (`core/config/tuning.test.ts`) lock that.

## What landed

- `packages/randomart/src/core/config/tuning.ts` — a single typed module,
  `TUNING`, holding the taste knobs: the time terminals' draw ranges (`amp`,
  `phase`, `cycles`) and cycle-count mapping, plus the recipe space. The
  config is the **single source of truth of the quantized axes**: one entry
  per weight level (`weight` + `odds` + `anchor`) and per size profile, and
  the public `WeightLevel`/`SizeProfileId` types are `keyof` those entries —
  adding a `medium-low` or a `xx-large` is adding one entry, and the compiler
  then points at every site that must handle it (`LEVEL_WEIGHT`, the UI
  selects, the pins test). The axis id arrays (`WEIGHT_LEVELS`,
  `PROFILE_IDS`, `ANCHOR_LEVELS`) are derived from the entry order, which is
  the PRNG draw order — **append, don't reorder**.
- Wiring (kept minimal on purpose): `catalog/operators/terminals.ts` and
  `grammar/quantized.ts`. The latter keeps its exported names
  (`SIZE_PROFILES`, `LEVEL_WEIGHT`, …), so no consumer moved. Bonus dedup:
  the anchor-eligibility list existed three times (`ANCHOR_LEVELS` and
  `ANCHOR_OK` in `quantized.ts`, again in `GrammarSection.tsx`) — now one
  derived list, exported from the grammar.
- `core/config/tuning.test.ts` — pins both groups so a knob tweak cannot slip
  in silently: a failure is the reminder that comes with a consequence
  (below).

## The split: knobs vs guards

**Knobs** (`TUNING`): values that express taste — how the art should feel.
Iterating on them should never require reading (much less editing) code.

**Guards** (stay next to their invariant): values that keep the system safe
or make an invariant checkable. Tuning them is a bug, not an experiment.

| Constant                                                                                      | File                                                                    | Category                                             |
| --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ---------------------------------------------------- |
| `amp`/`phase`/`cycles` bounds                                                                 | `catalog/operators/terminals.ts`                                        | knob ✅                                              |
| cycle mapping `1..3`                                                                          | `catalog/operators/terminals.ts`                                        | knob ✅                                              |
| `levels` (weight + odds + anchor per level)                                                   | `grammar/quantized.ts`                                                  | knob ✅                                              |
| `MIN_ACTIVE_FAMILIES`                                                                         | `grammar/quantized.ts`                                                  | knob ✅                                              |
| `SIZE_PROFILES`                                                                               | `grammar/quantized.ts`                                                  | knob ✅                                              |
| param 3-decimal rounding                                                                      | `generator/generator.ts`                                                | knob TODO                                            |
| `DEFAULT_CONSTRAINTS`                                                                         | `grammar/grammar.ts`                                                    | TODO (duplicates the `medium` profile — derive it)   |
| calibrated weights in `defaultGrammar`                                                        | `grammar/grammar.ts`                                                    | TODO (a calibration preset; keep in code or name it) |
| sampler defaults (`baseSeed`, `seedsPerGrammar`, `spread`, `changeRate`, dedupe/attempt caps) | `grammar/quantized.ts`, `grammar/sample.ts`, `grammar/randomGrammar.ts` | TODO (dataset/bench policy)                          |
| `HISTORY_LIMIT`, initial seed `42`                                                            | `stores/appStore.ts`                                                    | TODO (shell-level taste)                             |
| `DEFAULT_RENDER_WIDTH/HEIGHT`, `DEFAULT_LOOP_MS`, `MIN/MAX_LOOP_MS`                           | `core/artwork/types.ts`                                                 | TODO (bounds are slider + validation, semi-guard)    |
| `DEFAULT_LOOP_DURATION` (8 s, renderer) vs `DEFAULT_LOOP_MS` (8 000 ms, core)                 | `renderer/contract.ts`, `core/artwork/types.ts`                         | TODO (one truth, one unit)                           |
| `MAX_DEPTH`, `MAX_NODES`, `MAX_WEIGHT`, `MIN_ACTIVE_WEIGHT`                                   | `grammar/types.ts`                                                      | guard — stays                                        |
| `MAX_SOURCE_LENGTH`                                                                           | `compiler/types.ts`                                                     | guard — stays (shader blow-up)                       |
| `MIN/MAX_RENDER_SIZE`, `MAX_TITLE_LENGTH`                                                     | `core/artwork/types.ts`                                                 | guard — stays                                        |
| attempt caps in `randomRecipe`/`sampleRecipes`                                                | `grammar/quantized.ts`                                                  | guard — stays (loop termination)                     |

## PRNG consequences (the rule behind the pins)

- **Draw-affecting** (`TUNING.terminals`, later the param rounding): same
  `(grammar, seed)` → different numbers → different image. Changing these
  **must bump `GENERATOR_VERSION`** and regenerate the generator snapshots.
- **Sampler-affecting** (`TUNING.recipe`): changes which recipes and seeds
  the app/dataset explores, but `generate()` for a given `(grammar, seed)`
  still draws the same numbers. No version bump; the exploration just moves.
  (`SIZE_PROFILES` sits on this side because `recipeToGrammar` re-derives the
  grammar from the recipe — nothing stored replays through old profiles.)

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
  drawn) and `anchor` (eligibility), so all three live in one config entry
  instead of three parallel maps. Same shape for future per-family or
  per-preset metadata. The former three copies of the anchor list
  (`ANCHOR_LEVELS`, `ANCHOR_OK`, `GrammarSection.tsx`) were the cost of the
  parallel-map shape — now one derived list.
- **Named points of a discrete axis**: `SIZE_PROFILES` is the pattern for
  "a few curated settings instead of a range" — `DEFAULT_CONSTRAINTS` and
  the render defaults are candidates to become points of similar axes.
- **Unit/owner duplication**: the 8 s loop exists twice (ms in core, s in
  the renderer contract). Next wiring pass should pick one owner.

## TODO (next passes, smallest first)

1. `appStore.ts`: `HISTORY_LIMIT`, initial seed `42` (pure shell knobs).
2. Artwork/render defaults: `DEFAULT_RENDER_WIDTH/HEIGHT`, `DEFAULT_LOOP_MS`
   and the loop-duration duplication with `renderer/contract.ts`.
3. `generator.ts`: `PARAM_DECIMALS = 3` — draw-affecting, needs the
   `GENERATOR_VERSION` bump + snapshot regen when it actually moves.
4. Sampler policy defaults in `quantized.ts`/`sample.ts`/`randomGrammar.ts`
   (`baseSeed`, `seedsPerGrammar`, `spread`, `changeRate`) and
   `DEFAULT_CONSTRAINTS` derived from `SIZE_PROFILES.medium`.
