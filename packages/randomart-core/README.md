# @repo/randomart-core

The domain of randomart — grammar → expression → GLSL — and the browser edge that turns that GLSL
into pixels. No React, no app state.

    grammar + seed → expression → GLSL → image

Consumers import exact module paths; there is no build step and no barrel `index.ts`.

```ts
import { compile } from '@repo/randomart-core/compiler/compile';
import { generate } from '@repo/randomart-core/generator/generate';
```

## Layout

| path          | responsibility                                            |
| ------------- | --------------------------------------------------------- |
| `catalog/`    | operator definitions, registry, shader dependencies       |
| `expression/` | immutable expression trees, keys, formulas, serialization |
| `random/`     | seed type and PRNG                                        |
| `grammar/`    | quantized grammar, presets, sampling                      |
| `generator/`  | `(grammar, seed) → expression`                            |
| `compiler/`   | expression → GLSL (lowering, emit, contract)              |
| `color/`      | channel models and color spaces                           |
| `artwork/`    | artwork type, creation, provenance, file format           |
| `config/`     | app-wide bounds and defaults                              |
| `shared/`     | guards and small shared primitives                        |
| `renderer/`   | the browser edge: batch, contract, render gate, image     |

## Core and shell

The package follows the core/shell rule of §1.2. Everything here is pure TypeScript **except
`renderer/batch`**, the one module that reaches for the DOM: it creates an offscreen canvas and
drives WebGL through `@repo/glaze`. It is the shell's edge of the domain, and the only place
allowed to.

`renderer/contract` and `renderer/renderGate` are pure too: they hold the WebGL context options,
the loop phase and the lazy-render decision, not the drawing itself. `renderer/types` and
`renderer/flatness` read the pixels the renderer produces.

The lint config keeps the seam honest: `no-restricted-globals` bans the browser globals in
`packages/randomart-core/src/**` except `renderer/batch`.

The notebook — persisted lots and ratings — belongs to the bench, not to core: it is a consumer of
the domain, not part of `grammar → expression → GLSL`.

## Vocabulary

- **grammar**: an integer weight per operator (0 = off, same range for all) + size profile +
  shared-trunk depth + color space
- **preset**: a named grammar (`defaultGrammar`, `grammarPresets`); there is no separate recipe type
- **seed**: picks one expression inside a grammar
- **expression**: three trees (r, g, b). **node** = tree element, **vertex** = compiler DAG entry
- **artwork**: expression + optional provenance (grammar, seed). The expression is the reference

## Commands

    vp lint
    vp test               # unit tests
    vp run test:measure   # opt-in measurement probes (VITE_MEASURE=1)

## Where the rules live

- throw vs repair: `src/shared/shared.ts`
- operator contract: `src/catalog/operators/types.ts`
- generator versioning: `src/generator/generator.ts`
- file formats: `src/artwork/serialize.ts`
- shared catalog singleton: `src/catalog/default.ts`
- the one DOM boundary: `src/renderer/batch/batch.ts`
