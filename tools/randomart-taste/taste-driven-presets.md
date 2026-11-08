# Taste-driven grammar presets

Status: idea / design note. Nothing is implemented yet.

## Problem

The presets in `GRAMMAR_PRESETS` (`randomart-core/src/grammar.ts`) are hand-written and somewhat
arbitrary. A grammar is just a list of operator weights plus depth/node bounds and a color space,
so its visual effect is opaque: nobody can say in advance what a given set of weights will look
like.

## Goal

Let the user say **which visual qualities they want** ("sharp and contrasted", "soft and organic",
"colorful") and get back a grammar that is **more likely to produce them**.

Important: this only shifts probabilities. A grammar never guarantees a look. It biases the draw.
Generation stays deterministic for a given `(grammar, seed)`.

## Core idea

The app is a data factory. It can generate thousands of `(expression, image)` pairs with no human
involved. From that data we learn the relation between operators and visual features, then invert
it.

```
random grammar + seed ──▶ expression ──▶ shader ──▶ image
                              │                       │
                    operator features          visual features
                              └────────── learn ──────┘
                                           │
                       invert: wanted visual features ──▶ operator weights
```

## Pipeline

1. **Sample.** Draw N grammars (`drawGrammar`) and several seeds each. N in the order of
   thousands.
2. **Describe the expression.** A pure `featuresOf(expression, grammar)` in `randomart-core`:
   operator counts (on the lowered DAG, so the shared trunk is not triple counted), realized
   depth, node count, warp count, realized share depth, `isMono`, `animated`, color space,
   parameter stats (`amp`, `cycles`).
3. **Describe the image.** Render small (128 px is enough; `renderToBlob` already works
   offscreen; for animated shaders use 2 or 3 phases). Compute measured statistics on the pixels
   (see "Decisions" below). CLIP tags are an optional later addition for fuzzier words.
4. **Learn the relation.** Regress each visual feature on the expression features. The
   coefficients say which operators raise or lower the probability of a feature.
5. **Invert.** Given a target (a vector of wanted features), find weights that maximize the
   expected feature score. Two options:
    - read it from the regression (fast, interpretable, coefficients ≈ log-weights), or
    - direct search: `score(grammar) = mean target score over ~64 seeds`, optimized with CEM or
      CMA-ES (slower, more faithful).
6. **Emit.** Round to integer weights in `[0, MAX_WEIGHT]`, derive depth/nodes/space, run through
   `createGrammar` (keep at least one terminal and one non-terminal, handle
   `InfeasibleGrammarError`), and print a `preset(...)` block to paste into `GRAMMAR_PRESETS`.
   The last step stays human and reviewable, since presets are versioned code.

A neural network is used as a **critic/feature extractor**, not trained from scratch. Reusing a
pre-trained model is the right size for this problem.

## Two modes

### Declared taste (v1, start here)

The user picks the features directly (sliders or tags: sharp, organic, colorful, contrasted...).
The system returns a grammar. No likes needed, no personal data, easy to test. It depends only on
steps 1 to 6 above.

### Learned taste (later)

The user likes artworks during a session; the app exports a session JSON. The liked images define
the target instead of sliders.

Design notes to keep the door open:

- Log **every displayed artwork**, with `liked: boolean`, not only the likes. Seen-but-not-liked
  is the negative signal, and the base rate for computing lift.
- Store `serialize(expression)` and `GENERATOR_VERSION` along with `(grammar, seed)`:
  `(grammar, seed)` alone can change meaning when the generator changes.
- Likes are heterogeneous (geometric and organic mixed). Averaging gives a bland preset, so
  cluster likes in embedding space and produce one preset per cluster, or tag at like time.
- Possible later loop: like, fit preset, draw from it, like again (interactive evolution).

## Limits

- Probabilistic, not a guarantee.
- Effects combine: `warp` changes the meaning of everything below it, so independent per-operator
  weights capture a global "tone", not structure.
- CLIP judges still images with semantic biases; animation needs several phases.
- Statistical noise: treat the output as a suggestion to retouch by hand.

## Where things live

| Piece                                   | Location                                          |
| --------------------------------------- | ------------------------------------------------- |
| `featuresOf`, fit/invert, preset output | `randomart-core` (pure TS)                        |
| Session export, optional live tags      | `randomart-ui`                                    |
| Batch: sample, render, image statistics | Playwright script driving a page (TypeScript)     |
| Batch: regression, search, preset block | Python script run with `uv` (inline dependencies) |

## Decisions

### Visual features: measured statistics first

Numbers computed on the rendered pixels. Deterministic, no model download, and checkable by eye.

| Axis      | Measure                         | Meaning                          |
| --------- | ------------------------------- | -------------------------------- |
| contrasty | standard deviation of luminance | strong light/dark differences    |
| bright    | mean luminance                  | light or dark image              |
| sharp     | edge density (Sobel)            | hard edges rather than gradients |
| busy      | high-frequency energy           | lots of detail or grain          |
| colorful  | mean saturation                 | vivid colors                     |
| animated  | difference between phases       | how much it moves                |

CLIP tags (semantic words such as "psychedelic", "calm") are deferred: more expressive, but heavy,
biased in opaque ways and harder to verify. If added, they live on the Python side over exported
PNGs and change nothing else in the pipeline.

### Batch environment: Playwright + uv

- **Playwright** launches Chromium, loads a page that draws grammars, compiles shaders with
  `randomart-core`, renders with the existing renderer at 128 px, computes the statistics in JS and
  returns a JSON. Nothing is duplicated. Headless Chromium renders in software, which is enough
  at this size.
- **uv** runs a Python script (numpy, scikit-learn, optionally `cma`) with dependencies declared in
  the file header. It reads the JSON, fits the regression, optionally runs the direct search, and
  prints the `preset(...)` block.

### Vocabulary: the six axes above

The vocabulary is expected to be corrected by the data. After the first batch, look at how the
statistics are distributed over thousands of images: some axes may barely vary, and some
combinations may be unreachable (for example, no grammar produces images that are both very sharp
and very colorful). Adjust the axes accordingly.

## Suggested order

1. `featuresOf` with tests.
2. Playwright batch: sampling, rendering, measured statistics, JSON output.
3. Python script with uv: regression and a first declared-taste preset. Review the feature
   distributions and adjust the axes.
4. Direct search (CEM) if the regression is disappointing.
5. Session export with seen/liked, then learned taste. CLIP tags if the six axes feel too crude.

## Open questions

- Exact UI for declared taste: sliders per axis, or a few named moods mapped to axis vectors?
- Resolution and phase count for animated shaders (128 px, 2 to 3 phases is the starting guess).
- Whether the direct search (CEM) is worth adding once the regression exists.
