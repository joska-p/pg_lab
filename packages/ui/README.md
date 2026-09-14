# Architecture

This is a small personal UI toolkit for creative mini-apps.

The goal is to keep the system simple, composable, and focused on the few primitives actually needed.

## Stack

- **React** — builds the interactive interface.
- **StyleX** — handles component styling.
- **CSS variables** — provide semantic theme tokens.

### Responsive behavior

The application should remain functional on mobile without requiring a separate mobile UI.

The layout adapts to the viewport:

- **Portrait** → horizontal control panel
- **Landscape** → vertical control panel

The panel should remain secondary to the Canvas and be easy to show/hide.

Touch interaction is a first-class requirement. Controls must not depend on hover.

### Components

Create components only when they solve a real recurring problem.

Prefer:

```text
small components
+ composition
+ simple APIs
```

over a large generalized design system.

A component should be extracted when there is a real need for reuse, not because a pattern might exist later.

---

# UI Guidelines

The UI should feel like a **creative instrument**, not a SaaS dashboard.

The Canvas is always the visual priority. The interface should support the creative process without competing with it.

## Visual Direction

**Dark · compact · tactile · technical · spatial · slightly luminous**

The visual language is inspired by tools used for creative coding, 3D, graphics and visual experimentation.

Think:

- dark surfaces
- subtle depth
- precise controls
- discreet borders
- small luminous accents
- restrained blur
- clear interaction feedback

Avoid making the interface look like a generic admin panel.

## Color

Use semantic CSS variables rather than hardcoded colors.

```css
--color-background --color-foreground
--color-card --color-card-foreground
--color-popover --color-popover-foreground

--color-primary --color-primary-foreground
--color-secondary --color-secondary-foreground
--color-muted --color-muted-foreground
--color-accent --color-accent-foreground
--color-destructive --color-destructive-foreground
--color-success --color-success-foreground
--color-warning --color-warning-foreground

--color-border
--color-input
--color-ring
```

Every functional color has an accompanying `<color>-foreground` pair.

The raw palette lives in `gruvbox-palette.stylex.ts` (Gruvbox, in oklch) — components depend only on semantic tokens, never raw values. Both light and dark variants are driven by `prefers-color-scheme`: `bright*` accents on dark, `faded*` on light. Avoid pure black; use the multiple dark layers (dark0→dark4) for depth.

Active / focus states use `ring` + primitives; disabled state is expressed via opacity, not a dedicated token.

## Surfaces

Surfaces should feel lightweight and spatial.

Use:

- subtle differences between background and surfaces
- thin, discreet borders
- moderate corner radius
- restrained shadows

Avoid:

- huge shadows
- thick borders
- excessive rounded corners
- excessive cards

Not everything needs to look like a card.

## Blur

Backdrop blur is part of the visual identity. It complements the shadows to express **depth**: the stronger the blur, the further the surface sits from what's behind it. It should still communicate **floating UI**.

Good uses:

- floating panels
- overlays
- toolbars
- menus
- controls above the Canvas

Avoid using blur everywhere.

## Glow

Glow is an accent, not a background effect.

Use it to communicate:

- active state
- selection
- interaction
- gizmos
- handles
- important lines

Inactive elements should remain subtle.

Glow should suggest **energy**, not replace contrast.

## Borders

Borders should be quiet by default.

```text
normal  → barely visible
hover   → visible
active  → luminous
```

The UI should not be built from strong rectangular outlines.

## Typography

Typography should be compact and highly readable.

- small labels
- clear hierarchy
- restrained font sizes
- compact spacing
- monospace where numeric or technical values benefit from it

Avoid oversized headings and decorative typography.

## Control Panel

The ControlPanel should feel like an **instrument panel**.

It should be:

- compact
- dense
- scannable
- easy to manipulate
- visually secondary to the Canvas

Controls should prioritize interaction over decoration.

Sliders, toggles, color inputs and numeric values should feel precise and tactile.

## Canvas & Gizmos

The Canvas is the star of the application.

UI surrounding it should occupy as little visual attention as possible.

Gizmos can be more expressive than the rest of the interface.

They may use:

- stronger accent colors
- brighter lines
- glow
- clear selection feedback
- direct manipulation states

This is where visual intensity is most appropriate.

## Responsive UI

Mobile does not require a separate design.

The same components should adapt to smaller screens.

### Portrait

```text
┌─────────────────────────┐
│                         │
│        Canvas           │
│                         │
├─────────────────────────┤
│      Control Panel      │
└─────────────────────────┘
```

### Landscape

```text
┌───────┬─────────────────┐
│       │                 │
│ Panel │      Canvas     │
│       │                 │
└───────┴─────────────────┘
```

The orientation determines the **axis** of the panel:

```text
portrait  → horizontal
landscape → vertical
```

The exact position can remain a Shell/layout concern.

Touch targets should be comfortable enough for direct manipulation. No interaction should depend on hover.

## Animation

Animation should be fast and purposeful.

Use it for:

- state changes
- opening/closing panels
- hover/active transitions
- selection feedback
- direct manipulation

Avoid decorative or perpetual animations.

## Composition

Keep layout concerns separate from component concerns.

For example:

```tsx
<Shell>
  <Canvas />
  <ControlPanel />
</Shell>
```

If different panel containers are eventually needed:

```tsx
<FloatingPanel>
  <ControlPanel />
</FloatingPanel>
```

or:

```tsx
<DockedPanel>
  <ControlPanel />
</DockedPanel>
```

`ControlPanel` describes **what** is displayed.

The container describes **where and how** it is displayed.

Do not make `ControlPanel` responsible for positioning, docking, orientation or viewport logic.

## Design Decisions

Before adding a component or visual effect, ask:

1. Is this component actually necessary?
2. Can existing primitives compose it?
3. Does it fit the visual language?
4. Does this effect communicate something, or is it purely decorative?

The goal is not to build a complete design system.

The goal is to build a **small, coherent toolkit for creative interfaces**.

---

# StyleX

### Setup contract (lib ↔ apps)

How this library is distributed and consumed is defined in
`codex/docs/ui-setup.md` (source distribution, shared `stylex-preset`,
per-app compilation). Read it before changing `package.json` `exports`,
`vite.config.ts`, or StyleX options.

### Troubleshooting

1. Ensure the CSS file with `@stylex` is imported
2. Check that files are included in the `include` pattern
3. Verify the plugin runs before other transforms

### More resources

- `codex/docs/coding-conventions.md` and the StyleX docs in `codex/docs/` (`stylex-variants.txt`, `stylex-mindset.txt`).
- Official documentation: https://stylexjs.com
- Example projects: https://github.com/facebook/stylex/tree/main/examples
- API reference: https://stylexjs.com/docs/api
- GitHub repository: https://github.com/facebook/stylex
