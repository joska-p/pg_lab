# Prompt — Visual gallery for `@repo/ui`

You are responsible for building a **simple visual gallery** for the `@repo/ui` library
(like a minimalist, hand-rolled Storybook). It lives in `@repo/ui-demo`.

The only deliverable is a single page: `@repo/ui-demo/src/App.tsx`. No router, no
external dependencies, no new build setup, no complex layout, no over-engineering.
The point is to **see** what the library offers and get a feel for the design language.

## Read first

- `@repo/ui/README.md`
- `@repo/ui/docs/guidelines.md` (visual direction — dark, compact, tactile, technical, luminous)
- `@repo/ui/docs/stylex-authoring.md` (how to author StyleX styles)
- `@repo/ui/src/theme/tokens.stylex.ts`, `@repo/ui/src/theme/consts.stylex.ts`,
  `@repo/ui/src/theme/effects.stylex.ts` (know the exact token names you consume)
- `@repo/ui/src/primitives/interactive.stylex.ts`
- `@repo/ui/src/components/` (`Slider.tsx`, `Toggle.tsx`, `ColorField.tsx`, `Segmented.tsx`)

## Current state

- `@repo/ui` exposes a semantic theme + shared primitives + 4 widgets, all exported from
  `@repo/ui/src/index.ts`.
- `@repo/ui-demo/src/App.tsx` is currently a placeholder (`return null`).
  Replace it with the gallery. You may adjust `src/main.tsx` / `src/index.css` only if
  strictly necessary.

## Goal

Build one clean page that gives an honest visual inventory of the library:

1. **Theme foundation** — present the semantic tokens visually, not as text lists:
   - surfaces (background, card, popover) as stacked surfaces showing depth
   - text levels (foreground, muted, mutedForeground) as type samples
   - accent/primary/secondary/warning/success/destructive families
   - spacing scale, radius scale, border, effects (raised/floating/glow), motion durations
   - typography (families, sizes, weights)
2. **Shared primitives** — demonstrate `primitives.*` (`interactive`, `focusRing`,
   `selected`, `active`, `disabled`, `label`, `value`) on small buttons/rows.
3. **Widgets** — show `Slider`, `Toggle`, `ColorField`, `Segmented` in their meaningful
   states: default, disabled, and a couple of **live** examples (use `useState`) where
   moving a control visibly changes something on the page (e.g. a color field recolors an
   orb, a slider scales/blurs an element, a segmented switch flips a mode). Keep these
   demos tiny — a handful at most. Do not build a miniature application.

The page must feel like a **creative instrument**, not an admin catalog: dark surfaces,
discreet borders, restrained glow, compact monospace values. Consume the tokens and
primitives from `@repo/ui`; never hardcode colors.

## Constraints

- Import everything from `@repo/ui` source deep paths for live dev, e.g.:
  ```ts
  import * as stylex from "@stylexjs/stylex";
  import { colors, radius, space, typography } from "@repo/ui/src/theme/tokens.stylex.ts";
  import { primitives } from "@repo/ui/src/primitives/interactive.stylex.ts";
  import { Slider } from "@repo/ui/src/components/Slider.tsx";
  ```
- Style the page itself with the same tokens/primitives. No raw CSS values.
- Single `App.tsx` is the default. Split files only if a coherent section makes it
  significantly more readable.
- Accessibility: real labels for controls, visible focus states, no hover-only
  interaction.
- React 19, React Compiler enabled: no `useMemo`/`useCallback`.
- Code and inline comments in English; names communicate intent.

## Validation

- Run `vp check` in `packages/ui-demo` until it is fully green (format, lint, types).
- Run `vp dev` in `packages/ui-demo` and confirm the page renders and the live widget
  demos actually respond.

## Out of scope

- Shell / Canvas / ControlPanel layout system, responsive panel behaviors, routing,
  theming toggles, testing frameworks, Storybook or similar tooling, and any change to
  the `@repo/ui` library itself.
