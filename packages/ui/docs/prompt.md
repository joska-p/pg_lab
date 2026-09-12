You are responsible for creating the **theme foundation** of a small personal UI toolkit for creative mini-apps. @packages/ui

The project setup is already complete. Do not modify the build setup, React configuration, or StyleX configuration unless strictly necessary.

Read:

- `@packages/ui/README.md`
- `@packages/ui/docs/guidelines.md`
- `@packages/ui/docs/stylex-authoring.md`

before making any changes.

## Goal

Create a small, coherent **StyleX theme system** that will become the visual foundation for the entire toolkit.

The theme should define:

- colors
- spacing
- typography
- radii
- borders
- shadows
- motion
- useful component/state variants

The system should be intentionally small.

This is a personal toolkit, not a public design system.

Do not try to anticipate every possible UI component.

---

# 1. Core principle

The theme should separate:

```text
design decisions
        ↓
semantic tokens
        ↓
StyleX components
```

Components should consume semantic tokens.

They should not know whether the underlying palette is Gruvbox, another palette, or a future custom theme.

For example, prefer:

```text
background
surface
text
textMuted
accent
border
```

over:

```text
gruvboxDark0
gruvboxDark1
gruvboxOrange
```

The Gruvbox-inspired palette is an implementation detail of the theme.

---

# 2. Color tokens

Create a restrained dark palette inspired by Gruvbox Dark.

Start with only the colors actually needed by the UI.

Use semantic tokens such as:

```text
background
surface
surfaceElevated

text
textMuted
textDisabled

border
borderHover
borderActive

accent
accentHover
accentActive

success
warning
error
```

Add additional semantic tokens only when there is a concrete need.

The hierarchy should communicate depth:

```text
background
    ↓
surface
    ↓
surfaceElevated
```

Avoid pure black as the default background.

The UI should feel warm, dark and tactile rather than completely black and cold.

## Interaction states

The theme should provide enough semantic values for:

```text
default
hover
active
disabled
focus
```

Do not create dozens of state-specific colors.

Prefer subtle changes in luminance or opacity when possible.

---

# 3. Accent philosophy

The accent color is an interaction signal.

It should be used for:

- active controls
- selected elements
- focus
- important interaction feedback
- gizmos
- creative parameters that need attention

It should not dominate the entire interface.

Glow should remain a component-level treatment rather than becoming the default appearance of everything.

---

# 4. Spacing

Create a small spacing scale.

Do not create a huge design-system-style scale.

Something along the lines of:

```text
xs
sm
md
lg
xl
```

or a similarly small set if that fits the project better.

The scale should support:

- compact control rows
- panel padding
- gaps between controls
- section spacing
- small overlays

The UI should generally feel dense and compact.

Avoid excessive whitespace.

However, do not make touch interfaces uncomfortably dense.

The spacing system should allow controls to maintain reasonable touch targets.

---

# 5. Typography

Create a small typography system.

At minimum, provide semantic roles for:

```text
body
label
value
caption
```

Potentially:

```text
heading
```

only if actually needed.

The visual direction is:

- compact
- technical
- readable
- restrained

Control labels should generally be small.

Numeric / technical values may use a monospace font when appropriate.

Do not create a large typography scale.

Avoid oversized headings.

The theme should define only the properties that are genuinely useful:

- font family
- font size
- line height
- font weight
- letter spacing where useful

---

# 6. Radii

Create a very small radius scale.

For example:

```text
sm
md
lg
```

The UI should use moderate rounding.

Avoid:

- pill-shaped controls by default
- extremely rounded panels
- excessive card-like styling

The toolkit should feel like a creative instrument, not a mobile SaaS application.

---

# 7. Borders

Define semantic border values.

At minimum:

```text
border
borderHover
borderActive
```

Normal borders should be subtle.

The intended progression is:

```text
normal → barely visible
hover  → visible
active → more pronounced / luminous
```

Do not rely on thick borders for hierarchy.

---

# 8. Shadows and elevation

Keep elevation restrained.

Define only a very small number of useful elevation/shadow tokens if needed.

For example:

```text
shadowPanel
shadowOverlay
```

Do not create a generic Material Design-like elevation system.

Floating UI can use a combination of:

```text
surfaceElevated
border
shadow
backdrop blur
```

rather than huge shadows.

---

# 9. Backdrop blur

Blur is part of the visual identity of floating UI.

Define a small semantic blur scale if the project benefits from it.

For example:

```text
blurPanel
blurOverlay
```

Do not make blur a default property of surfaces.

Its purpose is to communicate:

> this UI is floating above the Canvas.

---

# 10. Motion

Create a minimal motion foundation.

At minimum, define durations for:

```text
fast
normal
slow
```

and appropriate easing values.

The intended motion language is:

- fast
- subtle
- purposeful

Motion is primarily for:

- hover
- active state
- focus
- opening/closing panels
- selection
- direct manipulation feedback

Avoid decorative animations.

Do not create a complex animation framework.

The theme should provide tokens that components can consume.

---

# 11. Z-index / layering

If useful for the architecture, define a tiny semantic layering scale.

For example:

```text
base
canvas
overlay
panel
modal
```

Keep it minimal.

The purpose is to prevent arbitrary z-index values from spreading through components.

Do not create a large numerical hierarchy.

---

# 12. StyleX variants

Create StyleX variants only where they represent meaningful visual states.

Useful examples might include:

```text
interactive
disabled
active
selected
```

But do not build variants for every conceivable combination.

The goal is to make component code readable.

For example, a component should eventually be able to express something conceptually like:

```tsx
styles.control;
styles.active;
styles.disabled;
```

rather than manually reconstructing visual states.

Do not create a generic `Variant` abstraction unless the project already has one.

Use native StyleX composition and patterns.

---

# 13. Theme architecture

Keep the architecture simple.

A reasonable conceptual structure is:

```text
theme/
├── tokens
├── theme
└── variables
```

The exact file structure is up to the existing project conventions.

Do not introduce unnecessary layers.

The important separation is:

```text
raw palette
     ↓
semantic theme tokens
     ↓
StyleX styles
     ↓
components
```

Components should never depend directly on the raw palette.

---

# 14. Future themes

Do not implement a complete multi-theme system yet.

However, structure semantic tokens so that changing the underlying palette later is possible.

For example:

```text
--color-background
```

should be the stable contract.

The actual color behind it can change later.

Do not add:

```text
light theme
high contrast theme
blue theme
etc.
```

unless the existing project already requires them.

Build the foundation, not the future.

---

# 15. Responsive considerations

The theme itself should not contain application layout logic.

Do not put:

- portrait/landscape logic
- panel positioning
- Canvas sizing
- breakpoints for application layout

into the theme.

Those belong to `Shell`.

The theme may contain values useful for responsive components, but it should remain a visual foundation rather than a layout system.

---

# 16. Accessibility

The visual direction is intentionally subtle, but subtle must not mean unreadable.

Ensure:

- text has sufficient contrast
- disabled states remain understandable
- focus states are visible
- active states are distinguishable without relying only on glow
- controls remain usable on touch devices

Do not sacrifice usability for aesthetics.

---

# 17. What NOT to build

Do not create:

- a complete design system
- dozens of tokens
- a generic component variant engine
- a theme provider abstraction unless required
- dark/light theme switching
- responsive layout primitives
- a spacing utility framework
- a typography framework
- component-specific tokens for components that do not exist yet
- unnecessary abstractions

If a token has no clear consumer, question whether it needs to exist.

---

# 18. Validation

After implementing the theme, create a small internal/demo page or equivalent test surface if the project already has an appropriate place for it.

The goal is to visually inspect:

- background layers
- text hierarchy
- borders
- accent
- states
- typography
- spacing
- radii
- blur
- shadows
- motion

Do not build the actual `Shell`, `ControlPanel`, or controls as part of this task.

The theme should be usable by those components afterward.

---

# 19. Final quality criteria

Before finishing, verify:

- all component-facing values are semantic
- raw palette values are isolated
- StyleX consumes the theme correctly
- the token set is small
- naming is consistent
- there are no unnecessary abstractions
- there are no arbitrary duplicated values
- the visual language matches `UI_GUIDELINES.md`
- the system is easy to modify later

When choosing between two implementations, prefer the one with fewer concepts and fewer files.

The desired result is not a sophisticated design system.

It is a **small, coherent visual language that makes the next components easy to build**.

The final dependency direction should look approximately like:

```text
Theme
  ↓
StyleX
  ↓
Shell / ControlPanel / Controls
  ↓
Creative mini-apps
```

Do not reverse these dependencies.
