# RandomArt VM — Design Discovery (updated)

> Exploratory. We learn by building. Don't copy `randomart`, extract the model.

## A) Fundamental Model

- **Program**: A program evaluates to produce output. Could be RGB from 2D coords, but not necessarily limited to it. Don't over-abstract, but don't block generalization.
- **Goal**: "a machine that synthesizes deterministic mathematical functions and compiles them to a target" — fits.
- **Coordinates**: `[-1,1]` normalized UV is likely fundamental now, but treat as configurable (space/param) rather than hardcoded assumption.
- **Time/Animation**: Fun and varied. Nice to have, but not necessarily sacred. Make it optional/easy to move.

## B) ISA & Operators

- **Catalog**: Current catalog is fine. We can disable operators via weight 0. Curated grammars can pick a subset.
- **Minimal viable**: need at least 1 terminal + 1 non-terminal to produce a non-trivial image.
- **Coordinate transforms (warp/inner)**: interesting addition, not strictly central. Can add later or keep simple.
- **Tree vs DAG**: indifferent. Pick what’s cleaner.
- **Unify vs separate**: follow what makes sense; don't split prematurely.

## C) Generation & Grammar

- **Weights system is core**: grammar = weights over operators + axes (`size`, `shareDepth`, `space`, etc). Don't throw this away.
- **`shareDepth`**: part of grammar, fundamentally changes rendering.
- **Budgets**: both — prevent explosion AND keep results interesting.
- **Determinism**: `(seed, grammar)` must produce same image.
- **Share channel structure**: important (ties to `shareDepth`).

## D) Strategy

- **Independent**: no imports from `randomart`. Derive if needed.
- **Parity not required**: only same image for same `(seed, grammar)`. Code/structure can differ.
- **Backends**: GLSL first, keep door open for CPU/WGSL. Maybe backend interface later.
- **Tests**: minimal, don't block iteration.
- **Explore first**: have a rough idea, then build and adjust.
- **Visual oracle**: fine to look at running `randomart` app to compare visually when unsure.

## Decisions for first steps

1. Keep **grammar + weights** as core concept
2. Keep **(seed, grammar)** as identity
3. Treat **coordinates/time** as configurable
4. Start from **current catalog ideas** as inspiration (can trim)
5. Need **>=1 terminal, >=1 non-terminal**
6. Don't over-abstract for non-RGB targets yet (but leave room)

## Immediate Plan

- Scaffold dirs (done)
- Write minimal IR types
- Write minimal ISA interface + maybe small hardcoded catalog for prototyping
- Write RNG (independent)
- Write Grammar types + basic validation
- Write naive generator using weights + budget + shareDepth
- Write trivial GLSL backend
- Try to generate+compile and reason about output
- Compare visually with randomart if needed, but don't import

Focus: understand generation + IR first. Everything else follows.
