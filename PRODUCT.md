# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

The sole user is the author — a developer who experiments with generative art, data visualization, simulations, and visual tools. The Workbench is used in focused sessions to prototype ideas, learn techniques, and iterate on creative code. There is no external audience or public-facing deployment at this time.

## Product Purpose

PG_LAB is a personal creative coding laboratory. It exists to give its author a consistent, well-tooled environment for exploring visual programming ideas: generative art algorithms, cellular automata, shader experiments, audio sequencers, palette generation, and anything else curiosity leads to. Success means the environment stays out of the way, each Experiment loads fast, and switching between ideas is instant.

## Positioning

This is not a product competing with other tools. Its value is personal: a single curated Workbench that grows with the author's interests, backed by shared component and rendering infrastructure (`@repo/ui`, `@repo/surface`, `@repo/worker-pool`) that reduces boilerplate across Experiments.

## Operating Context

- Monorepo managed by **pnpm 12** workspaces, orchestrated by **Vite+** (`vp` CLI).
- The published Workbench is `apps/playground`: its Shell hosts one open Experiment at a time, with a Panel of Controls beside a Stage for the Scene.
- An Experiment is a folder in `apps/playground`, not a pnpm package. It contributes a Scene and optional Controls; the registry is derived from folders by `import.meta.glob`.
- The **Scratchpad** is a separate, unpublished local area for rougher exploration. It is not part of the registered Experiment set.
- Shared infrastructure stays in real workspace packages: `@repo/ui`, `@repo/surface`, `@repo/worker-pool`, `@repo/randomart-core`, `@repo/pixel`, `@repo/glaze3d`.
- Stack: React 19, Zustand, StyleX, TypeScript, Vite.

## Capabilities and Constraints

- Registered Experiments cover generative art, automata, palettes, signal plots, pixel tools, sequencers and molecule views; the exact set is derived from Experiment folders.
- Dormant ideas are kept as short notes rather than maintained as packages.
- Rendering targets both Canvas 2D and WebGL (via `@repo/surface`).
- The UI library provides a cohesive set of input widgets (sliders, selects, toggles, color pickers, text inputs, segmented controls, grids) designed for parameter-tweaking workflows.
- No backend, no authentication, no persistence beyond local state.
- The monorepo uses `vp check --fix` for formatting, linting, and type-checking.

## Brand Commitments

None. The name "PG_LAB" and "Creative Playground" are informal and may change. The established dark theme and minimal aesthetic are preferred but not locked.

## Evidence on Hand

- All Experiment code is in-repo and runnable with `vp dev` from the root.
- No external content, testimonials, or marketing assets exist.
- Design tokens live in `packages/ui/src/tokens/` (StyleX: `const.stylex.ts`, `surface.stylex.ts`, `tint.stylex.ts`).

## Product Principles

1. **Curiosity over completeness.** An Experiment that teaches something is worth keeping, even unfinished.
2. **Shared infrastructure, independent Experiments.** Common rendering, UI, and state patterns live in shared packages; each Experiment owns its logic without coupling to others.
3. **Instant context switching.** Moving between Experiments should feel like flipping pages, not booting apps.
4. **The environment should disappear.** The Panel, Shell, and tooling exist to serve the visual output, never to compete with it.
5. **Dark-first, minimal.** The interface recedes; the Stage leads.
