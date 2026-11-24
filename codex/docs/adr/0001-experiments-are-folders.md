---
status: accepted
---

# Experiments are folders in the Workbench app

PG_LAB inherited a pnpm habit of giving every visual idea its own package, which left each one with a dual app/library identity and a duplicated registry. We decided that Experiments are folders owned by the published Workbench in `apps/playground`, while real libraries remain workspace packages and the Scratchpad stays an independent unpublished area; one folder-derived registry then replaces the hand-maintained lists.

## Considered Options

- **A — Packages without an app shell.** Keep one package per Experiment but strip its standalone app scaffolding. Rejected: it preserves the dual identity, the per-Experiment scripts and the duplicated registry.
- **B — Experiments as folders in `apps/playground` (chosen).** The app owns the Shell and derives its registry from Experiment folders; shared rendering and UI code stays in real packages. This keeps one place to run and one mechanism to add an Experiment.
- **C — A `@repo/lab` framework package.** Extract the Shell and Experiment conventions into a shared framework. Rejected: it adds an abstraction layer with only one consumer and freezes the host boundary too early.

## Consequences

- There is no per-Experiment `dev` script; `vp dev` runs at the root.
- There is no registry codegen: `import.meta.glob` derives the registry from folder manifests.
- `three-stage` becomes a registered Experiment instead of a standalone package.
- `squared` and `string-art` are reduced to idea notes instead of dormant packages.
- Real libraries (`ui`, `surface`, `worker-pool`, `glaze3d`, `randomart-core`, `pixel`) stay workspace packages.
