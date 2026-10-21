# @repo/randomart-lab

The single-artwork workspace: one expression at a time, with its grammar controls, playback and
history.

Lab owns _playing with an artwork_, not exploring lots. Bulk exploration and the dataset pipeline
live in [`@repo/randomart-bench`](../randomart-bench/README.md).

## Layout

| path                         | responsibility                                             |
| ---------------------------- | ---------------------------------------------------------- |
| `src/stores/labStore.ts`     | workspace state, grammar edits, generation, playback setup |
| `src/stores/historyStore.ts` | history entries and the current entry id                   |
| `src/stores/artworkStore.ts` | artwork import/export, PNG export, open-in-lab publishing  |
| `src/ui/components/lab/`     | Lab panel: session, grammar, artwork, inspector            |
| `src/ui/components/history/` | History panel                                              |
| `src/renderer/`              | `RandomArtCanvas`, the interactive WebGL surface           |

## Exports

Source-only, exact paths:

```ts
import { RandomArtCanvas } from '@repo/randomart-lab/canvas';
import { HistoryPanel } from '@repo/randomart-lab/components/history/HistoryPanel';
import { LabPanel } from '@repo/randomart-lab/components/lab/LabPanel';
import { useGrammar } from '@repo/randomart-lab/stores/labStore';
```

The package exports `./canvas`, `./components/lab/*`, `./components/history/*` and `./stores/*`.

## Boundaries

- Lab does not know about the Bench or about the app's mode switch. The app shell decides when to
  show Lab and calls `openCellInLab(grammar, seed)` when the Bench hands over a cell.
- The expression is the reference. Imported artworks are replayed from their expression, not
  regenerated from provenance, so a hand-edited import survives.
- History coalesces consecutive grammar edits: sliding a weight updates one entry instead of
  flooding the timeline.

## Commands

    vp lint
