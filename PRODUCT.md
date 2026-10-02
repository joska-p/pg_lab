# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Primary Creator (@jpotin)**: Personal creative R&D, experimentation with generative art, GPU shaders, physics simulations, and visual toys.
- **Collaborators, Creative Coders & Curious Observers**: Exploring interactive demos, inspecting novel visual mechanisms, and reviewing documented field notes.

## Product Purpose

Creative Playground (`pg_lab`) is a recreational coding ecosystem and creative laboratory. It exists to explore visual ideas, mathematical representations (modular arithmetic, Voronoi, cellular automata, molecular scattering), GPU shaders, and interactive toys without commercial product constraints. Success means frictionless exploration, playful tactile interactions, high rendering performance (solid 60 FPS), and clean, modular, documented code.

## Positioning

"It's a playground, not a product."
Unlike conventional SaaS applications, portfolio templates, or standardized UI dashboards, `pg_lab` prioritizes creative curiosity, tactile visual immediacy, and deep technical craft (WebGL2 GPGPU, GLSL shaders, worker pools, StyleX) over conversion funnels, business metrics, or corporate design tropes.

## Operating Context

- **Environment**: Modern desktop and mobile web browsers with hardware acceleration (WebGL / WebGL2, Canvas2D, SVG).
- **Ecosystem**: High-performance monorepo powered by Vite+, React 19, TypeScript, StyleX, and Zustand. Python managed by `uv`.
- **Developer Workflow**: Fast local iteration (`vp dev`, `vp check --fix`), strict coding conventions (`codex/docs/coding-conventions.md`), fast search via `rg` / `fd`.

## Capabilities and Constraints

### Capabilities

- **GPU-accelerated graphics**: WebGL2 ping-pong state buffers, fullscreen GLSL fragment shaders, immediate-mode Canvas2D via `@repo/glaze`.
- **Isolated modular experiments**: Self-contained packages (`@repo/art-canvas`, `@repo/automa`, `@repo/mol-demo`, `@repo/mosaic-maker`, `@repo/fracture`).
- **Off-thread compute & concurrency**: Concurrency and worker lifecycle management via `@repo/worker-pool`.
- **Shared UI primitives**: StyleX-powered components and design tokens via `@repo/ui`.
- **Apps**: Main showcase and experiment navigator (`apps/playground`), quick prototype sandbox (`apps/brouillon`).

### Constraints

- **Platform**: Web platform only; target modern browsers supporting WebGL2 and modern ES modules.
- **Performance Floor**: Target 60 FPS on interactive canvas and shader surfaces; avoid CPU bottlenecking on the main thread during animations.
- **Strict Modularity**: Each experiment/package encapsulates its own state, shaders, and controls to remain liftable and independent.
- **Conventions**: French for discussions, English for code, docs, and specs (`codex/docs/coding-conventions.md`).

## Brand Commitments

- **Name**: Creative Playground (`pg_lab`)
- **Author Attribution**: @jpotin
- **Voice & Tone**: Curious, technical yet playful, understated, authentic craft. No marketing hyperbole or corporate jargon.

## Evidence on Hand

- **Committed Packages & Experiments**:
    - `apps/playground`: Main site and experiment showcase.
    - `apps/brouillon`: Scratchpad application.
    - `packages/art-canvas`: WebGL workshop container for modular shader experiments (Atlas, Unicode glyph matter).
    - `packages/automa`: WebGL2 GPGPU cellular automaton workbench.
    - `packages/glaze` / `packages/glaze3d`: Unified 2D Canvas & WebGL2 shader surface runtime.
    - `packages/mol-demo`: 3D molecule viewer with live X-ray diffraction scattering.
    - `packages/mosaic-maker`: Procedural SVG tile mosaic generator.
    - `packages/fracture`: Voronoi fracturing visual toy.
    - `packages/worker-pool`: Worker pooling, queuing, and lifecycle management.
    - `packages/ui`: Shared StyleX design system and components.
- **Documentation**: `README.md`, `codex/docs/coding-conventions.md`, `AGENTS.md`.

## Product Principles

- **Curiosity over conformity**: Build for exploration and fun; do not dilute visual or algorithmic ideas to fit conventional SaaS templates.
- **Strict modularity & liftability**: Each experiment encapsulates its own state, shaders, and controls so it can live, evolve, or be extracted independently.
- **Performance is visceral**: Frame rate, responsiveness, and compute efficiency (WebGL2, workers, zero unnecessary re-renders) directly determine the quality of the tactile experience.
- **Documented craft**: Code is written not just to run, but to be read, understood, and shared with collaborators.
