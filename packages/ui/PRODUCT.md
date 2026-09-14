# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two developers (the author and a collaborator) building private creative mini-apps: interactive visual experiments, generative or canvas-driven tooling. Their job is rapid iteration — assemble an interface from trusted primitives, verify look and behavior in a real app, and move on without reinventing UI.

## Product Purpose

`@repo/ui` is a small, coherent, composable UI toolkit for creative mini-apps used across this monorepo's apps. It intentionally stays small: few primitives, simple APIs, composition over a generalized design system. A component exists only when it solves a real, recurring problem. Success means an app can be built from trusted building blocks and keep the canvas they control as the visual priority.

## Positioning

A lightweight, StyleX-powered toolkit whose interfaces feel like a creative instrument — precise, tactile, technical — rather than a SaaS dashboard. The scaffolding stays visually secondary to the canvas it surrounds. Technically it is distributed as StyleX source so every app compiles exactly the atomic CSS it uses: no global stylesheet, no library rebuild before dev.

## Operating Context

- Monorepo driven by Vite+; apps consume `@repo/ui` workspace source and compile it per-app with `unplugin-stylex` using the library-owned `stylexPreset`.
- `apps/dev` is the reference implementation and test bed where components are exercised in a real surface.
- Responsive behavior is built in, not a separate mobile design: portrait stacks the control panel under the canvas, landscape docks it beside. Touch is a first-class requirement; no interaction depends on hover.
- Setup, distribution and authoring contracts live in `codex/docs/` (`ui-setup.md`, `component-authoring.md`, `coding-conventions.md`, StyleX notes).

## Capabilities and Constraints

- React + StyleX; styling via semantic CSS-variable tokens; dual-mode tokens via `light-dark()`, with the color scheme driven by an app's `color-scheme` property (light, dark, or system-driven).
- ~25 primitives today: inputs and widgets (Slider, Toggle, Button, Select, Checkbox, RadioGroup, NumberField, TextInput, TextArea, ColorField, Segmented), layout and shell (Stack, Card, ControlSection, ControlPanel, Stage, ShellWrapper, ExperimentShell), display (Text, SectionHeading, Badge, Readout, Swatch).
- Source distribution: `package.json` exports point at `src`; `@stylexjs/stylex` is a peer dependency and never inlined.
- **Private, internal only** — no public distribution, packaging-for-npm, or API-stability burden.
- **Confirmed scope: creative mini-apps only.** Static content surfaces (docs, marketing) are not a near-term consumer.
- Deliberately small scope ("tout garder", Phase A keeps everything in `@repo/ui`); extract a component only on real reuse.

## Brand Commitments

- Name: `@repo/ui`.
- Gruvbox palette is the theme foundation.
- Binding identity: the UI must feel like a creative instrument, not a SaaS dashboard; canvas is always the visual priority.
- The visual language lives in the existing README and tokens, not in this record.

## Evidence on Hand

- Component sources: `packages/ui/src` (theme/behaviors/components).
- Reference/test app: `apps/dev` (its own PRODUCT.md covers the dev-app surface separately).
- Setup contract: `codex/docs/ui-setup.md`; authoring rules in `codex/docs/component-authoring.md` and `codex/docs/coding-conventions.md`.
- No public testimonials, case studies, press, or third-party usage exists; nothing here may fabricate them.

## Product Principles

- **Composability over breadth:** small components, composition, simple APIs; never grow toward a generalized design system.
- **Canvas-first:** surrounding UI occupies minimal attention and never competes with the work surface.
- **Pay only for what you use:** per-app StyleX compilation keeps every consumer's CSS small and deterministic.
- **Restraint:** every component or effect must prove a real recurring need and earn its place.
- **Private by construction:** internal consumers only, so the toolkit stays lean instead of serving a public audience.

## Accessibility & Inclusion

- Best-effort per component, no formal standard adopted: controls are keyboard-operable, expose focus-visible states, and use semantic elements by default.
- Touch input is required — interaction never depends on hover.
- A formal standard (e.g., WCAG) remains an explicitly undecided objective.
