---
name: PG_LAB
description: A dark-first creative coding workbench with neon-tinted surfaces and tactile controls.
colors:
  dark-ground: "oklch(0.277 0 0)"
  dark-ground-hard: "oklch(0.241 0.005 219.672)"
  dark-ground-soft: "oklch(0.311 0.003 48.619)"
  warm-parchment: "oklch(0.956 0.055 96.155)"
  warm-parchment-hard: "oklch(0.965 0.039 100.862)"
  neutral: "oklch(0.411 0.012 51.866)"
  aurora: "oklch(0.693 0.042 169.768)"
  solder: "oklch(0.765 0.158 110.835)"
  purple: "oklch(0.705 0.098 2.189)"
  amber: "oklch(0.832 0.159 82.987)"
  error: "oklch(0.66 0.218 30.392)"
  aqua: "oklch(0.756 0.108 137.676)"
  orange: "oklch(0.731 0.182 51.693)"
typography:
  label:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.25
    letterSpacing: "-0.01em"
  heading:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "0.02em"
  value:
    fontFamily: "\"SFMono-Regular\", Consolas, \"Liberation Mono\", monospace"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  section:
    fontFamily: "\"SFMono-Regular\", Consolas, \"Liberation Mono\", monospace"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.25
    letterSpacing: "0.02em"
rounded:
  none: "0px"
  sm: "4px"
  md: "6px"
  lg: "8px"
  xl: "12px"
  full: "9999px"
spacing:
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "5": "20px"
  "6": "24px"
  "8": "32px"
  "10": "40px"
  "12": "48px"
  "16": "64px"
components:
  button-primary:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.warm-parchment}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  button-primary-hover:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.warm-parchment}"
  badge-solid:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.warm-parchment}"
    rounded: "{rounded.full}"
    padding: "2px 8px"
  card-soft:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.warm-parchment}"
    rounded: "{rounded.md}"
    padding: "16px"
  input-well:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.warm-parchment}"
    rounded: "{rounded.sm}"
    padding: "8px 12px"
  toggle-track:
    backgroundColor: "{colors.neutral}"
    rounded: "{rounded.full}"
    width: "34px"
    height: "20px"
---

# Design System: PG_LAB

## Overview

**Creative North Star: "The Neon Workbench"**

PG_LAB's visual system is a workshop lit by neon: a dark, dense ground where every surface earns its place through function, and color arrives as signal — a tinted glow on hover, a solid accent on a control's active state, a soft wash behind a grouped parameter panel. The interface is an instrument, not a decoration. It recedes when the experiment (canvas, shader, simulation) demands attention, and tightens when the operator needs precision.

The system is built on a **tint architecture**: a single CSS variable (`tintVars.color`) sets the hue for an entire surface tree — background, border, shadow, and text all derive from it through `color-mix()` in OKLCH. Swapping one variable re-tints an entire component without touching its structure. This makes the palette composable rather than fixed: any of the eight named tints can dress any surface recipe.

Density is high by design. The control panel is a column of compact fields — sliders, selects, toggles, checkboxes — each with a 44px touch target but minimal visual footprint. The shell splits into a resizable panel and a stage, adapting from landscape (panel right) to portrait (panel bottom) with no breakpoint gap.

**Key Characteristics:**
- Dark-first with automatic light mode via `light-dark()` and `color-scheme`
- OKLCH palette with three tonal registers per hue: bright (light mode), neutral, and faded (dark mode)
- Tint-driven surface system: one variable tints an entire subtree
- Tactile interactions: `scale(0.98)` on press, neon glow on hover, focus ring on keyboard
- System font stack — no custom fonts, no loading delay
- Monospace for values, sans-serif for labels — two voices, one density

## Colors

The palette is an OKLCH ramp organized by role, not by hue. Each hue exists in three registers — bright (high chroma, used in light mode), neutral (medium), and faded (low chroma, used in dark mode) — selected automatically via `light-dark()`.

### Primary

- **Aurora** (oklch(0.693 0.042 169.768) bright / oklch(0.471 0.082 215.806) faded): The default accent for interactive chrome — the resize handle, active navigation, and the selection highlight. A cool teal-blue that reads as calm and functional.

### Secondary

- **Solder** (oklch(0.765 0.158 110.835) bright / oklch(0.546 0.112 106.464) faded): Success and positive states. A saturated green that evokes a soldering iron's LED — small, precise, confirmatory.
- **Amber** (oklch(0.832 0.159 82.987) bright / oklch(0.618 0.128 70.674) faded): Warm accent for highlights and attention. The brightest color in the system; used sparingly for emphasis.
- **Purple** (oklch(0.705 0.098 2.189) bright / oklch(0.489 0.124 344.276) faded): Creative and expressive accents. Used in generative art contexts and as a tinting option for surfaces.
- **Aqua** (oklch(0.756 0.108 137.676) bright / oklch(0.534 0.082 155.401) faded): Text selection color and secondary interactive accent. Cool green that complements aurora without competing.
- **Orange** (oklch(0.731 0.182 51.693) bright / oklch(0.513 0.162 39.297) faded): Warm counterpoint to the cool accents. Used in shell background gradients and as a tinting option.

### Neutral

- **Dark Ground** (oklch(0.277 0 0)): The primary background in dark mode, and the primary text color in light mode. Pure achromatic.
- **Dark Ground Hard** (oklch(0.241 0.005 219.672)): Deepest black with a cold undertone. Used for hard shadows and overlay scrims.
- **Warm Parchment** (oklch(0.956 0.055 96.155)): The primary background in light mode, and the primary text color in dark mode. Not pure white — a warm, slightly golden off-white that softens the contrast.
- **Gray Mid** (oklch(0.619 0.029 67.258)): The midpoint between ground and foreground. Used for muted text and decorative borders.

### Error

- **Signal Red** (oklch(0.66 0.218 30.392) bright / oklch(0.437 0.179 28.26) faded): Validation errors, invalid states. High chroma to cut through any tinted surface.

### Named Rules

**The Tint Inheritance Rule.** Every colored surface sets `tintVars.color` and `tintVars.onColor` together. Nested surfaces that need a different hue reset both variables; they never inherit `onColor` from a parent with a different tint.

**The Three-Register Rule.** No hue exists as a single value. Each has bright, neutral, and faded variants. `light-dark()` picks the right register automatically; manual selection is a code smell.

## Typography

**UI Font:** System UI stack (system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif)
**Value Font:** Monospace stack ("SFMono-Regular", Consolas, "Liberation Mono", monospace)

**Character:** Two voices sharing one density. Sans-serif carries labels, headings, and actions — everything the operator reads to understand *what*. Monospace carries values, readouts, and error messages — everything that says *how much* or *what exactly*. The pairing is functional, not decorative: no custom fonts, no loading penalty, no typographic personality beyond clarity.

### Hierarchy

- **Heading L1** (semibold 600, 1.125rem, line-height 1.25, letter-spacing 0.02em, uppercase): Section titles in the control panel. All-caps with wide tracking to separate headings from dense parameter rows below.
- **Heading L2** (medium 500, 0.875rem, line-height 1.25, letter-spacing 0.02em, uppercase): Panel title, experiment name. Smaller caps that label without dominating.
- **Heading L3** (mono medium 500, 0.75rem, line-height 1.25, letter-spacing 0.02em, uppercase): Section sub-headers. Monospace at the smallest size — reads like a terminal label.
- **Label** (sans medium 500, 0.875rem, line-height 1.25, letter-spacing -0.01em): Field labels. Tight tracking to fit alongside controls. `white-space: nowrap`.
- **Value** (mono regular 400, 0.875rem, line-height 1.5): Slider readouts, text inputs, select values. `font-variant-numeric: tabular-nums` on numeric outputs.
- **Message** (mono regular 400, 0.75rem): Error messages and validation hints. Tinted with the error color.

### Named Rules

**The Two-Voice Rule.** Sans-serif names things; monospace measures things. Mixing them on the same element is an error.

## Layout

The shell is a **two-zone split**: a stage (the experiment's canvas) and a panel (the control surface). In landscape, the panel sits to the right at a default width of 320px, resizable by dragging a handle. In portrait (detected via `orientation: portrait`), the panel drops to the bottom with a max height of 50%. The panel collapses to 16px when dragged below threshold.

**Spacing rhythm:** a 4px base unit, used in named steps: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64px. The gap between panel and stage is 12px. Internal panel padding is 16px. Field gaps are 8px (between label and control) or 12px (between fields).

**Breakpoints:** narrow at ≤720px, wide at ≥1024px. The system also uses container queries (`@container (max-width: 720px)`) for the panel's internal layout.

**Touch targets:** every interactive element has a minimum 44×44px hit area, often via an invisible `::before` pseudo-element that expands the clickable zone.

**Max line width:** 62ch for text blocks.

## Elevation & Depth

The system uses a **hybrid elevation model**: structural shadows separate surfaces, and neon glow signals interaction state.

### Shadow Vocabulary

- **Flat** (`box-shadow: none`): The default rest state for most surfaces. Cards, toggles, and checkboxes are flat at rest.
- **Raised** (`0 1px 2px dark-ground-hard/18%, 0 0 12px -2px tint/18%`): The standard elevated state. The first layer is a tight structural shadow; the second is a subtle tint-colored glow. Used on buttons, badges, the stage, and the panel.
- **Sunken** (`inset 0 1px 2px dark-ground-hard/26%, inset 0 3px 8px tint+dark/20-30%`): Recessed wells. Text inputs, selects, and textareas live in a sunken surface — the visual cue that this is a container for user data, not a button.

### Interaction Glow

The neon glow is not decoration — it is the primary signal that an element is responding to the pointer:

- **Hover glow** (`0 0 20px -2px tint/32%`): The tint color radiates outward. Combined with a foreground overlay at 8% opacity.
- **Active glow** (`0 0 28px -1px tint/48%`): The glow intensifies and tightens. Combined with `scale(0.98)` and a foreground overlay at 14%.

### Named Rules

**The Glow-as-State Rule.** Glow is never decorative. It appears on hover, intensifies on press, and disappears at rest. A permanently glowing element is a bug.

**The Structural Shadow Rule.** Shadows separate surfaces (stage from panel, well from panel). They don't float elements above the page — the flat-by-default ground makes raised surfaces meaningful.

## Shapes

The form language is **gently rounded, never circular except for pills**. The radius scale runs from 0 to 9999px:

- **None** (0px): No rounding. Used for the stage at mobile viewport.
- **Small** (4px): Barely rounded. Input wells and checkboxes — small controls that shouldn't look like buttons.
- **Medium** (6px): The default. Cards, panels, buttons, and the stage at desktop. Visible but restrained.
- **Large** (8px): Slightly more pronounced. Accent containers.
- **Extra-large** (12px): Reserved for prominent containers.
- **Full** (9999px): Pill shape. Badges, toggles, sliders, the theme toggle, and the resize handle. Used for elements that should read as self-contained capsules.

Borders are always 1px (`hairline`), tinted with the surface's color at 38% (subtle) or 72% (strong) opacity via `color-mix()`. Borders never carry their own color — they derive from the tint variable.

## Components

### Buttons

Tactile, tint-driven, with three elevation states.

- **Shape:** Gently rounded (6px radius by default)
- **Primary:** Solid tinted background, `onColor` text, inline-flex centered, 8px vertical / 16px horizontal padding, min-height 44px
- **Hover:** Foreground overlay at 8%, glow intensifies to `tint/32%`, cursor pointer
- **Active:** `scale(0.98)`, foreground overlay at 14%, glow to `tint/48%`
- **Focus:** 2px solid `surface.foreground` outline, 2px offset
- **Disabled:** `opacity: 0.45`, `cursor: not-allowed`, no interaction effects
- **Defaults:** `color=neutral`, `background=solid`, `border=subtle`, `radius=md`, `elevation=raised`

### Badges / Chips

Small status indicators that use the full surface system.

- **Shape:** Pill (9999px radius)
- **Style:** Solid tinted background, compact padding (2px block / 8px inline), sans medium 0.875rem
- **Defaults:** `color=neutral`, `background=solid`, `border=subtle`, `radius=full`, `elevation=raised`

### Cards / Containers

Quiet containers that group content without competing with it.

- **Corner Style:** Gently rounded (6px)
- **Background:** Soft tinted wash (`color-mix` at 25% tint, 60% opacity)
- **Border:** Subtle (1px tinted at 38%)
- **Shadow:** Flat at rest
- **Internal Padding:** 16px, gap 12px between children
- **Defaults:** `color=neutral`, `background=soft`, `border=subtle`, `radius=md`, `elevation=flat`

### Inputs / Fields (Wells)

Recessed wells that signal "data goes here."

- **Style:** Soft tinted background, strong border (tint at 72%), small radius (4px), sunken shadow
- **Touch Target:** 44px min-height, padding 8px block / 12px inline
- **Typography:** Monospace for the value, sans for the label
- **Focus:** 2px solid `surface.foreground` outline, 2px offset
- **Error:** Tint switches to `error` (red), message appears in mono 0.75rem
- **Disabled:** `opacity: 0.45`, `cursor: not-allowed`

### Sliders

Custom-built range controls with a three-part anatomy: track (soft tinted rail), fill (solid tinted), and thumb (solid tinted pill with raised elevation).

- **Rail:** 6px height, full-radius, soft tinted background
- **Thumb:** 18px circle, solid tinted, with raised shadow. Scales to 1.1× on hover, 0.94× on press
- **Value readout:** Monospace, tabular-nums, right-aligned, 40px min-width
- **Focus:** 3px solid `tint.color` outline on the thumb, 3px offset

### Toggles

Checkbox-role switches with a sliding knob.

- **Track:** 34×20px, full-radius, solid tinted background, strong border
- **Knob:** 14px circle, `currentColor`, slides 16px on check
- **Unchecked:** Knob at 50% opacity. **Checked:** Knob at 100% opacity, translated right
- **Motion:** 120ms ease-out (respects `prefers-reduced-motion`)

### Checkboxes

Compact 18×18px squares with an SVG checkmark mask.

- **Shape:** Small radius (4px), solid tinted background, strong border
- **Check:** 12×12px SVG mask in `currentColor`, visible only when `:checked`
- **Touch target:** Invisible 44×44px `::before` pseudo-element

### Selects

Native `<select>` with custom styling and a chevron indicator.

- **Style:** Well surface (soft, strong border, small radius, sunken), with a 12px SVG chevron
- **Typography:** Monospace for the value

### Experiment Shell (Signature Component)

The two-zone layout that hosts every experiment. A resizable panel (default 320px) alongside a stage, switching axis on orientation change. The resize handle is an aurora-tinted solid button at the panel edge, draggable with pointer capture. The panel collapses to 16px when dragged below threshold.

## Do's and Don'ts

### Do:

- **Do** set `tintVars.color` and `tintVars.onColor` together on every tinted surface. Never set one without the other.
- **Do** use `color-mix(in oklab, ...)` for all tint-derived backgrounds, borders, and shadows. The mix percentages are the system's vocabulary: 25% for soft backgrounds, 38% for subtle borders, 72% for strong borders.
- **Do** use `light-dark()` for every color that adapts to theme. Never branch with a media query when `light-dark()` works.
- **Do** respect `prefers-reduced-motion: reduce` on every transition. Use `1ms` as the reduced duration, not `0ms` (avoids browser edge cases).
- **Do** keep every interactive element at or above the 44×44px touch target, using an invisible `::before` when the visual element is smaller.

### Don't:

- **Don't** apply a permanent glow or shadow as decoration. Glow signals state; shadows signal elevation. A resting element should be flat or raised — never glowing.
- **Don't** use hardcoded color values in component styles. All colors flow through `tintVars.color`, `surface.foreground`, or `surface.background`. Direct palette references belong only in token definitions.
- **Don't** mix sans-serif and monospace within a single text element. Labels are sans; values are mono. If a string serves both roles, split it into two elements.
- **Don't** introduce new hues outside the eight named tints (neutral, aurora, solder, purple, amber, error, aqua, orange). The palette is closed by design; each hue exists in three registers and needs all three to work.
- **Don't** use `border-radius: 50%` for circles. Use `radius.full` (9999px) which produces a pill on rectangles and a circle on squares, keeping the vocabulary consistent.
