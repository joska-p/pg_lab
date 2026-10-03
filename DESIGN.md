---
name: Creative Playground
description: A technical creative laboratory — dark-first, precise, playful craft.
colors:
    dark0-hard: 'oklch(0.241 0.005 219.672)'
    dark0: 'oklch(0.277 0 0)'
    dark0-soft: 'oklch(0.311 0.003 48.619)'
    dark1: 'oklch(0.344 0.007 48.523)'
    dark2: 'oklch(0.411 0.012 51.866)'
    dark3: 'oklch(0.482 0.018 61.042)'
    dark4: 'oklch(0.55 0.023 62.567)'
    light0-hard: 'oklch(0.965 0.039 100.862)'
    light0: 'oklch(0.956 0.055 96.155)'
    light0-soft: 'oklch(0.922 0.055 92.526)'
    light1: 'oklch(0.894 0.057 89.24)'
    light2: 'oklch(0.825 0.051 85.116)'
    light3: 'oklch(0.756 0.041 82.284)'
    light4: 'oklch(0.69 0.035 76.307)'
    gray-244: 'oklch(0.619 0.029 67.258)'
    bright-red: 'oklch(0.66 0.218 30.392)'
    bright-green: 'oklch(0.765 0.158 110.835)'
    bright-yellow: 'oklch(0.832 0.159 82.987)'
    bright-blue: 'oklch(0.693 0.042 169.768)'
    bright-purple: 'oklch(0.705 0.098 2.189)'
    bright-aqua: 'oklch(0.756 0.108 137.676)'
    bright-orange: 'oklch(0.731 0.182 51.693)'
    neutral-red: 'oklch(0.546 0.203 28.662)'
    neutral-green: 'oklch(0.656 0.135 109.119)'
    neutral-yellow: 'oklch(0.725 0.143 77.708)'
    neutral-blue: 'oklch(0.576 0.066 199.487)'
    neutral-purple: 'oklch(0.597 0.111 352.218)'
    neutral-aqua: 'oklch(0.645 0.094 145.266)'
    neutral-orange: 'oklch(0.622 0.171 45.812)'
    faded-red: 'oklch(0.437 0.179 28.26)'
    faded-green: 'oklch(0.546 0.112 106.464)'
    faded-yellow: 'oklch(0.618 0.128 70.674)'
    faded-blue: 'oklch(0.471 0.082 215.806)'
    faded-purple: 'oklch(0.489 0.124 344.276)'
    faded-aqua: 'oklch(0.534 0.082 155.401)'
    faded-orange: 'oklch(0.513 0.162 39.297)'
typography:
    display:
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
        fontSize: '1.125rem'
        fontWeight: 600
        lineHeight: 1.25
        letterSpacing: '0.02em'
    headline:
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
        fontSize: '0.875rem'
        fontWeight: 500
        lineHeight: 1.25
        letterSpacing: '0.02em'
    title:
        fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", monospace'
        fontSize: '0.75rem'
        fontWeight: 500
        lineHeight: 1.25
        letterSpacing: '0.02em'
    body:
        fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", monospace'
        fontSize: '0.875rem'
        fontWeight: 400
        lineHeight: 1.5
        letterSpacing: '0'
    label:
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
        fontSize: '0.875rem'
        fontWeight: 500
        lineHeight: 1.25
        letterSpacing: '-0.01em'
rounded:
    none: '0px'
    sm: '4px'
    md: '6px'
    lg: '8px'
    xl: '12px'
    full: '9999px'
spacing:
    0: '0px'
    1: '4px'
    2: '8px'
    3: '12px'
    4: '16px'
    5: '20px'
    6: '24px'
    8: '32px'
    10: '40px'
    12: '48px'
    16: '64px'
components:
    button-primary:
        backgroundColor: '{colors.dark0}'
        textColor: '{colors.light0}'
        rounded: '{rounded.md}'
        padding: '8px 16px'
    button-card:
        backgroundColor: 'color-mix(in oklab, {colors.light2} 12%, transparent)'
        textColor: '{colors.dark0}'
        rounded: '{rounded.md}'
        padding: '16px'
    card:
        backgroundColor: 'color-mix(in oklab, {colors.light2} 12%, transparent)'
        textColor: '{colors.dark0}'
        rounded: '{rounded.md}'
        padding: '16px'
    input-well:
        backgroundColor: 'color-mix(in oklab, {colors.light2} 12%, transparent)'
        textColor: '{colors.dark0}'
        rounded: '{rounded.sm}'
        padding: '8px 12px'
---

# Design System: Creative Playground

## Overview

**Creative North Star: "The Lab Notebook"**

A precise, dark-first instrument panel for creative experimentation. The interface recedes so the canvas leads — every control surface is a quiet, well-calibrated tool that invites tactile interaction without demanding attention. The aesthetic is that of a researcher's notebook: disciplined spacing, monospace readouts, hairline borders, and a controlled palette of bright accents that punctuate like highlighted annotations.

The system is built on OKLCH color science for perceptually uniform contrast, with a full light/dark theme via `light-dark()`. Surfaces are flat by default; depth is conveyed through tonal layering and intentional shadow only when a surface is raised or sunken. Typography pairs a system sans for labels and headings with monospace for values and data — a deliberate signal that this is a tool for making, not a document for reading.

**Key Characteristics:**

- Dark-first with full light theme support via `light-dark()`
- OKLCH color space for perceptually uniform contrast
- Monospace for data, sans for labels — functional type pairing
- Flat-by-default elevation; shadows are structural, not decorative
- Hairline borders (1px) with `color-mix()` tinting
- Tactile interactions: press scale, overlay hover, focus rings
- 4px base spacing grid, 44px minimum touch targets

## Colors

The palette is a full OKLCH ramp organized into dark grounds, light grounds, and three accent intensities (bright, neutral, faded). Semantic tints map to named color roles.

### Primary

- **Dark Ground** (`oklch(0.277 0 0)`): The default surface in dark mode — a near-black with zero chroma. Used for the app background and primary button fills.
- **Light Ground** (`oklch(0.956 0.055 96.155)`): The default surface in light mode — a warm off-white with subtle yellow chroma. Used for the app background and primary text.

### Neutral

- **Dark 0 Hard** (`oklch(0.241 0.005 219.672)`): The darkest ground, used for sunken wells and inset surfaces in dark mode.
- **Dark 4** (`oklch(0.55 0.023 62.567)`): The lightest dark ground, used for elevated surfaces and borders in dark mode.
- **Light 0 Hard** (`oklch(0.965 0.039 100.862)`): The lightest ground, used for raised surfaces in light mode.
- **Light 4** (`oklch(0.69 0.035 76.307)`): The darkest light ground, used for sunken wells and borders in light mode.
- **Gray 244** (`oklch(0.619 0.029 67.258)`): A mid-tone neutral for dividers and disabled states.

### Accent (Bright — light mode)

- **Bright Red** (`oklch(0.66 0.218 30.392)`): Error states, destructive actions.
- **Bright Green** (`oklch(0.765 0.158 110.835)`): Success states, active indicators.
- **Bright Yellow** (`oklch(0.832 0.159 82.987)`): Warning states, highlights.
- **Bright Blue** (`oklch(0.693 0.042 169.768)`): Primary accent — links, selected states, aurora tint.
- **Bright Purple** (`oklch(0.705 0.098 2.189)`): Secondary accent, purple tint.
- **Bright Aqua** (`oklch(0.756 0.108 137.676)`): Tertiary accent, selection highlight.
- **Bright Orange** (`oklch(0.731 0.182 51.693)`): Quaternary accent, orange tint.

### Accent (Faded — dark mode)

- **Faded Red** (`oklch(0.437 0.179 28.26)`): Error states on dark.
- **Faded Green** (`oklch(0.546 0.112 106.464)`): Success on dark.
- **Faded Yellow** (`oklch(0.618 0.128 70.674)`): Warning on dark.
- **Faded Blue** (`oklch(0.471 0.082 215.806)`): Primary accent on dark.
- **Faded Purple** (`oklch(0.489 0.124 344.276)`): Secondary accent on dark.
- **Faded Aqua** (`oklch(0.534 0.082 155.401)`): Selection on dark.
- **Faded Orange** (`oklch(0.513 0.162 39.297)`): Quaternary accent on dark.

### Named Rules

**The One Voice Rule.** Accent colors are used on ≤10% of any given screen. The canvas is the star; accents are annotations. If a screen feels colorful, it is over-tinted.

**The Semantic Tint Rule.** Never use raw palette colors directly in components. Always map through the semantic tint system (`neutral`, `aurora`, `solder`, `purple`, `amber`, `error`, `aqua`, `orange`) so theme switching is automatic.

## Typography

**Display Font:** system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
**Body Font:** "SFMono-Regular", Consolas, "Liberation Mono", monospace
**Label Font:** system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif

**Character:** The pairing is deliberate — sans-serif for human-readable labels and headings, monospace for machine-readable values and data. The monospace signals "this is a tool"; the sans signals "this is for you."

### Hierarchy

- **Display** (600, 1.125rem, 1.25, +0.02em, uppercase): Page titles, section headers. The largest text on screen.
- **Headline** (500, 0.875rem, 1.25, +0.02em, uppercase): Panel titles, card headers. Smaller but still prominent.
- **Title** (500, 0.75rem, 1.25, +0.02em, uppercase, monospace): Control group labels, table headers. Technical and precise.
- **Body** (400, 0.875rem, 1.5, 0, monospace): Values, readouts, descriptions. The workhorse text.
- **Label** (500, 0.875rem, 1.25, -0.01em): Field labels, button text. Tight tracking for readability at small sizes.

### Named Rules

**The Functional Pairing Rule.** Sans for labels and headings, monospace for values and data. Never use monospace for body paragraphs or sans for numeric readouts.

**The Uppercase Rule.** Display, headline, and title levels are always uppercase. Body and label inherit case.

## Layout

The layout is a two-column shell: a fixed-width control panel (320px) beside a flexible canvas stage. The panel is the instrument cluster; the stage is the experiment surface.

- **Panel width:** 320px fixed on desktop, collapsible on mobile
- **Panel max height (mobile):** 300px
- **Panel gap:** 12px between panel and stage
- **Control field min height:** 44px (touch target)
- **Text max width:** 62ch for readability
- **Breakpoints:** narrow ≤720px, wide ≥1024px
- **Container queries:** The panel collapses on its own inline size, not just viewport

On mobile, the panel stacks below the canvas with a max-height constraint, preserving the canvas as the primary surface.

## Elevation & Depth

The system uses three elevation modes: flat (no shadow), raised (drop shadow), and sunken (inset shadow). Depth is structural — it communicates whether a surface is at rest, elevated, or recessed.

### Shadow Vocabulary

- **Flat** (`box-shadow: none`): Default state for cards, panels, and containers at rest.
- **Raised** (`0 1px 3px color-mix(dark0Hard 22%, transparent), 0 6px 18px -2px color-mix(tint 24%, dark0Hard 40%)`): Buttons, interactive elements that can be pressed. The shadow includes a tint-colored ambient component.
- **Sunken** (`inset 0 1px 2px color-mix(dark0Hard 26%, transparent), inset 0 3px 8px color-mix(tint 20%, dark0Hard 30%)`): Input wells, text fields, any surface that accepts text entry.

### Named Rules

**The Flat-By-Default Rule.** Surfaces are flat at rest. Shadows appear only as a response to function — raised for pressable elements, sunken for input wells. Decorative shadows are forbidden.

**The Tinted Shadow Rule.** Raised and sunken shadows incorporate the surface's tint color via `color-mix()`, so shadows feel integrated with the surface rather than pasted on.

## Shapes

The form language is precise and slightly technical:

- **Corner radius:** 4px (sm) for inputs and small elements, 6px (md) for cards and buttons, 8px (lg) for large containers, 12px (xl) for modals and overlays
- **Borders:** 1px hairline, tinted via `color-mix()` at 38% (subtle) or 72% (strong) of the surface tint
- **No clipping:** Content is never clipped by border-radius; padding ensures clearance
- **Form language:** Slightly rounded rectangles — not sharp, not pill-shaped. The 4-6px range feels technical but approachable.

## Components

### Buttons

- **Shape:** 6px radius (md), solid background, raised elevation
- **Primary:** Dark ground fill, light ground text, 8px 16px padding, 44px min height
- **Hover:** Foreground overlay at 8% opacity (instant, no transition on the gradient)
- **Active:** Scale to 0.98, overlay at 14% opacity
- **Focus:** 2px solid outline in foreground color, 2px offset
- **Disabled:** 0.45 opacity, not-allowed cursor

### Cards / Containers

- **Shape:** 6px radius (md), soft background (tint at 12% over ground), flat elevation
- **Border:** 1px hairline, subtle (tint at 38%)
- **Padding:** 16px
- **Gap:** 12px between children

### Inputs / Fields

- **Shape:** 4px radius (sm), soft background, sunken elevation
- **Border:** 1px hairline, strong (tint at 72%)
- **Padding:** 8px 12px
- **Focus:** 2px solid outline in foreground color, 2px offset
- **Error:** Tint switches to `error` (red), no separate error style
- **Disabled:** 0.45 opacity, not-allowed cursor

### Text

- **Body:** Monospace, 0.875rem, inherited color, max-width 62ch
- **Muted:** 0.7 opacity for secondary information
- **Label:** Sans-serif, 0.875rem, medium weight, tight tracking

### Navigation

- **Style:** Select dropdown in the control panel, monospace values
- **States:** Default, hover (overlay), focus (outline), disabled

## Do's and Don'ts

### Do:

- **Do** use `light-dark()` for all surface colors — the system is dual-theme by default
- **Do** map raw palette colors through semantic tints before using them in components
- **Do** use monospace for values and data, sans for labels and headings
- **Do** keep surfaces flat at rest; reserve shadows for raised/sunken functional states
- **Do** use 44px minimum touch targets for all interactive elements
- **Do** use `color-mix()` for tinted borders and shadows to keep them integrated with surfaces

### Don't:

- **Don't** use raw palette colors directly in components — always go through the tint system
- **Don't** add decorative shadows to surfaces at rest
- **Don't** use monospace for body paragraphs or sans for numeric readouts
- **Don't** exceed 10% accent color coverage on any screen
- **Don't** use border-radius below 4px or above 12px (except full/pill)
- **Don't** use `light-dark()` outside of color values — it is invalid in other properties
