# Randomart — Time in the x/y terminals (session notes, 2026-10-19)

Status of the animation system after commit `ec5194d`
("feat(randomart): time lives in the x/y terminals again"), which replaced the
coordinate motion system (commits `52f4539` + `7c660fe`).

## The pipeline, in one line

```
x, y ∈ [-1, 1] → the tree ("moulinette") → r, g, b ∈ [-1, 1] → colour conversion → screen
```

Each pixel has a coordinate `v_p` in `[-1, 1]²` (`v_p = vUv * 2.0 - 1.0`). The
expression (an operator tree) is evaluated once per channel and yields a value
in `[-1, 1]` — not 0..255. The colour space (`oklch`, `srgb`, …) maps the
`(r, g, b)` triplet to `[0, 1]`, which is the range GLSL encodes as 8 bits on
screen.

## The seed is the only source of randomness

`generate()` consumes the PRNG stream in a strict order: one draw for a node's
operator, then one draw per parameter of that operator, then its children
left to right — for channels r, g, b in that order.

So the literal values seen in an expression, e.g. `x(0.337, 0.961, 0.387)`,
**are** the draws of the seed. Same seed + same grammar + same
`GENERATOR_VERSION` = same numbers = same image and same animation.

`GENERATOR_VERSION` is at **4** (bumped when x/y started consuming 3 draws
each). Any change to the draw order or rounding must bump it: a seed is only
meaningful with one version.

## Trunk sharing

The first `shareDepth` levels of the tree are drawn once and shared by all
three channels (the "shared trunk"); below that, each channel diverges with its
own subtree. That's why the grammar's `share` knob ranges from 0 (three
independent trees) to `mono` (r = g = b).

## What carries time

Only the **leaves** `x(...)` and `y(...)`. Operators (`max`, `warp`, `sin`, …)
do not move. Each occurrence of `x`/`y` has its **own** drawn params, so the
relations between the parts of an expression change over the loop instead of
the whole image moving as a block.

`spatialAxis` in `packages/randomart/src/core/catalog/operators/terminals.ts`:

- `amp` ∈ [0, 0.7], `phase` ∈ [-1, 1], `cycles` ∈ [0, 1] — all quantized to 3
  decimals at draw time (see `drawParams` in `generator.ts`).
- `cycles` is further reduced to **1, 2 or 3 whole cycles**:
  `1 + round(2 * cycles)`. Whole cycles keep the loop exactly periodic.
- The emitted GLSL, e.g. for `x(0.337, 0.961, 0.387)`:

    ```glsl
    (0.663*v_p.x + 0.337*sin(2.0*PI*2.0*u_phase + PI*0.961))
    ```

- `amp = 0` falls back to the plain coordinate `${p}.${axis}`.
- Every x/y declares `requires: ['u_phase']`, so any expression containing one
  is animated: the preamble reports `animated` from the dependency closure
  alone. There is no separate "motion" axis any more (the `src/core/motion/`
  module was deleted).

`u_phase` is the loop phase, fed by the playback clock, in `[0, 1)`.

## Known trade-offs and open leads

- The "va et vient" (back-and-forth) feel comes from the pure `sin`: one
  frequency, one waveform. Cheapest fix: **sum of two sines with different
  whole cycles** in the same node — still exactly periodic, much less
  predictable ("floating" feel).
- A per-node waveform choice (sin / smooth triangle / periodic random walk)
  would need one extra draw per node → PRNG order change → `GENERATOR_VERSION`
  bump.
- "Not very organic" is mostly a **grammar** concern (families `warp` and
  `trigonometry` add local deformation), not a seed concern: the grammar
  decides the style, the seed only decides the values.
- `amp ≤ 0.7` and `cycles ∈ {1, 2, 3}` are hard-coded in `terminals.ts` — the
  first knobs to move when exploring.

## Test suite: green again (2026-10-19)

The repairs promised above landed. `vp check` is clean (format, lint, types
on 452 files) and `vp test` is fully green (478 passed, 10 skipped — the
skips are the pre-existing opt-in `skipIf(!enabled)` measure/dump tests).

What changed:

- `compiler.test.ts` rewritten around time terminals (oscillator GLSL, amp=0
  fallback, cycles 1..3); `testing.test.ts`/`fuzz.test.ts` no longer pass
  `{ motion }` to `compile()`, and fuzz derives `expectedAnimated` via
  `usesOperator(expression, new Set(['x', 'y']))`.
- Grammar tests (`quantized`, `sample`, `randomGrammar`, `describe`,
  `grammar`): every `motion` reference and test deleted (the axis does not
  exist); `grammar.test.ts`'s stale `SampleRecipesOptions` error is gone.
- Expression tests (`expression`, `inspect`, `serialize`, `artwork`,
  `emit`, `lower`): `x`/`y` fixtures are `createNode(catalog, 'x', [],
  [0, 0, 0])` — amp=0, the plain coordinate — so expectations carry the
  3 params (`x[0,0,0]()`, `x(0, 0, 0)`, serialized `params: [0, 0, 0]`).
  `createNode` stays strict: exact param count, no defaults.
- Generator snapshots regenerated (GENERATOR_VERSION 4): every `x`/`y`
  leaf now carries its 3 quantized params, no bare `x`/`y` leaf remains.

### The `animated` flag (decision: keep)

There is no "static vs animated" shader type — a still image is a play
frozen at some phase. `CompiledShader.animated` is kept as the **factual
dep-closure property** "this shader reads `u_phase`" (derived by
`buildPreamble` from the operator closure, `x`/`y` declaring
`requires: ['u_phase']`). Its only consumer is the render gate
(`renderer/renderGate.ts`): it skips phase-only redraws for const-only
shaders, which is a real win (no pointless redraw at 60 fps). Docs and test
names now say "reads / does not read `u_phase`" instead of "animated /
static".

## Next sessions

1. **Colour conversion deep-dive** — why `[-1, 1] → [0, 1]` via a colour
   space at all. Prompt in `codex/prompts/session-colour-pipeline.md`.
2. **Config file for hard-coded values** — done: `TUNING` in
   `packages/randomart/src/core/config/tuning.ts` holds terminals,
   generator rounding, the recipe space, the sampler policy, artwork/render
   defaults, colour chroma, curated channels and the app shell; the
   knobs-vs-guards split and the remaining leads are in
   `codex/notes/randomart-config-knobs.md`. The naming rules live in
   `codex/docs/conventions/02-typescript.md` §2.1.
