# randomart-core

Procedural formula generator and GLSL compiler, consumed by `randomart-ui`.

```
(grammar, seed) ──▶ Expression ──▶ GLSL (space) ──▶ GPU
                          └─────▶ evaluate (CPU reference)
```

## Modules

| File          | Role                                                                                           |
| ------------- | ---------------------------------------------------------------------------------------------- |
| `ops.ts`      | Operator catalogue: arity, parameters, `glsl` and `eval` twins                                 |
| `tree.ts`     | Immutable `Node`/`Expression`, serialization, formula formatting                               |
| `seed.ts`     | `Seed` brand (a trimmed string), validation and parsing                                        |
| `errors.ts`   | `RandomArtError` and its recoverable subclasses (`InfeasibleGrammarError`, `GrammarDrawError`) |
| `rng.ts`      | Deterministic mulberry32 stream keyed by a `Seed`                                              |
| `grammar.ts`  | Operand weights, depth/node bounds, grammar drawing; presets pair a grammar with a space       |
| `generate.ts` | `(grammar, seed) → Expression`                                                                 |
| `evaluate.ts` | `(Expression, point) → raw RGB` reference interpreter                                          |
| `lower.ts`    | Expression → DAG: sharing, usage counts, warp coordinate contexts                              |
| `emit.ts`     | `(Expression, space) → fragment shader` (`compile`)                                            |
| `colors.ts`   | Color spaces as GLSL sources + CPU reference `toSrgb`                                          |
| `glsl.ts`     | Shader header, shared GLSL helpers, float literals                                             |

Dependencies only flow downwards: `glsl`/`colors` → `ops` → `tree` → `grammar`/`generate`/
`evaluate`/`lower` → `emit`. There is no `index.ts`: consumers import the module they need.

## Invariants

- **Determinism.** The same `(grammar, seed)` always yields the same expression. Generation only
  consumes the injected `Rng`; the core never reads ambient state. `GENERATOR_VERSION` must be
  bumped whenever a generation change would alter an existing `(grammar, seed)` pair.
- **Color space is a compile parameter.** `space` belongs to `compile`, not to `Grammar` and not
  to `generate`: it is a palette applied after generation. The same `(grammar, seed)` yields the
  same expression whatever the space; only the emitted GLSL changes. Presets may suggest a space,
  but generation never reads it.
- **Seed identity.** A `Seed` is a trimmed, non-empty string of at most `MAX_SEED_LENGTH`
  characters. Numbers are not a separate representation: `42` is the seed `'42'`. Ambient
  randomness is the UI's job (`randomSeed()`); the core only accepts a `Seed`.
- **Raw range.** Every operator returns a value in `[-1, 1]`; color spaces map that triplet to sRGB.
  The CPU evaluator returns the same range.
- **Named parameters.** Parameters are stored by name, so reordering a definition cannot change the
  meaning of a serialized tree.
- **Boundary validation.** Untrusted input is checked where it enters: `deserialize` for trees,
  `createGrammar` for grammars, `parseSeed`/`createSeed` for seeds, and `compile` for its options.
  `createNode` also asserts arity and parameters, so a hand-built tree cannot violate the operator
  contract; `deserialize` adds path-precise messages. Inside the package, types are trusted.

## GLSL contract

`compile` emits a complete GLSL ES 3.00 fragment shader:

- `#version 300 es` and `precision highp float`;
- `in vec2 vUv` in `[0, 1]²`;
- `uniform float u_phase` in `[0, 1)`, only read when `Compiled.animated` is true;
- `out vec4 o_color`, already in sRGB.

The renderer is expected to provide a fullscreen triangle and the `u_phase` uniform. `v_p` is the
pixel position remapped to `[-1, 1]²`.

## Operator contract

Each operator lives in one table entry with two implementations side by side:

```ts
sin: {
    family: 'trigonometry',
    arity: 1,
    glsl: ({ inputs }) => `sin(PI*${inputs[0]})`,
    eval: ({ inputs }) => Math.sin(Math.PI * inputs[0]),
},
```

`glsl` receives inputs that are already complete expressions and may embed them anywhere. An
operator of arity 0 (a terminal) must return a primary expression (call, literal, member access or
parenthesized group); that is what lets `emit` decide whether an inline needs wrapping without
parsing GLSL.

GPU-only helpers are declared through `requires`; their sources live in `glsl.ts` and are emitted
once when used (`ra_fold2`, `ra_sqr`).

`warp` is the single non-pointwise operator: it creates a nested coordinate context and its body is
lowered in that context. Adding a second operator of this kind means generalising `kind: 'warp'`.

## Not covered yet

CPU/GPU agreement is not enforced by the suite. `evaluate` exists precisely to become that oracle:
compare `compile(...).source` rendered on a few pixels against `evaluate(...)` on the same points,
with headless GL and/or `glslangValidator` in CI.
