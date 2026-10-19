# Randomart — Config values vs hard constraints (2026-10-19)

Entry point for the consolidation track: `randomart-coherence-plan.md`.

Follow-up of `randomart-time-in-xy.md`. Landed with the config-file session
(prompt: `codex/prompts/session-config-file.md`). `GENERATOR_VERSION` is **not** bumped:
every wired value is byte-identical to what it replaced; the pinning tests
(`core/config/config.test.ts`) lock that. A second pass closed the first TODO list (param
rounding, sampler policy, artwork/shell defaults, `DEFAULT_CONSTRAINTS`, the 8 s loop
duplication) and added the colour chroma value; still no version bump, every value
unchanged. A third pass (config session, follow-up) renamed the module and removed the
duplicated names without touching a single value (see "One value, one name" below).

## What landed

- `packages/randomart/src/core/config/config.ts` — a single typed module, `CONFIG`,
  holding the curated values: the time terminals' draw ranges (`amp`, `phase`, `cycles`)
  and cycle-count mapping, plus the recipe space. The config is the **single source of
  truth of the quantized axes**: one entry per weight level (`weight` + `odds` +
  `allowsAnchors`) and per size profile, and the public `WeightLevel`/`SizeProfileId`
  types are `keyof` those entries — adding a `medium-low` or a `xx-large` is adding one
  entry, and the compiler then points at every site that must handle it (`LEVEL_WEIGHT`,
  the UI selects, the pins test). The axis id arrays (`WEIGHT_LEVELS`,
  `SIZE_PROFILE_IDS`, `ANCHOR_LEVELS`) are derived from the entry order, which is the
  PRNG draw order — **append, don't reorder**.
- Wiring (kept minimal on purpose): `catalog/operators/terminals.ts` and
  `grammar/quantized.ts`. The latter keeps its exported names (`SIZE_PROFILES`,
  `LEVEL_WEIGHT`, …), so no consumer moved. Bonus dedup: the anchor-eligibility list
  existed three times (`ANCHOR_LEVELS` and `ANCHOR_OK` in `quantized.ts`, again in
  `GrammarSection.tsx`) — now one derived list, exported from the grammar.
- `core/config/config.test.ts` — pins every group so a change cannot slip in silently: a
  failure is the reminder that comes with a consequence (below).
- **Second pass** — `CONFIG` gained `generator.paramDecimals`, `sampling`, `artwork`,
  `color` (OKLab chroma), `channels` (the curated space/shareDepth, now the single source
  for both `DEFAULT_CHANNELS` and `STRUCTURE_RECIPE`) and `app` (history limit, initial
  seed). Wiring touched `generator.ts` (`PARAM_SCALE`), `grammar.ts`
  (`DEFAULT_CONSTRAINTS` = `recipe.sizeProfiles.medium`), `randomize.ts`,
  `randomGrammar.ts`, `sample.ts`, `quantized.ts`, `benchStore.ts`, `appStore.ts`,
  `renderer/contract.ts` (the 8 s loop now derives from `CONFIG.artwork.loopMs`) and
  `color/index.ts` (chroma interpolation). The sampler values are named by policy:
  `exploreSpread` for a UI step, `drawSpread` for a full draw, `benchSeedsPerGrammar` (36)
  vs `datasetSeedsPerGrammar` (16).
- **Third pass — rename and de-duplication** (`TUNING` was never a tuning object: it is
  the config and its SSOT). `config/tuning.ts` → `config/config.ts`, `TUNING` → `CONFIG`,
  `Tuning` → `Config`, `tuning.test.ts` → `config.test.ts`. The `default` prefix dropped on
  the keys that _are_ the default of their section: `artwork.width|height|loopMs`,
  `channels.space|shareDepth`. The pure aliases are gone (see below).
- **Naming convention** — `codex/docs/conventions/02-typescript.md` §2.1 now covers
  casing, `type` vs `interface`, role suffixes, function prefixes
  (`create`/`fit`/`parse`/`serialize`/`draw`/`sample`/…), booleans, constants and units,
  abbreviations, domain vocabulary and renames. An earlier pass applied it to two existing
  names: `WeightLevelKnobs.anchor` → `allowsAnchors` (a boolean reads as an assertion) and
  `PROFILE_IDS` → `SIZE_PROFILE_IDS` (the type is `SizeProfileId`).

## One value, one name

A value that is hardcoded in `CONFIG` is, by construction, the default of its section; a
second name in the domain that consumes it (`DEFAULT_X = CONFIG...`) is noise and gives
the value two identities. The third pass deleted the aliases that were pure renames:

| Removed                                                              | Was declared in         | Consumers now read                     |
| -------------------------------------------------------------------- | ----------------------- | -------------------------------------- |
| `DEFAULT_RENDER_WIDTH` / `DEFAULT_RENDER_HEIGHT` / `DEFAULT_LOOP_MS` | `core/artwork/types.ts` | `CONFIG.artwork.width\|height\|loopMs` |
| `DEFAULT_SHARE_DEPTH`                                                | `core/color/index.ts`   | `CONFIG.channels.shareDepth`           |
| `HISTORY_LIMIT` (local)                                              | `stores/appStore.ts`    | `CONFIG.app.historyLimit`              |

The side benefit is the original smell: `core/artwork/types.ts` no longer imports a runtime
value — a types file holds types and guards, never a config value or an alias of one.

Derivations are kept, because they build a _model_ out of several values and/or a unit,
they do not rename one:

- `DEFAULT_CHANNELS` (`color/index.ts`) = `{space: CONFIG.channels.space, shareDepth: CONFIG.channels.shareDepth}`.
- `DEFAULT_CONSTRAINTS` (`grammar/grammar.ts`) = `CONFIG.recipe.sizeProfiles.medium` — the
  fallback of `createGrammar` when the caller says nothing. The choice of `medium` stays in
  the domain: it is a grammar default, not a global config value (that `STRUCTURE_RECIPE.size`
  is also `medium` is a curation coincidence, not a duplication: fallback vs preset are
  different concepts).
- `DEFAULT_LOOP_DURATION` (`renderer/contract.ts`) = `CONFIG.artwork.loopMs / 1000`, branded.
- `WEIGHT_LEVELS` / `SIZE_PROFILE_IDS` / `SIZE_PROFILES` / `LEVEL_WEIGHT` / `ANCHOR_LEVELS`
  (`grammar/quantized.ts`) materialize the axis order; `PARAM_SCALE` (`generator.ts`) the
  rounding scale.

## Where a type lives

The same pass fixed the placement of the shared types (`artwork/types.ts` exporting runtime
aliases was the trigger). The rule:

1. A type imported by ≥ 2 modules lives in its owning module's `types.ts`, exported through
   the module barrel (`core/color/types.ts`, `core/grammar/types.ts`).
2. A type used by one module stays colocated with its producer/consumer.
3. A `types.ts` may carry the module's guards (`MIN/MAX_*`), because they protect the type
   beside them; it must never carry a config value (`artwork/types.ts`, `grammar/types.ts`,
   `compiler/types.ts`, `notebook/types.ts` all keep their guards).
4. Exceptions, deliberate: a brand stays next to its factory (`Seed` in `random/seed.ts`,
   `Phase` in `renderer/contract.ts`); a single-concept file keeps its type
   (`analysis/descriptors.ts` → `RgbImage`); the axis ids stay next to the values they are
   `keyof` (`WeightLevel`/`SizeProfileId` in `config/config.ts`, `FamilyId`/`ShareChoice`
   derived from the `quantized.ts` vocabulary lists).

Applied: `core/color/types.ts` gained `ColorSpaceId` + `ChannelModel`; `grammar/types.ts`
gained `Recipe`, `FamilyId`, `ShareChoice`, `GrammarSummary`, `SampleOptions`. Open, tracked
in `findings.md`: `GrammarData` (owned by `artwork/serialize.ts`, consumed by
`core/notebook`) and `LotView` (`components/bench/lot.ts`, consumed by `stores/benchStore.ts`
— a store depending on a component).

## The split: knobs vs guards

**Knobs** (`CONFIG`): values that express taste — how the art should feel. They are read, not
passed; a domain may derive a model from them.

**Guards** (stay next to their invariant): values that keep the system safe or make an
invariant checkable. Changing them is a bug, not an experiment.

| Constant                                                                | File                                            | Category                                             |
| ----------------------------------------------------------------------- | ----------------------------------------------- | ---------------------------------------------------- |
| `amp`/`phase`/`cycles` bounds                                           | `CONFIG.terminals`                              | knob ✅                                              |
| cycle mapping `1..3`                                                    | `CONFIG.terminals`                              | knob ✅                                              |
| `levels` (`weight` + `odds` + `allowsAnchors`)                          | `CONFIG.recipe`                                 | knob ✅                                              |
| `minActiveFamilies`                                                     | `CONFIG.recipe`                                 | knob ✅                                              |
| `sizeProfiles`                                                          | `CONFIG.recipe`                                 | knob ✅                                              |
| param rounding (`paramDecimals = 3`)                                    | `CONFIG.generator`                              | knob ✅ (draw-affecting)                             |
| sampler defaults (`baseSeed`, spreads, `changeRate`, seeds per grammar) | `CONFIG.sampling`                               | knob ✅                                              |
| `DEFAULT_CONSTRAINTS`                                                   | `grammar/grammar.ts`                            | knob ✅ (derived from `sizeProfiles.medium`)         |
| OkLab chroma `0.4`                                                      | `CONFIG.color`                                  | knob ✅ (shader output, not PRNG)                    |
| curated space/shareDepth                                                | `CONFIG.channels`                               | knob ✅ (single source for the default recipe)       |
| `HISTORY_LIMIT`, initial seed `42`                                      | `CONFIG.app`                                    | knob ✅                                              |
| render values (1024², 8 000 ms)                                         | `CONFIG.artwork`                                | knob ✅                                              |
| `DEFAULT_LOOP_DURATION` (8 s, renderer)                                 | `renderer/contract.ts`                          | derived ✅ (from `CONFIG.artwork.loopMs`)            |
| presets (`STRUCTURE_RECIPE`, `PRESET_RECIPES`)                          | `grammar/presets.ts`                            | curated recipes, domain-owned (see below)            |
| calibrated weights in `defaultGrammar`                                  | `grammar/grammar.ts`                            | TODO (a calibration preset; keep in code or name it) |
| `MIN/MAX_LOOP_MS`                                                       | `core/artwork/types.ts`                         | TODO (bounds are slider + validation, semi-guard)    |
| dataset continuous draw vs quantized recipe space                       | `grammar/sample.ts`, `grammar/randomGrammar.ts` | TODO (dataset/bench policy)                          |
| `MAX_DEPTH`, `MAX_NODES`, `MAX_WEIGHT`, `MIN_ACTIVE_WEIGHT`             | `grammar/types.ts`                              | guard — stays                                        |
| `MAX_SOURCE_LENGTH`                                                     | `compiler/types.ts`                             | guard — stays (shader blow-up)                       |
| `MIN/MAX_RENDER_SIZE`, `MAX_TITLE_LENGTH`                               | `core/artwork/types.ts`                         | guard — stays                                        |
| attempt caps in `randomRecipe`/`sampleRecipes`                          | `grammar/quantized.ts`                          | guard — stays (loop termination)                     |

## PRNG consequences (the rule behind the pins)

- **Draw-affecting** (`CONFIG.terminals`, `CONFIG.generator.paramDecimals`): same
  `(grammar, seed)` → different numbers → different image. Changing these **must bump
  `GENERATOR_VERSION`** and regenerate the generator snapshots.
- **Sampler-affecting** (`CONFIG.recipe`, `CONFIG.sampling`): changes which recipes and
  seeds the app/dataset explores, but `generate()` for a given `(grammar, seed)` still draws
  the same numbers. No version bump; the exploration just moves. (`sizeProfiles` sits on
  this side because `recipeToGrammar` re-derives the grammar from the recipe — nothing
  stored replays through old profiles.)
- **Render-affecting** (`CONFIG.color`): changes the shader's output, not the expression or
  the draws. No `GENERATOR_VERSION` bump; a shader change is its own event (the colour
  note's open lead).
- **Shell/render policy** (`CONFIG.artwork`, `CONFIG.channels`, `CONFIG.app`): no PRNG
  impact. `channels` curates both `DEFAULT_CHANNELS` and `STRUCTURE_RECIPE`, so the curated
  default has one source.

## Decisions and rationale

1. **Shape: one typed TS module, not JSON — and it is the SSOT of the axes** (decision,
   2026-10-19 follow-up). `WeightLevel` and `SizeProfileId` are `keyof` the config entries:
   adding a `medium-low` is one entry in `CONFIG.recipe.levels`, after which the compiler
   points at every site that must handle it (the derived `LEVEL_WEIGHT`, the UI selects, the
   pins). Entry order is the PRNG draw order, so the rule is **append, don't reorder**. Vite
   HMR gives the iteration loop JSON would. JSON buys parsing flexibility only once the
   config must live outside the code process — not the case. The object stays a single file
   (§2.6: do not split in advance); if it ever splits, cut by PRNG tier (draw / sampler /
   shell), not by domain.
2. **Name: `CONFIG`/`Config`, not `TUNING`/`Tuning`** (decision, third pass). The object is
   the config and its SSOT; "tuning" promised hot knobs and invited tweaks. Guards keep
   their own homes, so `CONFIG` never becomes a dumping ground.
3. **Seam: direct import of the const, not config-parameter threading.** `CONFIG` is
   compile-time-constant data, same category as `MAX_DEPTH`; injecting it through
   `createDefaultCatalog` → grammar → sampler would be indirection with no second
   implementation (§1.5, decision rules 3 + 8). Revisit only if live in-UI config wants
   multiple coexisting profiles — then the single seam is a `Config` argument on catalog
   construction.
4. **Guards do not move.** Dumping `MAX_DEPTH` into a configurable file would invite the one
   edit that breaks the shader-size invariant. They stay beside the code that relies on
   them.
5. **Presets stay in the grammar.** A `Recipe` is a point of the quantized space, a preset a
   _named_ recipe (§2.1.8); `grammarPresets(catalog)` needs the catalog to become grammars,
   so the list lives with that code, not in `CONFIG`. `STRUCTURE_RECIPE` reads
   `CONFIG.channels` for `share`/`space` and its own literals for `size`/`levels`: that is
   the preset's definition, not a duplicated config value.

## Patterns worth promoting (framing Q4)

- **`{min, max}` pairs** recur (all param ranges). The concept already exists as `ParamRange`
  (catalog) — `CONFIG` reuses it; new bound pairs should too, not invent ad-hoc objects.
- **One entry per level of a discrete axis** (the merged construct): a level is one concept
  carrying `weight` (its meaning), `odds` (how often it is drawn) and `allowsAnchors`
  (eligibility), so all three live in one config entry instead of three parallel maps. The
  former three copies of the anchor list (`ANCHOR_LEVELS`, `ANCHOR_OK`,
  `GrammarSection.tsx`) were the cost of the parallel-map shape — now one derived list.
- **Named points of a discrete axis**: `sizeProfiles` is the pattern for "a few curated
  settings instead of a range" — `DEFAULT_CONSTRAINTS` derives from `sizeProfiles.medium`.
- **Unit/owner duplication**: resolved. The renderer's `DEFAULT_LOOP_DURATION` derives from
  `CONFIG.artwork.loopMs`; the config owns the number, the renderer only brands it as
  seconds.
- **One value, one name**: an alias of a config path is not worth a declaration; a
  derivation (composition, unit conversion, order materialization) is.

## TODO (next passes, smallest first)

1. `defaultGrammar`: the app's default is the `Structure` preset (`STRUCTURE_RECIPE`);
   `defaultGrammar` is a measured calibration fixture used by tests and compiler fuzzing.
   Its name still reads as "the app default". Either rename it (`calibrationGrammar`) or
   document the distinction at the definition; no behaviour change.
2. `MIN/MAX_LOOP_MS`: decide knob vs guard. They are a UI slider range and a file-validation
   bound, not a safety guard; if they stay, say why in `artwork/types.ts`.
3. Dataset sampler: the offline dataset still draws continuous grammars (`sampleGrammars` →
   `randomGrammar`), while the app and the bench explore the quantized recipes. Decide
   whether the dataset should move to `sampleRecipes` (same space as the bench) and retire
   the continuous draw, or keep and document the wider survey.
4. Placement leftovers (see `findings.md`): `GrammarData` ownership (artwork serialization
   consumed by the notebook) and `LotView` (a store importing a component type).
5. Naming-convention cleanup batch (see §2.1): `LotView` counts
   (`cells`/`grammars`/`failed`/`flats` → `*Count`), the `serializeArtwork` (`string`) vs
   `serializeGrammar` (`data`) asymmetry, and `validateChannels` (it throws on content and
   repairs `shareDepth`, so neither `assert` nor `fit` names it exactly).
