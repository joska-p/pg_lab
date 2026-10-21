# @repo/randomart-dataset

The offline survey of the grammar space: sample grammars, draw them in bulk, describe the images,
run a PCA and build a contact sheet. No clicking through the Bench.

This package is the **node** side of randomart. It is not imported by the app: it drives a headless
Chromium against a page served by Vite, then writes files to disk.

## Layout

| path            | runtime | responsibility                                          |
| --------------- | ------- | ------------------------------------------------------- |
| `src/node/`     | node    | CLI, dev server, file IO, PNG, Playwright driver        |
| `src/analysis/` | pure    | image descriptors, correlation, PCA (used by node)      |
| `src/page.ts`   | browser | `window.datasetApi`: sample + render, driven by the CLI |
| `dataset.html`  | browser | Vite entry for the render page                          |

`src/page.ts` owns no rendering: the GPU work lives in
`@repo/randomart-core/renderer/batch`, the same renderer the Bench uses. The page is only the
serialization boundary between Chromium and `src/node/cli.ts`.

## Pipeline

Every step reads and writes the same directory (`dataset/` by default, git-ignored):

| step     | command                   | reads              | writes                          |
| -------- | ------------------------- | ------------------ | ------------------------------- |
| write    | `vp run dataset:write`    | the running app    | `dataset.json`, `pixels.bin`    |
| features | `vp run dataset:features` | the dataset        | `features.json`                 |
| pca      | `vp run dataset:pca`      | dataset + features | `pca.json` + a report on stdout |
| sheet    | `vp run dataset:sheet`    | the dataset        | `sheet.png`                     |

`vp run dataset` runs the four in order. Run these from this package. Each step is a function
(`src/node/*.ts`); `src/node/cli.ts` is the only file that touches argv or exits.

- `write` starts the dev server when nothing answers on `--url` (default `http://localhost:5173`),
  opens `dataset.html`, asks the page to sample grammars, then renders each `(grammar, seed)` and
  streams the pixels to `pixels.bin`.
- `features` summarizes each usable grammar over its valid images: one row per grammar, one column
  per descriptor.
- `pca` standardizes the feature table, runs a PCA, and correlates each component with the grammar
  parameters. It prints a human report and writes `pca.json`.
- `sheet` lays out one row of seeds per grammar: `vp run dataset:sheet --grammars 3,17,42,8`.

`pca.json` and `features.json` are artifacts for inspection: no UI reads them back yet.

## Commands

    vp lint
    vp test               # descriptors, correlation, PCA and report tests
    vp run dataset        # full offline pipeline

Chromium comes from `$CHROMIUM`, defaulting to `/usr/bin/chromium`; `--mode swiftshader` renders in
software when there is no usable GPU. Other options:
`vp run dataset:write --count 300 --seeds 8 --size 256`.

## Boundaries

- **Dataset ≠ notebook.** The Bench notebook records manual ratings in IndexedDB. The dataset
  records sampled images and objective descriptors on disk. They share the sampler and the
  renderer, not their data.
- **Node ≠ browser.** `src/node/` may import `node:*` and Playwright. `src/page.ts` may use the DOM
  and WebGL, and must not import `src/node/`.
- The package depends on `@repo/randomart-core` only; it does not need React, Zustand or the Bench.
