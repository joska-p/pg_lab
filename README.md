# Creative Playground

> A creative coding playground where I experiment with generative art, data viz, and visual toys. Built for fun, documented for collaborators.

by [@jpotin](https://gitlab.com/jpotin)

---

## What is this?

A collection of creative coding experiments, visual explorations, small tools, and notes — some polished, some prototypes, some just abandoned ideas worth keeping around. The common thread is curiosity, not a specific product or stack.

It's a playground, not a product.

## Workbench shape

PG_LAB is one **Workbench**. `apps/playground` is its published form: a Shell that hosts one open **Experiment** at a time. An Experiment is a folder in that app, not a package; it contributes a **Scene** for the Stage and optional **Controls** for the Panel. The registry is derived from those folders, so adding an Experiment means adding a folder.

Unpublished trials and dormant ideas live in the **Scratchpad**, a separate local area outside the registered Experiment set. Run everything from the root with `vp dev`.

See [ADR 0001](codex/docs/adr/0001-experiments-are-folders.md) for why Experiments are folders.
