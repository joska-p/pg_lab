---
name: The Terminal Atelier (@repo/ui)
description: A matte, compact, tactile UI toolkit for creative mini-apps — Gruvbox-warm, canvas-first, quietly luminous.
colors:
  bg-ground: "light-dark(oklch(0.894 0.057 89.24), oklch(0.277 0 0))"
  ground-fg: "light-dark(oklch(0.222 0.000 0.0), oklch(0.965 0.039 100.9))"
  panel-surface: "light-dark(oklch(0.956 0.055 96.2), oklch(0.314 0.004 48.5))"
  panel-fg: "light-dark(oklch(0.222 0.000 0.0), oklch(0.965 0.039 100.9))"
  aurora: "light-dark(oklch(0.693 0.042 169.768), oklch(0.471 0.082 215.806))"
  aurora-strong: "oklch(0.576 0.066 199.487)"
  solder: "light-dark(oklch(0.765 0.158 110.835), oklch(0.546 0.112 106.464))"
  solder-strong: "oklch(0.656 0.135 109.119)"
  neon-violet: "light-dark(oklch(0.705 0.098 2.189), oklch(0.489 0.124 344.276))"
  neon-violet-strong: "oklch(0.597 0.111 352.218)"
  amber: "light-dark(oklch(0.832 0.159 82.987), oklch(0.618 0.128 70.674))"
  amber-strong: "oklch(0.725 0.143 77.708)"
  amber-fg: "light-dark(oklch(0.241 0.005 219.672), oklch(0.894 0.057 89.24))"
  error: "light-dark(oklch(0.66 0.218 30.392), oklch(0.437 0.179 28.26))"
  error-strong: "oklch(0.546 0.203 28.662)"
  muted-well: "light-dark(oklch(0.756 0.041 82.3), oklch(0.357 0.007 51.9))"
  muted-well-hover: "light-dark(oklch(0.69 0.035 76.3), oklch(0.482 0.018 61.0))"
  muted-fg: "light-dark(oklch(0.266 0.003 211.0), oklch(0.756 0.041 82.3))"
  input-well: "light-dark(oklch(0.825 0.051 85.1), oklch(0.324 0.004 51.9))"
  border-hair: "light-dark(color-mix(in oklab, oklch(0.756 0.041 82.3) 55%, transparent), color-mix(in oklab, oklch(0.482 0.018 61.0) 55%, transparent))"
  ring-halo: "light-dark(oklch(0.693 0.042 169.768), oklch(0.471 0.082 215.806))"
typography:
  headline:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "18px"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "0.02em"
  title:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "0.02em"
  label:
    fontFamily: "SFMono-Regular, Consolas, Liberation Mono, monospace"
    fontSize: "12px"
    fontWeight: 400
    letterSpacing: "0.02em"
  body:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
  field-label:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: 1.25
    letterSpacing: "-0.01em"
  readout:
    fontFamily: "SFMono-Regular, Consolas, Liberation Mono, monospace"
    fontSize: "14px"
    fontWeight: 400
rounded:
  none: "0px"
  sm: "4px"
  md: "6px"
  lg: "8px"
  xl: "12px"
  full: "9999px"
spacing:
  "0": "0px"
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
---

# Design System: The Terminal Atelier

This file is the **visual contract** and sole visual authority. It records the design
system vocabulary validated in the `apps/dev` _visual laboratory_ and implemented across
`@repo/ui`. Values that flick light/dark stay in the frontmatter and in `tokens/` / `consts/`;
the prose below is decision, not implementation.

## Overview

**Creative North Star: "The Terminal Atelier"**

A dim, Gruvbox-warm room where the thing being made is the only thing that draws
the eye. The ground is never black, never glossy, never corporate. Chrome is a
precise instrument — matte, dense, tactile — that recedes at rest and answers
when touched. A glowing thing is a living thing; a colored thing means something.

Color is **light and data, not decoration**. It exists in four regimes, and none
of them is "component variant color":

- **light field** — colored Gruvbox light bleeding behind surfaces;
- **material** — translucency + backdrop blur turn that under-light into the
  surface above it (the Gruvbox + glass combination, kept);
- **data / identity** — a hue names an object or a parameter (`cutoff` = violet,
  `resonance` = orange), or a mark (`running`, `record`, `plot`);
- **state** — glow is the Pilot Light, spent rarely and deliberately.

Faces stay neutral; saturation never becomes the resting price of a control.

**Key Characteristics:**

- Matte, layered dark ground — never pure black, warmed by Gruvbox.
- Canvas-first: scaffolding occupies minimal attention.
- Instrument-grade controls: tactile, immediate, no hover dependency.
- Color = data and light: families mark identity, fills measure meaning.
- Glass + light under floating UI only; the surface below feeds the material above.
- Hairline borders, restrained radius, tonal surfaces instead of heavy shadow.
- Compact technical type, monospace readouts, uppercase tracked labels.
- Fewer visible boxes: one cage at a time, not a stack of rounded rectangles.

## Colors

Gruvbox is the **vocabulary**, not a source of semantic variants. The palette's
own structure — hue × tonal ladder (`faded` / `neutral` / `bright`) on a warm
dark ground — is the language. For interfaces two tensions are enough:

- **base** — the light source: LED marks, fills that mean something, light
  fields, glass tint (`bright*` in light, `faded*` in dark).
- **strong** — the readable line/mark: chip stroke + text, thumb seed, hover
  infusion (the `neutral*` value, valid in both modes).

Each family (aurora/solder/neon-violet/amber/error/aqua/orange) is a hue with
those two tensions. It adds an **ink** (its own text-on-tint pair) only where a
widget genuinely paints text on its tint — amber has one today. Contrast is
handled by exception, not promised per family (see `component-authoring.md` §
Tokens → Contrast).

### Roles

- **Neutral ground + wells** — the default face: matte, warm, hairline-bordered.
- **Family hues** — data, identity, light. The same hue names a parameter, an
  action's mark, or a canvas tone — never "the accent button".
- **Contact hue** — a single interactive hue for _response_: focus ring, default
  fill. Today that is `ring-halo` (aurora/blue); **amber is the candidate under
  test** in the laboratory. This is the one "semantic" color the system keeps.
- **Ink** — only where text actually sits on tinted ground (amber today),
  derived toward black/white to meet contrast.

### Named Rules

**The Warm Ground Rule.** Never pure black. Depth comes from layered Gruvbox
darks (`dark0`→`dark4`), not from subtracting light to zero.

**The One-Token Rule.** Components consume semantic tokens only. The raw palette
(`consts/gruvbox-palette.stylex.ts`) is the single source of truth and is never
referenced directly by components.

**The Matte Face Rule.** A key's face is neutral; a field's well is neutral; a
surface's ground is neutral. Color lives on marks (LED), on fills that mean
something, on light, and on state — never on a whole face as a resting fill.

**The One Contact Rule.** One hue answers interaction (focus halo, default
identity). Fields no longer light their ring in every family hue.

**The Color-as-Data Rule.** Before coloring a widget, ask what the hue _names_.
If nothing, it stays neutral or takes the contact hue.

## Typography

**Headline / Title / Field label:** system sans, 600/500, tight.
**Section label / Readout:** monospace — every reading is mono.
**Character:** compact, dense, technical — the voice of a bench instrument. Sans
does the UI work; monospace takes over whenever a value is a reading. Hierarchy
roles and exact values live in the frontmatter and `consts/typography.stylex.ts`.

### Named Rules

**The Upper-Label Rule.** Titles and section labels are uppercase with wide
tracking; body and field labels stay sentence-case. Type separates hierarchy by
case + tracking, so it stays small.

**The Mono Readout Rule.** Any displayed number, identifier, or parameter value —
slider output, readouts, input text, badge labels — renders in monospace.

## Layout

Composition is a strict hierarchy that keeps the canvas supreme:

```text
ShellWrapper
└─ ExperimentShell
   ├─ Stage (canvas) — flex: 1, the star
   └─ ControlPanel — docked (side/bottom) or floating (glass)
      └─ ControlSection → widget
```

**The Box Budget.** Every visible box pays attention. Borders are barely-there
hairlines (translucent); one cage (well, panel, or card) encloses a group at a
time; the rest of the hierarchy is carried by type and tonal surfaces. Wells and
recesses replace stacked rectangles.

Spacing follows the 4px `space` scale; `Stack` directions and gaps are string
tokens. Responsive behavior is structural: landscape docks the panel beside the
canvas, portrait/≤720px stacks it under.

## Elevation & Depth

The system is matte by default and **tonally layered**, not shadow-stacked.
Depth has four rungs and one orthogonal state channel:

1. **Flat** — hairline only at rest.
2. **Raised** — a small tinted cast; the shadow _paints itself_ in the carrier's
   own color (`shadowColor`), so a green key casts green-lit shadow and a card
   casts card.
3. **Sunken** — inset hairline shadow for embedded wells and rails (fields,
   tracks, groups).
4. **Floating** — **glass**: translucency + `backdrop-filter: blur(24px)
saturate(180%)` over a light backdrop, with a self-tinted cast.

**Under/over.** The signature depth move of this system: a colored **light
field** beneath a well; a translucent **glass** pane above it turns that
under-light into its own material. The surface below feeds the material above —
the depth is in the interaction, not in a hard shadow. Demonstrated in the
laboratory's _material_ study.

Glow (`drop-shadow` on `currentColor`) is **orthogonal to elevation**: it
signals active/selected/live; it never simulates height.

### Shadow Vocabulary

Exact values live in `tokens/shadows.stylex.ts`, all derived from
`--shadow-color` via `color-mix`: **rest** (pressables), **hover** (lift),
**raised** (docked panels), **active** (inset press), **sunken** (embedded
wells), **floating** (glass). The ladder is alpha-ordered
(`rest < raised < hover < floating`).

### Named Rules

**The Shadow-Paints-Itself Rule.** Every shadow derives from `shadowColor`; an
element sets it to its own background, so shadows are tinted by their carrier,
never flat black.

**The Glass-on-Floating-Only Rule.** Blur and translucency exist only where UI
floats above other content. In-flow surfaces stay opaque so text contrast never
depends on what sits behind them.

## Shapes

Radius is a small quiet scale (`0 / 4 / 6 / 8 / 12 / full`) in
`consts/radius.stylex.ts`. Keys and wells sit at 4px; panels at 6–8px. The only
perfect circles are intentional interactive shapes — slider thumbs, toggles,
LEDs, outline chips. Borders are hairline (1px) and translucent.

**The Not-Everything-Is-a-Card Rule.** The silhouettes are **keys** (matte
rectangles), **wells** (embedded recesses), **rails** (instrument tracks), and
**chips** (outline pills). A card is the exception, chosen deliberately — not
the default container. Avoid stacking rounded rectangles into a "ui kit
shoebox."

## Components

Componentize by **anatomy**, not by role. Each widget is built from a matte
face + the marks/fills/light the contract provides, styled locally; only
genuinely recurring behavior is shared (focus halo, press, disabled, glass,
glow, shadow). The legacy six-role semantic matrix — per-family fills + per-family
focus rings + per-widget `muted` exceptions — **has been dismantled and retired**.
Widgets consume **families** (`base` / `strong`), semantic tokens (`colors.*`),
and the **single contact hue** (`colors.ring`).

### Keys (Button)

- **Shape:** 4px radius, hairline translucent border, compact sans padding
  (`8px`/`12–16px`).
- **Face:** neutral matte (`panel-surface`), `foreground` text, **no resting
  saturated fill**.
- **Identity:** the family lives on a **LED mark** (7px) at the leading edge —
  running = green, record = red, plot = aqua. Hover infuses a faint family
  tint into the face; press sunks + glows (Pilot Light).
- **Focus:** the universal halo — `0 0 0 2px` ground behind `0 0 0 3px` contact
  ring, keyboard only. Loading = `currentColor` spinner plus `aria-busy`;
  disabled = 45% opacity.

### Fields (Input)

- **Shape:** 4px radius, hairline border, sunken well (`input-well`).
- **Focus:** **one** contact ring replaces the per-family ring spread; the well
  stays neutral.
- **Identity:** if a field reads a real parameter, its data tag + LED live
  **outside** the box (label row), never on the border.
- Label sentence-case, typed value monospace, disabled = 45% opacity.

### Chips (Badge)

- **Style:** the outline pill stays — transparent fill, hairline border, mono xs,
  full radius, tight padding.
- **Meaning:** hue = what the thing _is_ (aqua, orange, violet), not a status
  role. Optional 7px LED dot, glowing only when live.
- Neutral chip = Muted Ink outline (the default).

### Rails (Slider / Toggle / Group)

- **Slider:** recessed self-tinted track, neutral thumb seeded with the family
  `strong` line, monospace readout; keyboard ring on the container. **Anatomy
  kept as-is** (the instrument archetype of the system).
- **Fill meaning:** the family names the parameter (`cutoff` = violet,
  `resonance` = orange); identity-less parameters take the **contact** hue.
- **Toggle:** the Pilot Light archetype — off = neutral well, **on = fill + a
  6px same-hue glow**.

### Scenes (MaterialScene / Canvas)

- **Wells** stay matte; **color becomes light** (radial Gruvbox fields behind a
  scene in `MaterialScene`). A **glass pane** floating above it carries the under-light into its
  material (under/over). LED label rows stay.

## Do's and Don'ts

### Do:

- **Do** keep the canvas the visual priority.
- **Do** treat color as light, material, data, or state — then stop.
- **Do** keep faces matte; spend saturation on marks, fills-that-mean, and glow
  (Pilot Light).
- **Do** use **one** contact hue for focus and default identity.
- **Do** use glass + blur for UI that floats over content, and let the surface
  below feed the material above.
- **Do** let shadows be tinted by the element that casts them.
- **Do** use monospace for readings, uppercase + wide tracking for titles.
- **Do** count boxes: fewer cages, hairline borders, wells before cards.
- **Do** build every control so touch works with no hover dependency.

### Don't:

- **Don't** make the UI feel like a SaaS dashboard — no gloss, no corporate
  per-suite blues, no stacked rounded rectangles.
- **Don't** use pure black; warm near-black Gruvbox layers are the ground.
- **Don't** put a saturated fill on a whole control face as its resting look.
- **Don't** color a focus ring per family — one contact ring for all.
- **Don't** blur in-flow content.
- **Don't** lean on big shadows; depth is tone and under/over.
- **Don't** reach for display-size headlines; the compact hierarchy is the system.
- **Don't** animate decoratively or perpetually; motion is 120–320ms, purposeful.
- **Don't** hardcode raw palette values in app code; tokens/consts are the only
  interface to color.
