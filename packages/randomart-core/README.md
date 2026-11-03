# randomart-core

Procedural formula generator and GLSL compiler. It replaces `randomart-vm`, which stays in the
repository until `randomart-ui` is migrated.

```
(grammar, seed) ──▶ Expression ──▶ GLSL ──▶ GPU
                          └─────▶ evaluate (CPU reference)
```

## Modules

| File          | Role                                                                  |
| ------------- | --------------------------------------------------------------------- |
| `ops.ts`      | Operator catalogue: arity, parameters, `glsl` and `eval` twins        |
| `tree.ts`     | Immutable `Node`/`Expression`, serialization, formula formatting      |
| `rng.ts`      | Deterministic mulberry32 stream keyed by a number or a string         |
| `grammar.ts`  | Operand weights, size profiles, presets, grammar drawing and identity |
| `generate.ts` | `(grammar, seed) → Expression`                                        |
| `evaluate.ts` | `(Expression, point) → raw RGB` reference interpreter                 |
| `lower.ts`    | Expression → DAG: sharing, usage counts, warp coordinate contexts     |
| `emit.ts`     | DAG → fragment shader (`compile`)                                     |
| `colors.ts`   | Color spaces as GLSL sources                                          |
| `glsl.ts`     | Shader header, shared GLSL helpers, float literals                    |

Dependencies only flow downwards: `glsl`/`colors` → `ops` → `tree` → `grammar`/`generate`/
`evaluate`/`lower` → `emit`. There is no `index.ts`: consumers import the module they need.

## Invariants

- **Determinism.** The same `(grammar, seed)` always yields the same expression. Generation only
  consumes the injected `Rng`; the core never reads ambient state.
- **Raw range.** Every operator returns a value in `[-1, 1]`; color spaces map that triplet to sRGB.
  The CPU evaluator returns the same range.
- **Named parameters.** Parameters are stored by name, so reordering a definition cannot change the
  meaning of a serialized tree.
- **Boundary validation.** `deserialize` and `createGrammar` are the only places that check
  untrusted input. Inside the package, types are trusted.

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

The determinism and CPU/GPU agreement invariants are not enforced by a test suite. `evaluate` exists
precisely to become that oracle: compare `compile(...).source` rendered on a few pixels against
`evaluate(...)` on the same points.
