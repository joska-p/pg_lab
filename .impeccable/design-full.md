---
name: PG_LAB
description: A dark-first creative coding workbench with neon-tinted surfaces and tactile controls.
colors:
    dark-ground: 'oklch(0.277 0 0)'
    dark-ground-hard: 'oklch(0.241 0.005 219.672)'
    dark-ground-soft: 'oklch(0.311 0.003 48.619)'
    warm-parchment: 'oklch(0.956 0.055 96.155)'
    warm-parchment-hard: 'oklch(0.965 0.039 100.862)'
    neutral: 'oklch(0.411 0.012 51.866)'
    gray-mid: 'oklch(0.619 0.029 67.258)'
    aurora: 'oklch(0.693 0.042 169.768)'
    solder: 'oklch(0.765 0.158 110.835)'
    purple: 'oklch(0.705 0.098 2.189)'
    amber: 'oklch(0.832 0.159 82.987)'
    error: 'oklch(0.66 0.218 30.392)'
    aqua: 'oklch(0.756 0.108 137.676)'
    orange: 'oklch(0.731 0.182 51.693)'
typography:
    label:
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
        fontSize: '0.875rem'
        fontWeight: 500
        lineHeight: 1.25
        letterSpacing: '-0.01em'
    heading:
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
        fontSize: '1.125rem'
        fontWeight: 600
        lineHeight: 1.25
        letterSpacing: '0.02em'
    value:
        fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", monospace'
        fontSize: '0.875rem'
        fontWeight: 400
        lineHeight: 1.5
    section:
        fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", monospace'
        fontSize: '0.75rem'
        fontWeight: 500
        lineHeight: 1.25
        letterSpacing: '0.02em'
rounded:
    none: '0px'
    sm: '4px'
    md: '6px'
    lg: '8px'
    xl: '12px'
    full: '9999px'
spacing:
    '0': '0px'
    '1': '4px'
    '2': '8px'
    '3': '12px'
    '4': '16px'
    '5': '20px'
    '6': '24px'
    '8': '32px'
    '10': '40px'
    '12': '48px'
    '16': '64px'
components:
    button-primary:
        backgroundColor: '{colors.neutral}'
        textColor: '{colors.warm-parchment}'
        rounded: '{rounded.md}'
        padding: '8px 16px'
    button-primary-hover:
        backgroundColor: '{colors.neutral}'
        textColor: '{colors.warm-parchment}'
    badge-solid:
        backgroundColor: '{colors.neutral}'
        textColor: '{colors.warm-parchment}'
        rounded: '{rounded.full}'
        padding: '2px 8px'
    card-soft:
        backgroundColor: '{colors.neutral}'
        textColor: '{colors.warm-parchment}'
        rounded: '{rounded.md}'
        padding: '16px'
    input-well:
        backgroundColor: '{colors.neutral}'
        textColor: '{colors.warm-parchment}'
        rounded: '{rounded.sm}'
        padding: '8px 12px'
    toggle-track:
        backgroundColor: '{colors.neutral}'
        rounded: '{rounded.full}'
        width: '34px'
        height: '20px'
---

# Design System: PG_LAB

## Overview

**Creative North Star: "The Neon Workbench"**

PG_LAB's visual system is a workshop lit by neon: a dark, dense ground where every surface earns its place through function, and color arrives as signal — a tinted glow on hover, a solid accent on a control's active state, a soft wash behind a grouped parameter panel. The interface is an instrument, not a decoration. It recedes when the experiment (canvas, shader, simulation) demands attention, and tightens when the operator needs precision.

The system is built on a **tint architecture**: one CSS variable (`tintVars.color`) sets the hue for an entire surface tree — background, border, shadow, and text derive from it through `color-mix()` in OKLCH. Its companion `tintVars.onColor` keeps text legible on a solid tint. Swapping both variables re-tints a component without touching its structure. Every surface is described by five independent axes — `color`, `background`, `border`, `radius`, `elevation` — exposed by `surfaceStyles()` in `packages/ui`.

Density is high by design. The control panel is a column of compact fields — sliders, selects, toggles, checkboxes — each with a 44px touch target but minimal visual footprint. The shell splits into a resizable panel and a stage, switching from row to column on `(orientation: portrait)`; at 1024px and above its outer gap and padding grow from 8px to 16px.

**Key Characteristics:**

- Dark-first with automatic light mode via `light-dark()` and `color-scheme`
- OKLCH palette with three tonal registers per hue: bright (light mode), neutral, faded (dark mode)
- Tint-driven surface system: one variable pair tints and labels an entire subtree
- Five orthogonal surface axes: color, background, border, radius, elevation
- Tactile interactions: `scale(0.98)` on press, neon glow on hover, focus ring on keyboard
- System font stack — no custom fonts, no loading delay
- Monospace for values, sans-serif for labels — two voices, one density

## Colors

The palette is an OKLCH ramp organized by role, not by hue. Each accent hue exists in three registers — bright (high chroma, used in light mode), neutral (medium), and faded (low chroma, used in dark mode) — selected automatically via `light-dark()`.

### Primary

- **Aurora** (oklch(0.693 0.042 169.768) bright / oklch(0.471 0.082 215.806) faded): The default accent for interactive chrome — the resize handle, active navigation, and the selection highlight. A cool teal-blue that reads as calm and functional.

### Secondary

- **Solder** (oklch(0.765 0.158 110.835) bright / oklch(0.546 0.112 106.464) faded): Success and positive states. A saturated green that evokes a soldering iron's LED — small, precise, confirmatory.
- **Amber** (oklch(0.832 0.159 82.987) bright / oklch(0.618 0.128 70.674) faded): Warm accent for highlights and attention. The brightest color in the system; used sparingly for emphasis.
- **Purple** (oklch(0.705 0.098 2.189) bright / oklch(0.489 0.124 344.276) faded): Creative and expressive accents. Used in generative art contexts and as a tinting option for surfaces.
- **Aqua** (oklch(0.756 0.108 137.676) bright / oklch(0.534 0.082 155.401) faded): Text selection color and secondary interactive accent. Cool green that complements aurora without competing.
- **Orange** (oklch(0.731 0.182 51.693) bright / oklch(0.513 0.162 39.297) faded): Warm counterpoint to the cool accents. Used in the shell background recipes and as a tinting option.

### Neutral

- **Dark Ground** (oklch(0.277 0 0)): The primary background in dark mode, and the primary text color in light mode. Pure achromatic.
- **Dark Ground Hard** (oklch(0.241 0.005 219.672)): Deepest black with a cold undertone. Used for structural shadows and overlay scrims.
- **Warm Parchment** (oklch(0.956 0.055 96.155)): The primary background in light mode, and the primary text color in dark mode. Not pure white — a warm, slightly golden off-white that softens the contrast.
- **Neutral Mid** (oklch(0.411 0.012 51.866) dark register / oklch(0.825 0.051 85.116) light register): The default surface tint and the resting color of buttons, badges, wells, and toggles.
- **Gray Mid** (oklch(0.619 0.029 67.258)): Muted strokes and labels; used directly by chart axes in experiment packages.

### Error

- **Signal Red** (oklch(0.66 0.218 30.392) bright / oklch(0.437 0.179 28.26) faded): Validation errors, invalid states. High chroma to cut through any tinted surface.

### Named Rules

**The Tint Inheritance Rule.** Every colored surface sets `tintVars.color` and `tintVars.onColor` together. Nested surfaces that need a different hue reset both variables; they never inherit `onColor` from a parent with a different tint.

**The Three-Register Rule.** No hue exists as a single value. Each has bright, neutral, and faded variants. `light-dark()` picks the right register automatically; manual selection is a code smell.

## Typography

**UI Font:** System UI stack (system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif)
**Value Font:** Monospace stack ("SFMono-Regular", Consolas, "Liberation Mono", monospace)

**Character:** Two voices sharing one density. Sans-serif carries labels, headings, and actions — everything the operator reads to understand _what_. Monospace carries values, readouts, and error messages — everything that says _how much_ or _what exactly_. The pairing is functional, not decorative: no custom fonts, no loading penalty, no typographic personality beyond clarity.

### Hierarchy

- **Heading L1** (sans semibold 600, 1.125rem, letter-spacing 0.02em, uppercase): Section titles in the control panel. All-caps with wide tracking to separate headings from dense parameter rows below. Line height is inherited, not set on the heading recipe.
- **Heading L2** (sans medium 500, 0.875rem, letter-spacing 0.02em, uppercase): Panel title, experiment name. Smaller caps that label without dominating.
- **Heading L3** (mono medium 500, 0.75rem, letter-spacing 0.02em, uppercase): Section sub-headers. Monospace at the smallest size — reads like a terminal label.
- **Label** (sans medium 500, 0.875rem, letter-spacing -0.01em): Field labels. Tight tracking to fit alongside controls; `white-space: nowrap`.
- **Value** (mono regular 400, 0.875rem): Slider readouts, text inputs, select values. `font-variant-numeric: tabular-nums` on numeric outputs.
- **Message** (mono regular 400, 0.75rem): Error messages and validation hints. Tinted with the error color.
- **Compact controls** (buttons and badges): sans medium 500, 0.875rem, line-height 1.25.

The token vocabulary also carries line heights 1.25 (tight), 1.5 (normal), and 1.75 (relaxed); only tight is applied explicitly, on buttons and badges.

### Named Rules

**The Two-Voice Rule.** Sans-serif names things; monospace measures things. Mixing them on the same element is an error.

## Layout

The shell is a **two-zone flex split**: a stage (the experiment's canvas) and a panel (the control surface). In landscape the panel sits to the right; on `(orientation: portrait)` the shell becomes a column and the panel drops to the bottom. The panel is `320px` wide by default, capped at `70%` of the shell, and capped at `50%` height in portrait. Dragging the aurora-tinted handle below `24px` collapses the panel to `16px`; the handle itself is 44×44px with keyboard support.

**Spacing rhythm:** a 4px base unit, used in named steps 0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64px. The shell's outer gap and padding are 8px, rising to 16px at `(min-width: 1024px)`. Panel content is padded 16px; card children are spaced 12px; a text field's label and control are spaced 8px, while the generic `field.col` recipe uses 4px.

**Breakpoints:** the constants `narrowMax: 720` and `wideMin: 1024` exist, but the `media.*` constants have no consumers; call sites use literal queries. Active queries are `(orientation: portrait)` for the axis switch and `(min-width: 1024px)` for shell spacing. The shell sets `containerType: inline-size`; a `container.narrow` token at 720px is defined but not yet consumed.

**Touch targets:** every interactive element has a minimum 44×44px hit area, via `min-height` on controls or an invisible `::before` on checkboxes and toggles.

**Max line width:** 62ch for text blocks.

## Elevation & Depth

The system uses a **hybrid elevation model**: structural shadows separate surfaces, and neon glow signals interaction state. All shadows are assembled with `color-mix()` in OKLCH; the values below are the literal strings produced by `packages/ui` recipes.

### Shadow Vocabulary

- **Flat** (`box-shadow: none`): The default rest state for cards, toggles, and checkboxes.
- **Raised** (`0 1px 2px color-mix(in oklab, oklch(0.241 0.005 219.672) 18%, transparent), 0 0 12px -2px color-mix(in oklab, tintVars.color 18%, transparent)`): The standard elevated state. A tight structural shadow plus a subtle tint halo. Used on buttons, badges, the stage, and the panel.
- **Sunken** (`inset 0 1px 2px color-mix(in oklab, oklch(0.241 0.005 219.672) 26%, transparent), inset 0 3px 8px color-mix(in oklab, tintVars.color 20%, color-mix(in oklab, oklch(0.241 0.005 219.672) 30%, transparent))`): Recessed wells for text inputs, selects, and textareas — the cue that a surface holds user data, not a button.

### Interaction Glow

The neon glow is not decoration — it is the signal that an element is responding to the pointer:

- **Hover glow** (`0 1px 3px color-mix(in oklab, oklch(0.241 0.005 219.672) 22%, transparent), 0 0 20px -2px color-mix(in oklab, tintVars.color 32%, transparent)`): paired with the 8% foreground overlay.
- **Active glow** (`0 1px 2px color-mix(in oklab, oklch(0.241 0.005 219.672) 20%, transparent), 0 0 28px -1px color-mix(in oklab, tintVars.color 48%, transparent)`): paired with `scale(0.98)` and the 14% foreground overlay.

### Named Rules

**The Glow-as-State Rule.** Glow is never decorative. It appears on hover, intensifies on press, and disappears at rest. A permanently glowing element is a bug.

**The Structural Shadow Rule.** Shadows separate surfaces (stage from panel, well from panel). They don't float elements above the page — the flat-by-default ground makes raised surfaces meaningful.

## Shapes

The form language is **gently rounded, never circular except for pills**. Radius steps are none (0px), small (4px), medium (6px, the default), large (8px), extra-large (12px), and full (9999px). Small radii mark input wells and checkboxes; medium marks cards, panels, buttons, and the stage; full marks badges, toggles, slider thumbs, the resize handle, and the theme toggle.

Borders are always 1px (`hairline`), tinted with the surface's color at 38% (subtle) or 72% (strong) opacity via `color-mix()`. Borders never carry their own color — they derive from the tint variable. The toggle knob is the one current exception to the pill vocabulary: `Toggle.tsx` still sets `border-radius: 50%` on its 14px knob.

## Components

### Buttons

Tactile, tint-driven, with three elevation states. Defaults: `color=neutral`, `background=solid`, `border=subtle`, `radius=md`, `elevation=raised`.

- **Shape:** Gently rounded (6px), inline-flex centered, 8px vertical / 16px horizontal padding, min-height 44px
- **Hover:** 8% foreground overlay, glow at 32%, pointer cursor
- **Active:** `scale(0.98)`, 14% foreground overlay, glow at 48%
- **Focus:** 2px solid `surface.foreground` outline, 2px offset
- **Disabled:** `opacity: 0.45`, `cursor: not-allowed`, no interaction effects

### Badges / Chips

Small status indicators that use the full surface system. Defaults: `color=neutral`, `background=solid`, `border=subtle`, `radius=full`, `elevation=raised`.

- **Shape:** Pill (9999px), 4px internal gap, 2px block / 8px inline padding
- **Typography:** Sans medium 0.875rem, line-height 1.25

### Cards / Containers

Quiet containers that group content without competing with it. Defaults: `color=neutral`, `background=soft`, `border=subtle`, `radius=md`, `elevation=flat`.

- **Background:** Soft tinted wash — the tint at 25% over the page background, then 60% opacity
- **Border:** Subtle (1px tint at 38%)
- **Internal spacing:** 16px padding, 12px gap between children

### Inputs / Fields (Wells)

Recessed wells that signal "data goes here." Defaults: `color=neutral`, `background=soft`, `border=strong`, `radius=sm`, `elevation=sunken`.

- **Style:** Strong border (tint at 72%), 4px radius, min-height 44px, 8px block / 12px inline padding
- **Typography:** Monospace value, sans label; error messages in mono 0.75rem
- **Focus:** 2px solid `surface.foreground` outline, 2px offset
- **Invalid:** Tint switches to `error` (red)
- **Disabled:** `opacity: 0.45`, `cursor: not-allowed`

### Sliders

Custom range controls with a three-part anatomy: a soft tinted rail, a solid tinted fill, and a solid tinted thumb.

- **Rail:** 6px height, full-radius, clipped by `overflow: hidden`
- **Thumb:** 18px square rendered as a circle by `radius.full`, raised elevation; scales to 1.1× on hover, 0.94× on press
- **Value readout:** Monospace, tabular-nums, right-aligned, 40px min-width
- **Focus:** 3px solid `tintVars.color` outline on the thumb, 3px offset
- **Motion:** 120ms transform; reduced motion uses `0ms` here, while other recipes use `1ms`

### Toggles

Checkbox-role switches with a sliding knob. Defaults: `color=neutral`, `background=solid`, `border=strong`, `radius=full`, `elevation=flat`.

- **Track:** 34×20px, solid tinted background, strong border
- **Knob:** 14px, `currentColor`, 2px inset, slides 16px on check; opacity 0.5 → 1
- **Motion:** 120ms ease-out, 1ms under `prefers-reduced-motion`
- **Touch target:** Invisible 44×44px `::before`

### Checkboxes

Compact 18×18px squares with a 12px SVG checkmark mask. Defaults: `color=neutral`, `background=solid`, `border=strong`, `radius=sm`, `elevation=flat`. The check is always rendered but only colored on `:checked`; the invisible 44×44px `::before` carries the hit area.

### Selects

Native `<select>` styled as a well — soft background, strong border, 4px radius, sunken shadow, monospace value — with a 12px inline SVG chevron.

### Experiment Shell (Signature Component)

The two-zone layout that hosts every experiment. A resizable panel (default 320px) alongside a stage, switching axis on orientation change. The resize handle is an aurora-tinted solid button at the panel edge, draggable with pointer capture and operable from the keyboard. The panel collapses to 16px when dragged below threshold.

## Do's and Don'ts

### Do:

- **Do** set `tintVars.color` and `tintVars.onColor` together on every tinted surface. Never set one without the other.
- **Do** use `color-mix(in oklab, ...)` for all tint-derived backgrounds, borders, and shadows. The mix percentages are the system's vocabulary: 25% for soft backgrounds, 38% for subtle borders, 72% for strong borders, 18% for the resting halo, 32%/48% for hover/active glow.
- **Do** use `light-dark()` for every color that adapts to theme. Never branch with a media query when `light-dark()` works.
- **Do** respect `prefers-reduced-motion: reduce` on every transition. Use `1ms` as the reduced duration in shared recipes (`interactions.pressable`, `Toggle`); the slider thumb currently uses `0ms` and should be aligned on the next pass.
- **Do** keep every interactive element at or above the 44×44px touch target, using an invisible `::before` when the visual element is smaller.
- **Do** compose surfaces from the five axes `color`, `background`, `border`, `radius`, `elevation` via `surfaceStyles()`.

### Don't:

- **Don't** apply a permanent glow or shadow as decoration. Glow signals state; shadows signal elevation. A resting element should be flat or raised — never glowing.
- **Don't** use hardcoded color values inside `packages/ui` components. All colors flow through `tintVars.color`, `tintVars.onColor`, `surface.foreground`, or `surface.background`. Direct palette references belong in token definitions (and in experiment-specific chart code, which is outside the shared primitives).
- **Don't** mix sans-serif and monospace within a single text element. Labels are sans; values are mono. If a string serves both roles, split it into two elements.
- **Don't** introduce new hues outside the eight named tints (neutral, aurora, solder, purple, amber, error, aqua, orange). The palette is closed by design; each hue exists in three registers and needs all three to work.
- **Don't** add ad-hoc circular radii. Use `radius.full` (9999px), which produces a pill on rectangles and a circle on squares. The toggle knob's `50%` is a holdout to migrate, not a precedent.
