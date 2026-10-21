# @repo/randomart-bench

Exploration at scale: draw many candidate grammars, inspect them as lots and contact sheets, rate
them into a notebook, and run the offline dataset pipeline.

The Bench is independent of the Lab. Opening a cell in the Lab goes through a callback registered
by the app shell (`setOpenInLabHandler`), so this package never imports `@repo/randomart-lab`.

## Layout

| path                               | responsibility                                          |
| ---------------------------------- | ------------------------------------------------------- |
| `src/stores/benchSettingsStore.ts` | lot size: grammar count, seeds, cell size, view         |
| `src/stores/notebookStore.ts`      | notebook state, IndexedDB persistence, import/export    |
| `src/stores/lotStore.ts`           | rendering lots, selection, ratings, open-in-lab handoff |
| `src/ui/`                          | Bench panel, stage, focus/planche views, lot helpers    |
| `src/dataset/analysis/`            | image descriptors, correlation, PCA                     |
| `src/dataset/scripts/`             | dataset CLI and the write/features/pca/sheet steps      |
| `src/dataset/page.ts`              | in-browser renderer driven by the CLI                   |
| `src/storage/`                     | IndexedDB notebook storage                              |

## Exports

Source-only, exact paths:

```ts
import { setOpenInLabHandler } from '@repo/randomart-bench/stores/lotStore';
import { BenchPanel } from '@repo/randomart-bench/ui/BenchPanel';
import { BenchStage } from '@repo/randomart-bench/ui/BenchStage';
```

The package exports `./ui/*`, `./stores/*`, `./dataset/page`, `./dataset/scripts/*`,
`./dataset/analysis/*` and `./storage/notebookDb`.

## Notebook

A notebook is the persisted list of drawn batches and their ratings. It is saved to IndexedDB and
can be exported/imported as JSON. `initBench()` restores the notebook and redraws its active batch
when the Bench stage mounts.

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

Run these from `packages/randomart-bench`. `vp run dataset` runs the four in order. Each step is a
function (`src/dataset/scripts/*.ts`); the CLI is the only file that touches argv or exits
(`src/dataset/scripts/cli.ts`).

- `write` drives a headless Chromium against `dataset.html`. The dev server is started and stopped
  by the command itself when nothing answers on `--url` (default `http://localhost:5173`).
- Chromium comes from `$CHROMIUM`, defaulting to `/usr/bin/chromium`; `--mode swiftshader` renders
  in software when there is no usable GPU.
- Options follow the command:
  `vp run dataset:write --count 300 --seeds 8 --size 256`, or
  `vp run dataset:sheet --grammars 3,17,42,8`.

## Commands

    vp lint
    vp test               # lot, planche and descriptor tests
    vp run dataset        # full offline pipeline
