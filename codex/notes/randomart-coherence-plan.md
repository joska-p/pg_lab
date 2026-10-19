# Randomart — Coherence plan (entry point, 2026-10-19)

Navigation aid for the next sessions; the repository is the source of truth. Read this
first, then only the linked docs the current task needs.

- Coherence audit (tooling, findings, next action): `codex/notes/randomart-audit-handoff.md`.
- Knobs vs guards, landed values, PRNG consequences: `codex/notes/randomart-config-knobs.md`.
- Naming rules: `codex/docs/conventions/02-typescript.md` §2.1.
- Colour pipeline and gamut lead: `codex/notes/randomart-colour-pipeline.md`.
- Time in `x`/`y` terminals: `codex/notes/randomart-time-in-xy.md`.

## Goal

Randomart grew organically; the consolidation track is: one place for the curated values
(`CONFIG`), one vocabulary for names (§2.1), no contradictory or duplicated defaults.
Functional behaviour stays byte-identical unless a session explicitly decides otherwise,
and then the PRNG consequence (`GENERATOR_VERSION`) is named.

## State after this session

- `CONFIG` is the single source for: `terminals`, `generator` (param rounding),
  `recipe`, `sampling`, `artwork` (1024², 8 000 ms), `color` (OKLab chroma),
  `channels` (curated space + `shareDepth`, feeding both `DEFAULT_CHANNELS` and
  `STRUCTURE_RECIPE`), `app` (history limit, initial seed).
- Wired: `generator.ts`, `grammar.ts` (`DEFAULT_CONSTRAINTS` =
  `sizeProfiles.medium`), `randomize.ts`, `randomGrammar.ts`, `sample.ts`,
  `quantized.ts`, `benchStore.ts`, `appStore.ts`, `artwork/create.ts`,
  `renderer/contract.ts` (8 s derives from `CONFIG.artwork.loopMs`), `color/index.ts`.
- **One value, one name** (config session): `tuning.ts`/`TUNING`/`Tuning` renamed to
  `config.ts`/`CONFIG`/`Config`; the redundant `default` prefix dropped on the keys
  (`artwork.width|height|loopMs`, `channels.space|shareDepth`); the pure aliases removed
  (`DEFAULT_RENDER_WIDTH|HEIGHT`, `DEFAULT_LOOP_MS`, `DEFAULT_SHARE_DEPTH`,
  `HISTORY_LIMIT`) — consumers read `CONFIG.<section>.<key>`. Composed defaults
  (`DEFAULT_CHANNELS`, `DEFAULT_CONSTRAINTS`, `DEFAULT_LOOP_DURATION`) stay, as
  derivations. `artwork/types.ts` is a types+guards file again.
- **Where a type lives** (config session): a type imported by ≥2 modules sits in its
  module's `types.ts`; a local one stays colocated. Brands stay next to their factory
  (`Seed`, `Phase`); guards stay next to the invariant they protect (a `types.ts` may
  carry guards, never a config value). Applied: `core/color/types.ts`
  (`ColorSpaceId`, `ChannelModel`); `grammar/types.ts` (`Recipe`, `FamilyId`,
  `ShareChoice`, `GrammarSummary`, `SampleOptions`).
- Naming convention written. Two names aligned: `allowsAnchors` (was `anchor`),
  `SIZE_PROFILE_IDS` (was `PROFILE_IDS`).
- Verification: `vp check --fix` clean; `vp test` in `packages/randomart`
  328 passed / 10 skipped; no `GENERATOR_VERSION` bump; generator snapshots unchanged.
- All values are unchanged, so nothing replays differently.

## Invariants to keep (see the config note for the full table)

- Draw-affecting: `CONFIG.terminals` + `CONFIG.generator.paramDecimals` → a change bumps
  `GENERATOR_VERSION` and regenerates the generator snapshots.
- Sampler-affecting: `CONFIG.recipe` + `CONFIG.sampling` → the exploration moves,
  `generate(grammar, seed)` does not.
- Render-affecting: `CONFIG.color` → the shader output changes, no generator bump.
- `CONFIG.artwork` / `channels` / `app` → no PRNG impact.
- Guards stay out of `CONFIG` (`MAX_DEPTH`, `MAX_SOURCE_LENGTH`, `MIN/MAX_RENDER_SIZE`…).
- `packages/randomart/src/core/config/config.test.ts` pins every group: a failure is the
  reminder that a change has a consequence.

## Findings left (audited, not all addressed)

1. **Two default grammars.** `defaultGrammar` (calibrated weights) is used by tests and
   compiler fuzzing; the app starts from `PRESET_RECIPES[0]` = `STRUCTURE_RECIPE`.
   `recipeOf(defaultGrammar)` returns `null`. The name reads as "the app default" but it
   is a calibration fixture.
2. **Two sampler spaces.** The app and the bench explore the quantized recipes
   (`sampleRecipes`); the offline dataset still draws continuous grammars
   (`sampleGrammars` → `randomGrammar` → `drawConstraints`). Both are wired to
   `CONFIG.sampling`, but they do not cover the same space.
3. **Loop bounds.** `MIN/MAX_LOOP_MS` sit in `core/artwork/types.ts`: they are a UI
   slider range and a file-validation bound, not a safety guard. Knob or guard?
4. **Naming deviations** (see §2.1):
    - `LotView` carries numbers named `cells` / `grammars` / `failed` / `flats`; the
      convention wants `cellCount` / `grammarCount` / `failedCount` / `flatCount`
      (call sites: `lot.ts`, `BenchStage.tsx`, `BenchPanel.tsx`, `Planche.tsx`, `lot.test.ts`).
    - `serializeArtwork` / `parseArtwork` return/take text, while `serializeGrammar`
      returns data and `serializeGrammarFile` returns text. Same for notebook:
      `serializeNotebook` (text) vs `serializeNotebookData` (data), `parseNotebook` (text).
    - `validateChannels` (internal, `grammar.ts`) throws on the colour space **and** repairs
      `shareDepth`; it fits neither `assert` nor `fit`.
5. **Minor.** `DEFAULT_KEEP = ['x', 'y']` (`randomize.ts`) duplicates the anchors family
   (`FAMILY_OPERATORS.anchors` / `ANCHOR_LEVELS`), but lives at a lower layer.
6. **Colour.** The OKLab chroma is now `CONFIG.color.oklabChroma`; the HSL `100` and the
   full turn `360` are unit conversions and stay in `color/index.ts`. Gamut mapping
   (reduce chroma until in gamut) is the open colour lead.

## Next sessions (proposed order)

Adapt freely; the order is smallest-risk first.

### A. Naming cleanup batch (pure rename, no behaviour)

Apply §2.1 to the deviations in finding 4: `LotView` counts, the serialize/parse pairs
(decide the four-name set `serializeX` / `serializeXFile` / `deserializeX` / `parseXFile`),
and a name for `validateChannels` (or split content check from repair). Rename every layer
in one change; no aliases.

### B. `defaultGrammar` naming

Decide: rename to `calibrationGrammar` (touches ~20 test files) or document the distinction
at the definition. No behaviour change; `DEFAULT_CONSTRAINTS` already derives from the
`medium` profile.

### C. Loop bounds decision

Decide whether `MIN/MAX_LOOP_MS` are taste knobs (move to `CONFIG.artwork`) or guards
(stay, with a comment stating why). One line of reasoning, then act.

### D. Dataset sampler

Decide whether the offline dataset moves to `sampleRecipes` (same space as the bench) and
the continuous `sampleGrammars`/`randomGrammar` draw is retired, or whether the wider
continuous survey is kept and documented. This changes the dataset output, not the app.

### E. Colour gamut mapping

Replace the per-channel clamp in OKLCH/OKLab/HSL with a chroma-reducing gamut map. Changes
images, so it is a shader change, not a `GENERATOR_VERSION` bump. See the colour note §2.

## How to start

1. `cd packages/randomart && vp check --fix && vp test` to confirm the tree is green.
2. Read this file plus the linked doc for the chosen session.
3. Pick session A unless a decision above is already made.
