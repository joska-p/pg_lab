# randomart

A generative-art workshop: random math expressions become abstract images, still or animated.
You explore grammars more than seeds.

    grammar + seed → expression → GLSL → image

## Commands (from `packages/randomart`)

    vp dev                          # app
    vp test                         # unit tests
    sh scripts/validate-glsl.sh     # glslangValidator on the fuzz shaders
    VITE_MEASURE=1 vp test <name>   # opt-in measurement probes

## Layout

- `src/core/`: pure TypeScript, no DOM, no GPU
    - `catalog`: operators and shader dependencies
    - `expression`: immutable trees, keys, serialization
    - `random`: seed and PRNG
    - `grammar`: vocabulary, weights, constraints, presets, sampling
    - `generator`: `(grammar, seed) → expression`
    - `compiler`: expression → GLSL
    - `color`: channel model and colour spaces
    - `artwork`: artwork and grammar file formats
    - `notebook`: rated batches of candidate grammars
    - `analysis`: image descriptors and PCA
- `src/renderer/`: WebGL through `@repo/glaze` (live canvas, batch renderer)
- `src/stores/`, `src/components/`: Zustand state and UI (lab, gallery, history)
- `src/bench/`, `scripts/bench/`: offline dataset pipeline and analysis

## Vocabulary

- **grammar**: weight per operator (0 = off) + constraints + channel model
- **seed**: picks one expression inside a grammar
- **expression**: three trees (r, g, b). **node** = tree element, **vertex** = compiler DAG entry
- **artwork**: expression + optional provenance (grammar, seed). The expression is the reference
- **notebook / batch / planche**: rated candidates, one rendered lot, its grid
- **bench / dataset**: the offline pipeline and its git-ignored output

## Where the rules live

- throw vs repair: `src/core/shared/index.ts`
- operator contract: `src/core/catalog/operators/types.ts`
- generator versioning: `src/core/generator/generator.ts`
- file formats: `src/core/artwork/serialize.ts`
