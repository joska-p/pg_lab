# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

The author alone, as a personal creative toy ("jouet personnel"). The situation is quiet, unpressured exploration: scrub the controls, watch the mosaic mutate, wander. The job is delight and surprise, not producing a saved asset.

## Product Purpose

Mosaic Maker generates procedural mosaics of SVG tiles whose entire look is driven by CSS custom properties. Describing it: it exists to be played with — each generation is unique, and the pleasure is in the drift between one state and the next. Success means the toy stays fun and keeps yielding compositions worth staring at, without ever accumulating "product" obligations.

## Positioning

An infinite procedural mosaic generator whose engine is CSS-variable-driven rendering: the grid geometry (`--tile-size`, `--mosaicGap`) and the palette (`--color-0..4`) are written onto the mosaic node, and every tile — a family from a small registry, individually re-colored and rotated — composes into a layout no two renders repeat. The mechanism a neighboring toy could not truthfully copy is that the artwork itself is a live CSS contract, not a baked image.

## Operating Context

- Lives as an independent package in the Creative Playground monorepo; runs solo under Vite+ (`vp dev`), and is meant to stay runnable on its own — it must never depend on PG_LAB or sibling apps.
- Consumes `@repo/ui` StyleX primitives (ExperimentShell/Stage/ControlPanel, controls, tokens) compiled per-app via `unplugin-stylex`/`stylexPreset`. **The app's design is entirely tied to the `@repo/ui` library** (user-confirmed); any theme or interface change flows through the library's Design System contract, not an app-local style world.
- Logic is deliberately split from rendering: pure, non-UI modules in `src/core`, `src/stores/mosaic`, `src/utils`; the DOM boundary is `style.setProperty` for palette/size/gap/rotation vars.
- Palette data is currently fetched at runtime from `nice-color-palettes` (unpkg), validated with zod, and cached in localStorage for 7 days. This is present behavior, not a locked commitment.

## Capabilities and Constraints

- 8 registered SVG tile families: Square, CornerCircles, OppositeCircles, MiddleCircle, Diamond, Triangles, Cube, Rainbow — each a set of shapes in a 100×100 viewBox.
- Mosaic layout: CSS grid with `repeat(auto-fit, var(--tile-size))`, `gap: var(--mosaicGap)`; tile count is computed from the live container size.
- Per-tile generation: random family from the active tile set, shuffled references to the palette vars, random rotation var.
- Controls today: theme (light/dark/system), active tile-set toggles, Shuffle Colors, Shuffle Rotations, Cycle Palettes (42 at a time), Regenerate Tiles, tile-size and gap sliders, palette picker.
- **Durable constraints (user-confirmed):**
  - Pure app logic stays UI-free and independently testable (`src/core`, `src/stores/mosaic`, `src/utils`).
  - The engine stays CSS-variable-driven; those vars are the contract between logic and rendering.
  - The package stays independent — never coupled to PG_LAB or sibling packages.
- Explicitly undecided / absent: no export (SVG/PNG), no seed/reproducibility control, no pattern locking or constrained composition; the external palette provider is not a durability commitment.

## Brand Commitments

- Name: Mosaic Maker (`@repo/mosaic-maker`).
- The interface is bound to `@repo/ui`'s identity; there is no app-private visual world.
- Existing UI copy is English and action-oriented (Tile set, Shuffle Colors, Cycle Palettes, Regenerate Tiles).

## Evidence on Hand

- Sources: `src/components`, `src/core/constants.ts`, `src/core/tile-registry.ts`, `src/stores/mosaic`, `src/utils`.
- Palette dataset is fetched at runtime (external, not committed); a failure degrades to the single initial palette silently.
- No testimonials, case studies, or press exist; nothing here may fabricate them.

## Product Principles

- **Infinite variety on purpose:** no two renders repeat; coarse, partial control beats precise, exhaustive control.
- **CSS variables are the contract:** logic and rendering communicate only through `--tile-size`, `--mosaicGap`, `--color-0..4`, `--rotation-x`; nothing breaks that boundary.
- **Logic separable from UI:** pure functions stay testable without a DOM or React.
- **Independent experiment:** Mosaic Maker runs and evolves alone; PG_LAB is an audience, never a dependency.
- **Play over product:** personal toy; scope grows only when the fun demands it.

## Accessibility & Inclusion

- Inherits `@repo/ui`'s accessibility contract: keyboard-operable controls, visible focus states, touch-first (no interaction depends on hover).
- Tile transitions respect `prefers-reduced-motion`.
- No product-specific formal standard adopted.
