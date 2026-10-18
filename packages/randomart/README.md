# randomart

A generative-art workshop: random math expressions become abstract images, still or animated.
You explore grammars more than seeds.

    grammar + seed → expression → GLSL → image

## Commands (from `packages/randomart`)

    vp dev                          # app
    vp test                         # unit tests
    vp run test:measure             # opt-in measurement probes (VITE_MEASURE=1)
    vp run test:shaders             # dump the fuzz shaders in .shaders/
    vp run test:glsl                # dump + glslangValidator on the fuzz shaders
    vp run dataset                  # offline dataset pipeline (see below)

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
- `src/stores/`, `src/components/`: Zustand state and UI (lab, bench, history)
- `src/dataset/`, `scripts/dataset/`: offline dataset pipeline and analysis

## Vocabulary

- **grammar**: weight per operator (0 = off) + constraints + channel model
- **seed**: picks one expression inside a grammar
- **expression**: three trees (r, g, b). **node** = tree element, **vertex** = compiler DAG entry
- **artwork**: expression + optional provenance (grammar, seed). The expression is the reference
- **notebook / batch / planche**: rated candidates, one rendered lot, its grid
- **dataset**: the offline pipeline and its git-ignored output

## Dataset workflow

The offline survey of the grammar space: sample grammars, draw them in bulk, describe them — no
clicking through the bench. The four steps read and write the same directory (`/dataset/`,
git-ignored), so the pipeline is a chain over one folder:

| step     | command                   | reads              | writes                          |
| -------- | ------------------------- | ------------------ | ------------------------------- |
| write    | `vp run dataset:write`    | the running app    | `dataset.json`, `pixels.bin`    |
| features | `vp run dataset:features` | the dataset        | `features.json`                 |
| pca      | `vp run dataset:pca`      | dataset + features | `pca.json` + a report on stdout |
| sheet    | `vp run dataset:sheet`    | the dataset        | `sheet.png`                     |

`vp run dataset` runs the four in order. Each step is a function (`scripts/dataset/*.ts`); the CLI
is the only file that touches argv or exits (`scripts/dataset/cli.ts`).

- `write` drives a headless Chromium against `dataset.html`. The dev server is started and stopped
  by the command itself when nothing answers on `--url` (default `http://localhost:5173`).
- Chromium comes from `$CHROMIUM`, defaulting to `/usr/bin/chromium`; `--mode swiftshader` renders
  in software when there is no usable GPU.
- Options follow the command: `vp run dataset:write --count 300 --seeds 8 --size 256`, or
  `vp run dataset:sheet --grammars 3,17,42,8`.

## Where the rules live

- throw vs repair: `src/core/shared/index.ts`
- operator contract: `src/core/catalog/operators/types.ts`
- generator versioning: `src/core/generator/generator.ts`
- file formats: `src/core/artwork/serialize.ts`
