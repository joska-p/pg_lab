# Randomart — Quantization, Params, and the Shader Clamp

**Date:** 2026-10-23
**Scope:** `packages/randomart` (current) and `~/Work/dev/randomart` (temporary copy of the old app)
**Status:** analysis only — no code changes
**Purpose:** hand off the quantization discussion to a fresh session, including the user's
decisions and the open questions.

---

## 0. TL;DR

- The grammar quantization (integer weights `0..4`, `size`, `shareDepth`, `space`) is **sound and
  done at the source** (`rng.int`). It is not the "jonglage". `createGrammar` validates integers; it
  does not quantize them.
- Two real late quantizations remain:
    1. node params are drawn continuously, then rounded to `paramDecimals = 3` (`drawParams`);
    2. `cycles` is drawn as a share in `[0, 1]`, then rounded to whole cycles **inside the GLSL
       emitter** — currently a 25 % / 50 % / 25 % law for 1/2/3 cycles.
- The quality gain of the current app is mostly **not** quantization. It comes from the curated
  catalog, the node budget + balanced children, the shared trunk (`shareDepth`), OKLCH, and the
  calibrated default preset. Quantization is what makes a grammar a finite, hashable, editable
  object — hence presets, history, dedupe, bench, dataset.
- The current uniform weight draw (`rng.int(0..4)` per operator) is **flatter than the previous
  tuned prior** (`odds = [3, 3, 2, 1, 2]`) and it no longer guarantees a spatial anchor.
  Measured: **3.98 % of generated expressions contain no `x`/`y` at all** → guaranteed flat image.
- **"Expression without terminals" is impossible**; "expression without `x`/`y`" is possible and is
  the actual flat case. Increasing terminal weight with depth does not fix it by itself.
- Shader `clamp` on the color path is **display/gamut clipping**, not a quantization bug. Do **not**
  replace it with `mod`; wrap where periodicity is meaningful (hue, coordinates) or add an
  experimental fold color mode.
- User decisions: do not refactor the grammar model; do not optimize grammars now (bench/dataset
  will change); do not spend much on flat draws; revisit the initial screen later; `shareDepth` is
  fine.

---

## 1. What was investigated

Current code:

- `core/grammar/quantized.ts` — `drawGrammar`, `grammarKey`, seed derivation
- `core/grammar/grammar.ts` — `createGrammar`, validation, repair, `minSize`
- `core/grammar/types.ts` — `Grammar`, `ChannelModel`, `GrammarPins`
- `core/generator/generator.ts` — `generate`, `drawOperator`, `drawParams`, budget
- `core/catalog/operators/terminals.ts` — `x`/`y` time parameters, `cycles` rounding
- `core/random/rng.ts` — `int`, `weighted`
- `core/config/config.ts` — `maxWeight`, `paramDecimals`, size profiles, sampling
- `core/color/registry.ts` — color space shaders and clamps
- `core/catalog/constants.ts` — `ra_fold2`
- `core/compiler/compile.ts` — final color path

Old copy (`~/Work/dev/randomart`, Oct 9–10, before the quantized refactor):

- `src/core/tree.ts` — fixed weights `1.0` / `0.5`, structural probability, `toFixed(4)`
- `src/core/grammar/rules/rule-definitions.ts` — fixed operator sets per rule
- `src/core/grammar/operators/registry.ts` — 24 operators
- `src/core/prng.ts` — `createDualRng` / `createCorrelatedRng`

---

## 2. The quantization map (current)

```
drawGrammar     rng.int(0..4) per operator             ← quantized at the source
    ↓
Grammar         weights:int, size, shareDepth, space   ← finite, hashable object
    ↓
generate        weight > 0 → rng.weighted              ← relative weights → probability
    ↓
Expression      params: continuous draw → round(3 dp)
    ↓
GLSL            cycles: share → whole cycles at emission
```

| Layer                             | Where                | When               | Verdict                   |
| --------------------------------- | -------------------- | ------------------ | ------------------------- |
| Operator weights                  | `quantized.ts:63`    | draw, `rng.int`    | ✅ quantized at source    |
| `size`, `shareDepth`, `space`     | `quantized.ts:68-71` | draw, `rng.int`    | ✅ quantized at source    |
| Params (`amp`, `phase`, `const`…) | `generator.ts:69-82` | continuous → round | ⚠️ late rounding          |
| `cycles`                          | `terminals.ts:29-31` | GLSL emission      | ❌ very late quantization |
| Pixels                            | GPU 8-bit            | render             | not a design knob         |

The integer → float conversion in `rng.weighted` (`rng.ts:32-70`) is **not** a re-quantization. It
is the categorical draw: weights are relative frequencies, and the sampler normalizes them once per
node. That is the only legitimate "jonglage".

`createGrammar` (`grammar.ts:107-196`) refuses non-integer weights (`assertIntegerInRange`,
lines 147-153). Its only repair is `shareDepth` (lines 169-175), because that is an editing
quantity (slider/import), not grammar content.

---

## 3. Corrections to the mental model

### 3.1 `ParamRange` is not "a number", and `paramDecimals` is not "n values"

There are three distinct things:

- `ParamRange` (`config/types.ts:1-4`) is `{ min, max }` — the **domain interval** of one parameter.
- A node **param value** is one number inside that interval (e.g. `phase = -0.315`).
- `CONFIG.generator.paramDecimals = 3` (`config.ts:83-85`) is the **number of decimal places**, not
  a count of values. With 3, a `const` in `[-1, 1]` has 2001 possible values; `amp` in `[0, 0.7]`
  has 701; `phase` in `[-1, 1]` has 2001.

A desired domain `0, 1, 2, … n` is a **discrete domain**, which does not exist in the type today.
It could be modeled as `{ values: readonly number[] }` or `{ min, max, step }`. That is a new axis
kind, not a tweak to `paramDecimals`.

Current param draw (`generator.ts:72-78`):

```ts
const u = rng.next();
const raw = param.min + u * (param.max - param.min);
const rounded = Math.round(raw * PARAM_SCALE) / PARAM_SCALE;
const clamped = Math.min(param.max, Math.max(param.min, rounded));
```

This is "draw continuous, then quantize". It is statistically almost harmless, but conceptually
backwards. Drawing an index from a discrete domain would be cleaner and would remove `PARAM_SCALE`,
the clamp-after-round, and the endpoint edge case.

### 3.2 "No terminals" is impossible; "no `x`/`y`" is the real case

- `createGrammar` requires at least one terminal (`grammar.ts:157-161`).
- `ensureUsableVocabulary` (`quantized.ts:49-53`) forces the first terminal to weight 1 when all
  terminals are off. Catalog order is `x, y, const`, so the repaired terminal is `x`.
- Every finite expression tree has leaves, and leaves are terminals. So **no expression can be
  terminal-free**.

What _is_ possible is an expression with **no spatial anchor**:

- terminals are `x`, `y`, and `const`; only `x`/`y` depend on `p` and `u_phase`;
- an expression whose only terminal is `const` is constant in space and time → flat image;
- an expression can also have `x`/`y` active in the grammar but never selected by the generator.

Ad-hoc probe, 20 000 draws on the current code:

- 17 operators, 3 terminals (`x`, `y`, `const`);
- mean vocabulary: **13.60** operators active;
- weight distribution: **20 %** for each of 0, 1, 2, 3, 4;
- **3.23 %** of drawn grammars have `x = 0` and `y = 0`; after repair ~**2.4 %** keep only `const`;
- **3.98 %** of generated expressions contain **no `x`/`y` at all** → flat by construction.

The old intermediate quantized design had `allowsAnchors` and `minActiveOperators` to prevent this.
They were dropped in `e86e5fe`. The current `ensureUsableVocabulary` only guarantees "a terminal",
not "an anchor".

### 3.3 `cycles`

Yes, it is the same family of issue as params — but worse, because the quantization happens at the
very end:

- `CONFIG.terminals.cycles` is `[0, 1]` (`config.ts:80`);
- `CONFIG.terminals.cycleCounts` is `[1, 3]` (`config.ts:81`);
- `params.cycles` is drawn as a share, rounded to 3 decimals like any param;
- `terminals.ts:29-31` computes `cycleMin + Math.round((cycleMax - cycleMin) * params.cycles)`.

The thresholds are `0.25` and `0.75`, so the law is **25 % → 1 cycle, 50 % → 2, 25 % → 3**, not a
uniform third each. If the intent is "1, 2 or 3 cycles", draw `rng.int(3)` (or `rng.int(cycleMax -
cycleMin + 1) + cycleMin`). If the share is kept on purpose (to retune the `cycleCounts` range
without changing the param domain), document the triangular law.

The share design is probably a vibecoded shortcut: it keeps every param in `[0, 1]` for the UI while
the semantic value is categorical.

### 3.4 What is quantized at the source vs late

- **At the source:** grammar weights, `size`, `shareDepth`, `space`.
- **Late:** all node params (rounding at draw), and `cycles` (rounding at emission).
- **Not quantization:** the `Grammar → probability` normalization in `rng.weighted`.

The old app did even later quantization: `toFixed(4)` when writing GLSL (`tree.ts:123,158`). The
current code rounds at the draw and prints the exact value (`formatNumber`, `formatGlslFloat`),
which is the right direction.

---

## 4. Why the current version looks better

Quantization enables exploration; it does not make pixels prettier by itself. The visual gain is
mostly structural:

1. **Curated catalog:** 17 well-behaved operators instead of 24; `x`/`y` carry time oscillators
   (amp/phase/cycles) instead of being plain coordinates.
2. **Budgeted, balanced trees:** `minSize` + `buildChildren` (`generator.ts:84-123`) guarantee a
   feasible tree and fill the node budget. Old code used only a structural probability decreasing
   with depth (`tree.ts:112-114`): deep, irregular, sometimes huge trees.
3. **Shared trunk:** `shareDepth` shares operator + params across RGB, then channels diverge. Old
   code had a fixed 3-level structure split or a global "correlated" stream flag
   (`tree.ts:193-234`), with no explicit trunk depth.
4. **OKLCH by default** instead of raw sRGB.
5. **Calibrated preset:** `x/y = 4`, `min/max = 2`, everything else `1` (`grammar/registry.ts:6-33`).

Quantization contributes sparsity and relative emphasis, and makes each image have a different
_character_ rather than just a different seed. That is the real perceptual leap.

---

## 5. User decisions (next session constraints)

1. **Do not refactor the grammar quantization model.** It is correct.
2. **Do not start optimizing grammars.** The bench/dataset pipeline will change; its shape is not
   decided yet.
3. **Do not invest much in flat draws for now.** The user is open to one idea: increase terminal
   weight with depth. Clarify the ambiguity first (see §7).
4. **Initial screen:** later. Note for the record: the app starts on `drawRandomGrammar`
   (`labStore.ts:52-54`), not on the calibrated preset.
5. **`shareDepth` is fine.** Leave it alone.
6. **Language:** French for discussion, English for code/docs/specs.

---

## 6. Shader clamp vs modulo

### Sites

- `ra_srgb`: `clamp(raw * 0.5 + 0.5, 0.0, 1.0)` — `color/registry.ts:10`
- `ra_oklabToSrgb`: `clamp(mix(hi, lo, ...), 0.0, 1.0)` — lines 31 and 58 (gamut/display clip)
- `ra_oklch`: `L = clamp(raw.x * 0.5 + 0.5, 0.0, 1.0)` — line 34; `C = abs(raw.y) * 0.4`;
  `h = (raw.z * 0.5 + 0.5) * 2π` — line 36
- `ra_hsl`: `clamp(abs(mod(...)) - 1.0, 0.0, 1.0)` for RGB, and `l = clamp(raw.z * 0.5 + 0.5)`
  — lines 73, 79
- `ra_fold2`: `abs(mod(v + 3.0, 4.0) - 2.0) - 1.0` — `catalog/constants.ts:8`, used by `warp`

### Analysis

- The current expression is bounded in `[-1, 1]` by construction: every operator maps bounded
  inputs to bounded outputs (`mul` of two `[-1,1]` values, `div` by `1 + abs(b)`, `add` averages,
  `sin`/`cos`, `min`/`max`, `select`, `warp` folds coordinates). The final color clamp is therefore
  a **safety net for float edge cases**, not an active shaper.
- The clamps in `ra_oklabToSrgb` are **gamut clipping**: out-of-gamut OKLab colors must be mapped
  to displayable sRGB. Replacing them with `mod` would wrap each RGB channel independently, causing
  hue inversions and hard seams; that is not a valid gamut mapping.
- The `L` clamps are lightness bounds. Wrapping `L` would make black and white adjacent —
  semantically wrong.
- Hue is the one place where periodicity is meaningful, and it is already periodic: `cos/sin` in
  OKLCH, `mod` in HSL. Coordinates are also already folded with `ra_fold2` (a triangle fold, not a
  raw `mod`).
- A raw `mod` on `raw * 0.5 + 0.5` before conversion would create a discontinuity at the wrap point
  (`0` and `1` are black and white in sRGB). If a cyclic look is wanted, a **triangle fold**
  (`abs(mod(...))`, continuous) or a dedicated wrap color space is the safer experiment.

### Recommendation

Keep the final clamps. If the user wants to explore cycling:

1. Add an experimental **fold color mode** (or a per-channel fold before conversion), not a
   replacement of the display clamp.
2. Compare bench sheets; this is render-affecting, not draw-affecting, so no `GENERATOR_VERSION`
   bump — but it breaks dataset comparability with existing images.
3. Do not `mod` the final RGB.

Related code comment already frames it: `compile.ts:54` — "Single color path: triplet through
space conversion (clamp = boundary assurance)."

---

## 7. Open questions for the next session

1. **Terminal bias with depth — which layer?**
    - _Grammar draw:_ bias `x/y/const` weights up in `drawGrammar` (sampler-affecting).
    - _Generator:_ multiply terminal weights by a depth factor in `drawOperator` (draw-affecting;
      `GENERATOR_VERSION` bump + snapshots).
    - Clarify first. Neither fixes "no `x`/`y`" if the grammar has no spatial anchor active.
2. **Anchor guarantee:** do we add one now? The minimal fix is in `ensureUsableVocabulary`: if both
   `x` and `y` are 0, raise one of them to `maxWeight` (not 1). Add a test asserting every generated
   expression contains at least one `x`/`y`. This kills ~4 % flats deterministically.
3. **Cycles:** discrete `[1, 2, 3]` domain, or keep the share and document 25/50/25? If changed,
   bump `GENERATOR_VERSION` and regenerate snapshots.
4. **Params:** introduce a discrete domain (`values` or `step`) now, or defer until the bench/
   dataset redesign? Deferring is consistent with "do not optimize grammars now".
5. **Clamp:** keep as-is unless a visual experiment is explicitly requested.
6. **Dead code:** `CONFIG.sampling.changeRate` is unused and still mentions `stepGrammar` (removed
   in `ab5a4e7`). Remove it, or reintroduce local exploration around a preset.

---

## 8. Suggested next steps (if the session resumes)

Ordered by cost/value, respecting the "no grammar optimization now" constraint:

1. **Write the anchor test + fix** (small, deterministic, no pipeline change).
    - `ensureUsableVocabulary` guarantees at least one of `x`/`y`.
    - Test in `quantized.test.ts` or `generator.test.ts`.
    - Acceptance: 20k draws produce zero expressions without `x`/`y`; existing snapshots unchanged
      (the repair only fires when both anchors are already off, which is not the default preset).
2. **Decide the terminal-bias question** (§7.1) and record the decision, even if not implemented.
3. **Decide `cycles`**; if changed, make it a single atomic change with `GENERATOR_VERSION` and
   snapshot regeneration.
4. **Remove `changeRate`** if no walk is planned.
5. **Only after the bench/dataset redesign:** revisit the weight prior (`odds` vs uniform), local
   exploration around the preset, and a discrete param domain.

Do **not** start with the weight prior or param domains: both depend on the new bench/dataset shape
the user has not decided yet.

---

## 9. Repro / verification

- Tests: `pnpm --filter @repo/randomart test` or `vp -C packages/randomart test`.
- Check: `vp -C packages/randomart check`.
- Generator snapshots: `core/generator/__snapshots__/generator.test.ts.snap`; any draw-affecting
  change requires `GENERATOR_VERSION` + snapshot regeneration.
- The 20k-draw probe was ad-hoc (temporary script in `/tmp/opencode/ra-probe.ts`, not committed).
  It used `drawGrammar(createRng(createSeed(i + 1)))` and checked the generated expression for
  `x`/`y` nodes.

Key numbers to reproduce:

| Metric                                | Value                 |
| ------------------------------------- | --------------------- |
| Operators                             | 17                    |
| Terminals                             | 3 (`x`, `y`, `const`) |
| Mean active vocabulary                | 13.60                 |
| Weight shares                         | 0.200 each for 0..4   |
| Draws with `x = y = 0`                | 3.23 %                |
| Generated expressions without `x`/`y` | 3.98 %                |

---

## 10. References

- `packages/randomart/src/core/grammar/quantized.ts:59-74` — `drawGrammar`, uniform weight draw
- `packages/randomart/src/core/grammar/quantized.ts:49-53` — `ensureUsableVocabulary`
- `packages/randomart/src/core/grammar/grammar.ts:107-196` — `createGrammar`, validation, repair
- `packages/randomart/src/core/generator/generator.ts:38-82` — operator/param draws
- `packages/randomart/src/core/generator/generator.ts:84-123` — budget distribution
- `packages/randomart/src/core/catalog/operators/terminals.ts:1-36` — time parameters, `cycles`
- `packages/randomart/src/core/config/config.ts:76-113` — current values (`maxWeight = 4`,
  `paramDecimals = 3`, size profiles, `changeRate` dead)
- `packages/randomart/src/core/color/registry.ts:4-83` — color spaces and clamps
- `packages/randomart/src/core/catalog/constants.ts:6-9` — `ra_fold2`
- `packages/randomart/src/core/compiler/compile.ts:48-58` — final color path
- Old copy: `~/Work/dev/randomart/src/core/tree.ts`, `src/core/prng.ts`,
  `src/core/grammar/rules/rule-definitions.ts`
- Previous tuned prior (before `e86e5fe`): `odds = [3, 3, 2, 1, 2]`, `allowsAnchors`,
  `minActiveOperators = 2` — recoverable with
  `git show e86e5fe^:packages/randomart/src/core/config/config.ts`
