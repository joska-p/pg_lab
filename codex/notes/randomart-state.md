# Randomart — State (single entry point)

## Goal

Find good grammar recipes by eye: judge one grammar at a time over many seeds, keep the good ones as
presets. Around that goal, keep the package coherent: one place for curated values (`CONFIG`), one
vocabulary for names (conventions §2.1), one direction for dependencies (§2.4), no dead code and no
duplication.

## How to run

```bash
cd packages/randomart && vp check --fix && vp test    # green gate before and after a change
vp run audit                                          # from the root: vocabulary, knip, jscpd (madge warns)
```

Behaviour stays byte-identical unless a session decides otherwise, and then the PRNG consequence
(`GENERATOR_VERSION`) is named.

## Where things live

| Topic                                               | Document                                                           |
| --------------------------------------------------- | ------------------------------------------------------------------ |
| Naming / layers / type placement rules              | `codex/docs/conventions/02-typescript.md` §2.1, §2.6               |
| Audit tooling and what each gate covers             | `tools/lint/audit.mjs`, `tools/lint/banned-words.mjs`, `knip.json` |
| Audit history (A/B batches, per-commit detail)      | `randomart-audit-registry.md`                                      |
| Post-gate-repair follow-up and triage log           | `randomart-audit-followup.md`                                      |
| Config values vs hard guards, PRNG impact           | `randomart-config-knobs.md`                                        |
| Loose ends noticed, not yet scheduled               | `findings.md`                                                      |
| Colour pipeline (session note, dated)               | `randomart-colour-pipeline.md`                                     |
| Time in the `x`/`y` terminals (session note, dated) | `randomart-time-in-xy.md`                                          |

## State

- Core, compiler, renderer, lab, bench and history: done. Notebook (rated batches, IndexedDB, JSON
  import/export) works, format v1.
- **One quantized space** (`core/grammar/quantized.ts`): a `Recipe` = one weight level per operator
  (the `CONFIG.recipe.levels` grid, index = weight: 0…4) + size profile + `share` + colour space. The
  grammar is always derived (`recipeToGrammar`); `recipeOf` is its exact inverse. `repairRecipe`
  keeps the invariants (one live anchor, one active terminal). `stepRecipe` is the grid walk (±1
  notch). `x`/`y` carry the time through their oscillator params (`amp`/`phase`/`cycles`).
- **One default grammar.** `defaultGrammar` is the `structure` recipe (`DEFAULT_RECIPE`, the
  2026-10-17 calibration snapped on the grid) compiled down — the app's start point and a preset
  like any other, no separate test/measurement fixture.
- **Bench** draws lots with `sampleRecipes`; focus view shows one grammar over its seeds, `planche`
  is the grid overview. Rating is still the 0-5 note (to be replaced, see T1).
- **Dataset pipeline** (`scripts/dataset`) surveys the same quantized space: `sampleGrammars` is now
  `sampleRecipes` + seed derivation (the default `RAW_CHANNELS` reads as "share 0, sRGB").
- **Audit closed, gates repaired.** Layers, extensions, vocabulary, dead code (including the
  `knip --production` pass) and duplication all pass; cycles stay an informational warning
  (decision B-04). Lot A (naming) is done.

## Next

### T1 — tags and keep (replaces the 0-5 rating)

- Manual binary tags on the grammar, judged over all its seeds: readable, harmonious, varied, too
  flat, too chaotic, dirty colours. Plus a `kept` boolean, the only decision that matters.
- Auto tags precomputed from `describeImage` (flat, saturated, symmetric, colourfulness...):
  displayed, never ticked by hand.
- Notebook format v2: `rating` becomes `tags` + `kept`, store the `Recipe`, migrate v1 files on read.
- One keyboard key per tag, one for keep.

### T2 — keep creates a preset

A kept recipe is promoted to a preset, persisted in the notebook, offered in the Lab select next to
the built-ins.

### T3 — neighbours ("More like this")

One-notch mutation of a kept recipe (a level ±1, size, share, space), deduplicated with
`recipeKey`. New lot made of the recipe and its neighbours.

### T4 — tags vs recipe statistics

Compare means and use `correlation` (0/1 target) between tags and levels/share/space. Needs roughly
50-100 judged grammars to mean anything. Read-only report. PCA stays optional.

### T5 — options

- Diversified draw: sample ~40, drop flat ones, keep the 8 farthest apart in descriptor space.
- Controlled view: same recipe, one row per `share` (distributions are comparable, images are not).

### C batch — `appStore` SSOT, errors and lifecycle

- `appStore` stores `grammar`, `recipe` and `HistoryEntry.grammar` while the grammar should be
  derived from the recipe; `commit` / `publishArtwork` / `restoreImportedEntry` repeat the same block.
- `downloadBlob` is duplicated with two behaviours (deferred revoke in `appStore`, immediate in
  `benchStore`); the active-batch lookup exists as `resolveActiveBatch` / `useBenchActiveBatch` /
  `removeActiveBatch`.
- Errors and async: `createSeed(Number(value))` throws in a handler; `setBenchCount` / `setBenchSeeds`
  do not bound their input; `importNotebookFile` awaits `file.text()` outside the `try`;
  `void saveNotebookToDb(...)` leaves rejections unhandled; `openDatabase()` never closes its
  connection; `initBenchNotebook` may overwrite a newer lot; `setCanvas` / `setClockStore` are never
  reset on unmount.

## Open decisions

1. **Loop bounds.** `MIN/MAX_LOOP_MS` (`core/artwork/types.ts`) are a UI slider range and a
   file-validation bound, not a safety guard. Knob or guard?
2. **Colour gamut mapping.** Replace the per-channel clamp in OKLCH/OKLab/HSL with a chroma-reducing
   gamut map. Changes images, so it is a shader change, not a `GENERATOR_VERSION` bump. See
   `randomart-colour-pipeline.md` §2.

## Open frictions

- `openCellInLab` and imported artworks recover knobs through `recipeOf`; an artwork outside the
  space displays correctly but the knobs keep the previous recipe. The recipe grid is now the
  grammar's own grid, so this only remains for hand-edited/continuous-weight imports.
- Browser range and fuzz tests are not automated; `scripts/validate-glsl.sh` covers syntax only.
- Sub-expression preview ignores ancestor warps.
- Render size equals canvas size; the batch readback goes through canvas capture, not `readPixels`.
- A `.gitignore` pattern aimed at the package root must be anchored (`/dataset/`).
- The planche is one offscreen surface plus one display canvas (WebGL context limits forbid one
  canvas per cell).
- Ratings/tags are manual: descriptors only filter flat cells and explain, never score beauty.
- The playground mounts only `@repo/randomart/Scene`; the bench stage never appears there.
- `NotebookCandidate.note` exists in core but no UI uses it yet.

## End of session

1. `vp check --fix` and `vp test` green; `vp run audit` green.
2. Update State and Next here.
3. Commit one change per category.
