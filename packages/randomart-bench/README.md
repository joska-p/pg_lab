# @repo/randomart-bench

Exploration at scale: draw many candidate grammars, inspect them as lots and contact sheets, rate
them into a notebook, and hand a cell to the Lab.

The Bench is independent of the Lab. Opening a cell in the Lab goes through a callback registered
by the app shell (`setOpenInLabHandler`), so this package never imports `@repo/randomart-lab`.

## Layout

| path                               | responsibility                                          |
| ---------------------------------- | ------------------------------------------------------- |
| `src/stores/benchSettingsStore.ts` | lot size: grammar count, seeds, cell size, view         |
| `src/stores/notebookStore.ts`      | notebook state, IndexedDB persistence, import/export    |
| `src/stores/lotStore.ts`           | rendering lots, selection, ratings, open-in-lab handoff |
| `src/ui/`                          | Bench panel, stage, focus/planche views, lot helpers    |
| `src/notebook/`                    | notebook model and strict JSON file format              |
| `src/storage/`                     | IndexedDB notebook storage                              |

There is no node code in this package: it runs in the browser. The offline pipeline lives in
[`@repo/randomart-dataset`](../randomart-dataset/README.md).

## Exports

Source-only, exact paths:

```ts
import { setOpenInLabHandler } from '@repo/randomart-bench/stores/lotStore';
import { BenchPanel } from '@repo/randomart-bench/ui/BenchPanel';
import { BenchStage } from '@repo/randomart-bench/ui/BenchStage';
```

The package exports `./ui/*`, `./stores/*` and `./notebook/*`.

## Notebook

A notebook is the persisted journal of drawn **batches** and their **candidate** ratings. It is
saved to IndexedDB and can be exported/imported as JSON.

    notebook
      └─ batch            one lot: grammar × seeds
           └─ candidate   one grammar, with its seeds
                └─ rating  0..5, optional

The notebook is **not** a dataset: it records subjective ratings. The dataset package records
objective image descriptors and is analysed with PCA.

A batch is drawn with `sampleGrammars()` and rendered with the shared batch renderer from core. The
seeds of a row are views of one grammar; a rating belongs to the grammar (the row), never to a
single seed. `initBench()` restores the notebook and redraws its active batch when the stage mounts.

## Commands

    vp lint
    vp test               # lot, planche and notebook tests
