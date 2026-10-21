# @repo/randomart-core

The domain of randomart, as pure TypeScript: no React, no app state. Everything that turns a
grammar into an image lives here.

    grammar + seed → expression → GLSL

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
| `notebook/`   | rated batches of candidate grammars and their file format |
| `renderer/`   | batch rendering, contract and render gate                 |
| `config/`     | app-wide bounds and defaults                              |
| `shared/`     | guards and small shared primitives                        |

The renderer modules are the browser-facing edge of the domain: `contract` and `renderGate` are
DOM-free, while `batch` creates a canvas through `@repo/glaze` and is meant to run in the browser.

## Vocabulary

- **grammar**: an integer weight per operator (0 = off, same range for all) + size profile +
  shared-trunk depth + color space
- **preset**: a named grammar (`defaultGrammar`, `grammarPresets`); there is no separate recipe type
- **seed**: picks one expression inside a grammar
- **expression**: three trees (r, g, b). **node** = tree element, **vertex** = compiler DAG entry
- **artwork**: expression + optional provenance (grammar, seed). The expression is the reference
- **notebook / batch**: rated candidates and one draw of them

## Commands

    vp lint
    vp test               # unit tests
    vp run test:measure   # opt-in measurement probes (VITE_MEASURE=1)

## Where the rules live

- throw vs repair: `src/shared/shared.ts`
- operator contract: `src/catalog/operators/types.ts`
- generator versioning: `src/generator/generator.ts`
- file formats: `src/artwork/serialize.ts`, `src/notebook/serialize.ts`
- shared catalog singleton: `src/catalog/default.ts`
