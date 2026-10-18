# PLAN

Entry point for resuming work. Updated at the end of each session. The code is the documentation;
this file only tracks state and next steps.

## Goal

Explore grammars by eye: draw batches of images, rate them, keep the good recipes.

## State

- Core, compiler, renderer, lab and history: done.
- Gallery (lot I): I0 cleanup, I1 batch rendering and planche, I2 notebook (rating, IndexedDB,
  JSON import/export) are done.
- Remaining: **I3 propose**, **I4 summarize**, **I5 recipes**.

## Next

### I3: propose (`src/core/notebook/propose.ts`)

- Elites: threshold or top-k of rated candidates.
- Mutation (`randomizeWeights`, `spread` = intensity), crossover (mix weights of two elites),
  restart (`randomGrammar`).
- Constraints inherited from parents, repaired by `fitConstraints`.
- "New generation" button in `GalleryPanel`.

### I4: summarize

In-app descriptors on rendered cells (`core/analysis`), report ratings ↔ descriptors ↔ operators.
Read-only: a report, never a judge.

### I5: recipes

Promote a rated candidate to a `GrammarPreset`, persisted in the notebook and offered in the lab's
preset select.

## Open frictions

- Browser range and fuzz tests are not automated; `scripts/validate-glsl.sh` covers syntax only.
- Sub-expression preview ignores ancestor warps.
- Render size equals canvas size; the batch readback goes through canvas capture, not `readPixels`.
- At phase 0 `tsin` = 0 and `tcos` = 1, which dilutes `x` and `y` slightly.
- Reactivating an operator resets its weight to 1.
- The last active terminal is locked (derived predicate, no state).
- A `.gitignore` pattern aimed at the package root must be anchored (`/dataset/`).
- The planche is one offscreen surface plus one display canvas: WebGL context limits forbid one
  canvas per cell.
- Ratings are manual: descriptors only filter flat cells and explain, never score beauty.

## End of session

1. `vp check --fix` and `vp test` green.
2. Update State and Next.
3. Commit.
