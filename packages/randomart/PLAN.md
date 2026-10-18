# PLAN

Entry point for resuming work. Updated at the end of each session. The code is the documentation;
this file only tracks state and next steps.

## Goal

Find good grammar recipes by eye: judge one grammar at a time over many seeds, keep the good ones
as presets.

## State

- Core, compiler, renderer, lab and history: done.
- **One quantized space** (`core/grammar/quantized.ts`): a `Recipe` = 6 family levels
  (off/low/normal/high) + size profile + `shareDepth` (0-3 or mono) + colour space. The grammar is
  always derived (`recipeToGrammar`); `recipeOf` is its exact inverse. Time operators are never
  drawn (phase 0), anchors x/y are always on.
- **Lab** edits a recipe: presets are named recipes (`core/grammar/presets.ts`), the select reads
  "Custom" as soon as a knob moves away from every preset, "New grammar" draws a random recipe.
  Free weights, free constraints and the vocabulary panel are gone.
- **Bench** draws lots with `sampleRecipes` and shows them in focus view: one grammar, 36 seeds,
  grid filling the stage (`fitGrid`), 12 grammars x 36 seeds at 128 px by default. `sheet` is the
  secondary overview. Rating is still the 0-5 note (to be replaced).
- Notebook (rated batches, IndexedDB, JSON import/export) works, format v1, stores `Grammar`.
- Dataset pipeline (`scripts/dataset`) still works but is out of sync (see frictions).
- Naming: interactive half = **bench**, offline half = **dataset**.

## Next

### T1: tags and keep (replaces the 0-5 rating)

- Manual binary tags on the grammar, judged over all its seeds: readable, harmonious, varied,
  too flat, too chaotic, dirty colours. Plus a `kept` boolean, the only decision that matters.
- Auto tags precomputed from `describeImage` (flat, saturated, symmetric, colourfulness...):
  displayed, never ticked by hand.
- Notebook format v2: `rating` becomes `tags` + `kept`, store the `Recipe` (or recover it with
  `recipeOf`), migrate v1 files on read.
- One keyboard key per tag, one for keep.

### T2: keep creates a preset (I5)

- A kept recipe is promoted to a preset, persisted in the notebook, offered in the Lab select
  next to the built-ins.

### T3: neighbours (I3 propose)

- "More like this": one-notch mutation of a kept recipe (a level +-1, size, shareDepth, space),
  deduplicated with `recipeKey`. New lot made of the recipe and its neighbours.

### T4: tags vs recipe statistics (I4 summarize)

- Compare means and use `correlation` (0/1 target) between tags and levels/shareDepth/space.
  Needs roughly 50-100 judged grammars to mean anything. Read-only report.
- PCA stays optional: a 2D map of judged grammars coloured by "kept".

### T5: options

- Diversified draw: sample ~40, drop flat ones, keep the 8 farthest apart in descriptor space.
- Controlled view: same recipe, one row per `shareDepth` (distributions are comparable, images
  are not: `shareDepth` changes RNG consumption order).

## Open frictions

- The dataset/PCA pipeline still uses `sampleGrammars` (continuous weights, `RAW_CHANNELS`), so it
  no longer looks at the same distribution as the bench. Move it to `sampleRecipes` or remove it.
- `openCellInLab` and imported artworks recover knobs through `recipeOf`; an artwork outside the
  space displays correctly but the knobs keep the previous recipe.
- `defaultGrammar` stays in core (tests, measurement probes) but the app now starts on the
  `Structure` preset, whose quantized weights give different images for the same seed.
- Browser range and fuzz tests are not automated; `scripts/validate-glsl.sh` covers syntax only.
- Sub-expression preview ignores ancestor warps.
- Render size equals canvas size; the batch readback goes through canvas capture, not `readPixels`.
- At phase 0 `tsin` = 0 and `tcos` = 1, which dilutes `x` and `y` slightly.
- A `.gitignore` pattern aimed at the package root must be anchored (`/dataset/`).
- The planche is one offscreen surface plus one display canvas: WebGL context limits forbid one
  canvas per cell.
- Ratings/tags are manual: descriptors only filter flat cells and explain, never score beauty.
- The playground mounts only `@repo/randomart/Scene`; the bench stage never appears there.
- `NotebookCandidate.note` exists in core but no UI uses it yet.

## End of session

1. `vp check --fix` and `vp test` green.
2. Update State and Next.
3. Commit.
