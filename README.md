# Creative Playground

> A creative coding playground where I experiment with generative art, data viz, and visual toys. Built for fun, documented for collaborators.

by [@jpotin](https://gitlab.com/jpotin)

---

## What is this?

A collection of creative coding experiments, visual explorations, small tools, and notes — some polished, some prototypes, some just abandoned ideas worth keeping around. The common thread is curiosity, not a specific product or stack.

It's a playground, not a product.

---

## PG_LAB

**PG_LAB** is the small website that presents the repo — less a portfolio, more a collection of scenes you move through.

```text
PG_LAB
  ├── launcher
  └── scene
        ├── Stage   (the content)
        └── Panel   (controls / context)
```

The website provides navigation and environment; experiments remain independent apps living in their own packages.

**Visual language:** the content floats above an atmosphere. A full-screen, changing background sets the mood; each experiment sits inside it as a framed object. The background isn't decoration — it's part of the identity, and can shift to change the mood without touching the app itself.

Experiments, notes, docs, and tools don't need separate visual systems — they're all just different kinds of **scenes**:

```text
Experiment    → interactive Stage
Note          → text / image Stage
Documentation → document Stage
Tool          → interactive Stage
```

---

## Experiments

Experiments are first-class, independent apps — they shouldn't depend on PG_LAB to function, and PG_LAB shouldn't own their implementation.

```text
packages/
  randomart/
  fractals/
  string-art/
  ...
       ↓
apps/website/  (PG_LAB loads & presents them)
```

This also means older experiments can stick around without being forced to evolve alongside the website.

### ExperimentShell

A shared layout primitive, independent from the website, filling 100% of its parent:

```text
ExperimentShell
  ├── Stage   — visual content: canvas, WebGL, SVG, DOM, whatever
  └── Panel   — controls and contextual info (floating, docked, or shared with the stage)
```

The shell only knows about spatial layout, not what's inside — it works standalone, inside PG_LAB, or in dev/preview.

---

## Navigation

The home scene is a launcher; picking something replaces the current scene:

```text
PG_LAB
├── Discoveries (RandomArt, Fracture, ...)
├── Notes
└── Documentation
```

No permanent nav bar — navigation stays contextual to the current scene. Inside an experiment, the simplest option is a back-to-menu action, like leaving a game. The exact model is still open (see below).

---

## Performance

**Loading:** the website shouldn't load every experiment upfront. Favor code splitting — experiments load via dynamic import when selected, keeping the initial shell small. Build/deploy strategy isn't decided yet; first step is measuring the bundle from the simplest possible setup.

---

## Design principles

- **Small over general** — personal experiments, not a platform. Prefer concrete solutions over speculative abstraction.
- **Experiments are independent** — they don't need to know PG_LAB exists.
- **The shell is spatial, not semantic** — it knows Stage/Panel, not RandomArt vs. fractal vs. note.
- **The environment provides coherence** — experiments can look wildly different; PG_LAB doesn't force uniformity.
- **Interaction before chrome** — UI exists because it helps, not because websites are "supposed to" have nav bars and borders.
- **The background is part of the experience** — it's mood-setting, not decoration.
- **Docs are part of the playground** — notes and documentation live in the same environment, not as a separate afterthought.

---

## Open questions

- Navigation model between scenes; should scenes have URLs / browser history?
- Does back restore the previous scene, or always return to the launcher?
- How much transition animation, if any?
- Can experiments open other experiments?
- How should the experiment registry and metadata work?
- Plain React/Vite, or something like Astro?
- How aggressively to code-split / prefetch?

To be answered by building, not by designing further in advance.

---

## Status

Working vision, not a spec. Expect it to evolve as ideas get tested in real experiments — the system should stay small enough that changing the vision stays easy.
