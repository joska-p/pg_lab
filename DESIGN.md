---
name: Creative Playground
description: Recreational coding ecosystem for GPU shaders, simulations and visual toys.
colors:
    page-bg: 'light-dark(oklch(0.956 0.055 96.155), oklch(0.277 0 0))'
    page-ink: 'light-dark(oklch(0.277 0 0), oklch(0.956 0.055 96.155))'
    neutral: 'light-dark(oklch(0.825 0.051 85.116), oklch(0.411 0.012 51.866))'
    glacier-blue: 'light-dark(oklch(0.693 0.042 169.768), oklch(0.471 0.082 215.806))'
    circuit-green: 'light-dark(oklch(0.765 0.158 110.835), oklch(0.546 0.112 106.464))'
    pulse-violet: 'light-dark(oklch(0.705 0.098 2.189), oklch(0.489 0.124 344.276))'
    signal-amber: 'light-dark(oklch(0.832 0.159 82.987), oklch(0.618 0.128 70.674))'
    plasma-red: 'light-dark(oklch(0.66 0.218 30.392), oklch(0.437 0.179 28.26))'
    lagoon-aqua: 'light-dark(oklch(0.756 0.108 137.676), oklch(0.534 0.082 155.401))'
    ember-orange: 'light-dark(oklch(0.731 0.182 51.693), oklch(0.513 0.162 39.297))'
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
    label:
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
        fontSize: '0.875rem'
        fontWeight: 500
        lineHeight: 1.25
        letterSpacing: '-0.01em'
rounded:
    sm: '4px'
    md: '6px'
    lg: '8px'
    xl: '12px'
    full: '9999px'
spacing:
    sm: '8px'
    md: '16px'
    lg: '24px'
    xl: '32px'
components:
    button-primary:
        backgroundColor: '{colors.neutral}'
        textColor: '{colors.page-ink}'
        rounded: '{rounded.md}'
        padding: '8px 16px'
        height: '44px'
    button-primary-hover:
        backgroundColor: '{colors.neutral}'
        textColor: '{colors.page-ink}'
        rounded: '{rounded.md}'
        padding: '8px 16px'
        height: '44px'
    input-well:
        backgroundColor: '{colors.neutral}'
        textColor: '{colors.page-ink}'
        rounded: '{rounded.sm}'
        padding: '8px 12px'
    chip-solid:
        backgroundColor: '{colors.neutral}'
        textColor: '{colors.page-ink}'
        rounded: '{rounded.full}'
        padding: '2px 8px'
    card-soft:
        backgroundColor: '{colors.neutral}'
        textColor: '{colors.page-ink}'
        rounded: '{rounded.md}'
        padding: '16px'
    segment-active:
        backgroundColor: '{colors.neutral}'
        textColor: '{colors.page-ink}'
        rounded: '{rounded.sm}'
        padding: '1px 12px'
---

# Design System: Creative Playground

## Overview

**Creative North Star: "The Playful Laboratory"**

A quiet lab bench for loud experiments. The chrome is small, dense and instrument-like — uppercase micro-headings, mono readouts, 44px touch targets — so WebGL canvases, Voronoi toys, mosaics and molecule viewers can be wild, colorful and tactile at full 60 FPS. Personality comes from the artifacts, not the furniture.

Curious, technical yet playful, understated craft. No marketing hyperbole, no SaaS dashboard tropes, no corporate hero sections. The system recedes; the experiment leads.

**Key Characteristics:**

- Instrument bench framing a stage: docked 320px control panel + fluid canvas stage.
- Warm paper / charcoal page grounds with 8 hardware-named tints applied as translucent veils.
- Chunky, pressable controls with three-step neon intensity (rest / hover / press).
- Mono for values, sans for labels; everything uppercase at heading level.
- Flat by default; depth signals affordance, never decoration.

## Colors

Translucent lab tints over warm paper (light) and charcoal (dark). Tint is one variable read by background, border and shadow each at its own mix ratio.

### Primary

- **Warm Paper** (`light-dark(oklch(0.956 0.055 96.155), oklch(0.277 0 0))`): Page ground. Set once on `ShellWrapper`; all surfaces layer over it with `color-mix`.
- **Charcoal Ink** (`light-dark(oklch(0.277 0 0), oklch(0.956 0.055 96.155))`): Default text, focus rings, hover veils. Light-dark mirror of the ground.

### Secondary

- **Glacier Blue / Aurora** (`light-dark(oklch(0.693 0.042 169.768), oklch(0.471 0.082 215.806))`): Info, links, cool selection. Default panel-toggle tint.
- **Circuit Green / Solder** (`light-dark(oklch(0.765 0.158 110.835), oklch(0.546 0.112 106.464))`): Go, live, healthy compute states.
- **Lagoon Aqua** (`light-dark(oklch(0.756 0.108 137.676), oklch(0.534 0.082 155.401))`): Alternate cool accent for canvas-adjacent actions; also `::selection` ground.

### Tertiary

- **Pulse Violet** (`light-dark(oklch(0.705 0.098 2.189), oklch(0.489 0.124 344.276))`): Creative / generative accent.
- **Signal Amber** (`light-dark(oklch(0.832 0.159 82.987), oklch(0.618 0.128 70.674))`): Warning, warm highlight.
- **Ember Orange** (`light-dark(oklch(0.731 0.182 51.693), oklch(0.513 0.162 39.297))`): Hot accent, secondary warning.
- **Plasma Red / Error** (`light-dark(oklch(0.66 0.218 30.392), oklch(0.437 0.179 28.26))`): Error, invalid wells, destructive. Only tint that recolors body copy (`fieldText.message`).

### Neutral

- **Stone Veil** (`light-dark(oklch(0.825 0.051 85.116), oklch(0.411 0.012 51.866))`): Default tint for buttons, cards, inputs, segments. Reads as warm gray veil at 12% over page ground.
- **Graphite Scale** (`oklch(0.311 0.003 48.619)` to `oklch(0.55 0.023 62.567)` in dark, mirrored lights `oklch(0.922 0.055 92.526)` to `oklch(0.69 0.035 76.307)` in light): Tonal steps for borders and sunken wells via `color-mix`, rarely used flat.

### Named Rules

**The One-Variable Tint Rule.** A surface sets one tint color; background uses it at 12%, border at 38%, strong border at 72%. Never introduce a second tint to fake depth.

**The No-Blur Rule.** No `backdrop-filter: blur()` on new surfaces. It ships in legacy `ExperimentShell` but costs too much on canvas-heavy pages; use flat veils + tinted shadow instead.

**The Three-Glow Rule.** Neon intensity has three steps: subtle veil at rest, stronger tint wash on hover (foreground 8% overlay), strongest on press/active (foreground 14% overlay + `scale(0.98)`). Never glow at rest what should only glow on touch.

## Typography

**Display Font:** system-ui stack (with -apple-system, Segoe UI fallback)
**Body Font:** SFMono-Regular, Consolas, Liberation Mono (values, readouts, body text)
**Label/Mono Font:** Mono doubles as body; sans is reserved for labels and headings.

**Character:** Instrument-panel terse. Headings shout quietly in uppercase micro-type; values tick in mono like oscilloscope readouts. Max line length 62ch (`layout.textMaxWidth`).

### Hierarchy

- **Display** (semibold 600, 1.125rem /18px, 1.25, wide 0.02em, uppercase): Panel titles, `heading.level1`. Only one per panel.
- **Headline** (medium 500, 0.875rem /14px, 1.25, wide, uppercase): Section titles, `heading.level2`, `ControlSection` titles.
- **Title** (mono medium 500, 0.75rem /12px, 1.25, wide, uppercase): Eyebrows, `heading.level3`, tertiary labels.
- **Body** (mono regular 400, 0.875rem /14px, 1.5): Values, paragraphs (`Text`), slider outputs. Max 62ch.
- **Label** (sans medium 500, 0.875rem /14px, tight 1.25, tight spacing -0.01em): Field labels, button text, badge text, segment options.

### Named Rules

**The Uppercase Bench Rule.** Headings levels 1–3 are always uppercase with 0.02em tracking. Labels and buttons are sentence-case sans-medium; values are mono.

**The Mono-Truth Rule.** Any number the user reads or edits is mono (`fieldText.value`). If it is not mono, it is not a value.

## Layout

Bench + stage. `ExperimentShell` is a full-height row (column in portrait): fluid canvas stage first, fixed 320px (`layout.panelWidth`) control rail second. Stage scrolls internally; panel scrolls independently with 16px gaps and 16px padding. At ≥1024px padding grows 8px → 16px; at ≤720px (container or viewport) panel docks to bottom with 300px max height (`layout.panelMaxMobileHeight`).

Density is compact lab-grade: 4px base unit, rhythm 4 / 8 / 12 / 16 / 24 / 32 / 40 / 48. Touch targets never below 44px (`controlTouchTarget`, `controlFieldMinHeight`). Control stacks gap 12–16px. Canvas is `zIndex.canvas (1)`; panel `50`; overlay toggle `100`; modal `300`.

Responsive: viewport queries at 720px / 1024px plus container queries at 720px — the shell collapses on its own inline size, not just the viewport. Portrait flips row to column.

## Elevation & Depth

Flat by default with affordance depth. Three elevations only: `flat` (none), `raised` (actions, cards, floating panels), `sunken` (input wells). Tinted shadows carry the tint color so glow feels neon, not gray.

### Shadow Vocabulary

- **Raised — rest** (`box-shadow: 0 1px 2px color-mix(in oklab, oklch(0.241 0.005 219.672) 18%, transparent), 0 0 12px -2px color-mix(in oklab, tint 18%, transparent)`): Buttons (default), floating panel, stage slot. Glow néon très subtil.
- **Raised — hover** (`box-shadow: 0 1px 3px color-mix(in oklab, dark 22%, transparent), 0 0 20px -2px color-mix(in oklab, tint 32%, transparent)` via `interactions.glow`): pressables uniquement, sans nouvelle prop.
- **Raised — press/active** (`box-shadow: 0 1px 2px color-mix(in oklab, dark 20%, transparent), 0 0 28px -1px color-mix(in oklab, tint 48%, transparent)` + `scale(0.98)`): point le plus intense des 3 temps.
- **Sunken** (`box-shadow: inset 0 1px 2px color-mix(in oklab, dark 26%, transparent), inset 0 3px 8px color-mix(in oklab, tint 20%, dark 30%)`): Text inputs, selects, wells. Always paired with `strong` border.
- **Flat** (`box-shadow: none`): Default cards, segments container, idle segments, text.

No ambient / modal shadow tier — floating panel reuses `raised`. No backdrop blur on new work per No-Blur Rule.

### Named Rules

**The Affordance Depth Rule.** Raised = pressable or floating. Sunken = editable. Flat = informational. Never raise an info card to make it pretty.

## Shapes

Small, purposeful radii. System scale: none (0px), sm (4px), md (6px), lg (8px), xl (12px), full (9999px). Hairline 1px borders only; color comes from tint mix, never a raw gray.

Buttons and cards default md (6px); inputs sm (4px); badges, toggles, sliders, radio dots full-pill; stage/panel corners none on mobile, md on desktop. Toggle track 34×20px with 14px knob traveling 16px; checkbox 18px with 12px mark; slider rail 4px with 14px thumb; swatch 36×26px.

## Components

Each component is `surfaceStyles` (5 axes: color / background / border / radius / elevation) + interaction recipe. Defaults below are the incumbent defaults in code.

### Buttons

Chunky and pressable. Shape md (6px), solid tint + subtle 1px border + raised shadow, 8px × 16px padding, 44px min-height, sans-medium 14px. Hover adds foreground 8% veil; active adds 14% veil + `scale(0.98)` over 320ms `cubic-bezier(0.16,1,0.3,1)`. Focus is a 2px currentColor ring offset 2px. Disabled drops to 0.45 opacity with `not-allowed`.

- **Shape:** gently rounded rect (6px md)
- **Primary:** solid neutral veil, charcoal-on-light text, 8px 16px
- **Hover / Focus:** 8% foreground veil on hover; 2px ring on focus-visible
- **Secondary / Ghost:** `background="soft"` (12% veil) + same border; used for panel toggle (aqua soft)

### Chips

Badge pills for status and counts. Shape full (9999px), solid tint + subtle border + raised, 2px × 8px padding, sans-medium 14px tight. Selected = solid; unselected = soft or transparent with border only.

- **Style:** solid veil ground, ink text, hairline tint border
- **State:** selected solid; filter variants toggle solid/transparent

### Cards / Containers

Quiet holders for experiments and control groups. Corner md (6px), soft 12% veil ground, subtle 38% border, flat at rest, 16px internal padding, 12px stack gap.

- **Corner Style:** softly rounded (6px md)
- **Background:** neutral soft veil over page ground
- **Shadow Strategy:** flat at rest; raised on floating / hover per Affordance Depth Rule
- **Border:** hairline subtle; strong (72%) only when the card is also a well
- **Internal Padding:** 16px(md scale)

### Inputs / Fields

Sunken wells, never pressable. Stroke strong 72% tint + soft veil + sunken inset shadow + sm (4px) radius, 8px × 12px padding, full width. Focus ring 2px; invalid flips tint to plasma-red and message to mono 12px red. No hover veil, no press scale. Selects, text areas, number and color fields share the well.

- **Style:** soft veil, strong hairline, sm radius, mono values
- **Focus:** 2px currentColor ring, offset 2px
- **Error / Disabled:** error tint + red mono message; disabled 0.45 opacity

### Navigation

Experiment switcher is a `Select` well inside `ControlPanel > ControlSection Navigation`, plus a panel show/hide `Button` (aqua soft) floating top-right. Style follows input-well for the select, button-primary for the toggle. Mobile collapses panel to bottom sheet with the same toggle.

### Signature Component

**ExperimentShell (bench + stage).** Row flex with stage slot (soft + subtle + raised, 16px padding) and 320px control rail (soft + subtle + raised). Stage hosts the WebGL/Canvas/SVG artifact full-bleed; rail hosts `ControlPanel` stacks (sliders, toggles, segments, wells). Panel placement `docked` or `floating` (absolute right, 12px gap). Defines the product silhouette — every experiment reuses it, never reinvents layout.

## Do's and Don'ts

Concrete guardrails from the implemented `@repo/ui` system.

### Do:

- **Do** set page ground + ink once on `ShellWrapper` and layer everything with `color-mix` veils.
- **Do** use the 5-axis surface recipe (color/background/border/radius/elevation) — do not hand-roll backgrounds or borders.
- **Do** keep touch targets ≥44px and gaps on the 4px scale (8/12/16/24).
- **Do** render numbers in mono 14px with a right-aligned `output`; labels in sans-medium.
- **Do** apply the Three-Glow steps (rest subtle → hover 8% → press 14% + scale 0.98).
- **Do** respect `prefers-reduced-motion: reduce` (transitions collapse to 1ms).

### Don't:

- **Don't** add `backdrop-filter: blur()` to new surfaces — perf cost on shader pages.
- **Don't** use raw hex grays — always derive borders/shadows from the active tint via `color-mix`.
- **Don't** invent a new radius or shadow tier — the scale is 0/4/6/8/12/full and flat/raised/sunken.
- **Don't** put body copy in sans or labels in mono — mono is for values, sans for labels.
- **Don't** glow at rest — neon is a hover/press/state signal, not a default.
- **Don't** build a one-off page layout — reuse `ExperimentShell + ControlPanel + Stage`.
