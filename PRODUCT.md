# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

The sole user is the author — a developer who experiments with generative art, data visualization, simulations, and visual tools. The playground is used in focused sessions to prototype ideas, learn techniques, and iterate on creative code. There is no external audience or public-facing deployment at this time.

## Product Purpose

PG_LAB is a personal creative coding laboratory. It exists to give its author a consistent, well-tooled environment for exploring visual programming ideas: generative art algorithms, cellular automata, shader experiments, audio sequencers, palette generation, and anything else curiosity leads to. Success means the environment stays out of the way, each experiment loads fast, and switching between ideas is instant.

## Positioning

This is not a product competing with other tools. Its value is personal: a single curated workspace that grows with the author's interests, backed by a shared component and rendering infrastructure (`@repo/ui`, `@repo/surface`, `@repo/worker-pool`) that reduces boilerplate across experiments.

## Operating Context

- Monorepo managed by **pnpm 12** workspaces, orchestrated by **Vite+** (`vp` CLI).
- Each experiment lives in its own package under `packages/`, exporting a `Scene` and `Controls` component pair.
- The main app (`apps/playground`) lazily loads experiments via a route-based registry and renders them inside a unified shell: a control panel on one side, a stage (canvas) on the other.
- A second app (`apps/brouillon`) serves as a scratch pad for rougher exploration.
- Shared infrastructure: `@repo/ui` (components, tokens, hooks, StyleX), `@repo/surface` (GPU/CPU canvas, camera, shaders, render targets), `@repo/worker-pool`, `@repo/randomart-core`, `@repo/pixel`.
- Stack: React 19, Zustand, StyleX, TypeScript, Vite.

## Capabilities and Constraints

- ~15 registered experiments: art-canvas, mosaic-maker, squared, string-art, fracture, automa, randomart, oeis-signal, palette, pixel, pixel-manipulator, notebook, sequencer, radu-machine-learning, mol-demo.
- Rendering targets both Canvas 2D and WebGL (via `@repo/surface`).
- The UI library provides a cohesive set of controls (sliders, selects, toggles, color pickers, text inputs, segmented controls, grids) designed for parameter-tweaking workflows.
- No backend, no authentication, no persistence beyond local state.
- The monorepo uses `vp check --fix` for formatting, linting, and type-checking.

## Brand Commitments

None. The name "PG_LAB" and "Creative Playground" are informal and may change. The established dark theme and minimal aesthetic are preferred but not locked.

## Evidence on Hand

- All experiment code is in-repo and runnable with `vp dev`.
- No external content, testimonials, or marketing assets exist.
- Design tokens live in `packages/ui/src/tokens/` (StyleX: `const.stylex.ts`, `surface.stylex.ts`, `tint.stylex.ts`).

## Product Principles

1. **Curiosity over completeness.** An experiment that teaches something is worth keeping, even unfinished.
2. **Shared infrastructure, independent experiments.** Common rendering, UI, and state patterns live in shared packages; each experiment owns its logic without coupling to others.
3. **Instant context switching.** Moving between experiments should feel like flipping pages, not booting apps.
4. **The environment should disappear.** Controls, shell, and tooling exist to serve the visual output, never to compete with it.
5. **Dark-first, minimal.** The interface recedes; the canvas leads.
