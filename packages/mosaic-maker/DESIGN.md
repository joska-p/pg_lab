---
name: Mosaic Maker
description: Infinite procedural SVG mosaic toy on a CSS-variable engine.
colors:
  foreground: light-dark(color-mix(in oklab, oklch(0.277 0 0) 80%, black), oklch(0.965 0.039 100.862))
  background: light-dark(oklch(0.894 0.057 89.24), oklch(0.277 0 0))
  card: light-dark(oklch(0.956 0.055 96.155), color-mix(in oklab, oklch(0.344 0.007 48.523) 55%, oklch(0.277 0 0)))
  muted: light-dark(oklch(0.756 0.041 82.284), color-mix(in oklab, oklch(0.411 0.012 51.866) 60%, oklch(0.277 0 0)))
  muted-foreground: light-dark(color-mix(in oklab, oklch(0.241 0.005 219.672) 85%, oklch(0.411 0.012 51.866)), oklch(0.756 0.041 82.284))
  border: light-dark(color-mix(in oklab, oklch(0.756 0.041 82.284) 75%, transparent), color-mix(in oklab, oklch(0.411 0.012 51.866) 70%, transparent))
  ring: light-dark(oklch(0.693 0.042 169.768), oklch(0.471 0.082 215.806))
  aurora: light-dark(oklch(0.693 0.042 169.768), oklch(0.471 0.082 215.806))
  solder: light-dark(oklch(0.765 0.158 110.835), oklch(0.546 0.112 106.464))
  neon-violet: light-dark(oklch(0.705 0.098 2.189), oklch(0.489 0.124 344.276))
  amber: light-dark(oklch(0.832 0.159 82.987), oklch(0.618 0.128 70.674))
typography:
  title:
    fontFamily: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
    fontSize: 0.875rem
    fontWeight: 500
    lineHeight: 1.25
    letterSpacing: 0.02em
  body:
    fontFamily: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
    fontSize: 0.875rem
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "-0.01em"
  label:
    fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", monospace'
    fontSize: 0.75rem
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: 0.02em
rounded:
  sm: 4px
  md: 6px
  full: 9999px
spacing:
  1: 4px
  2: 8px
  3: 12px
  4: 16px
  6: 24px
components:
  button-base:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.sm}"
    padding: 8px 16px
  button-base-hover:
    backgroundColor: "{colors.muted}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.sm}"
    padding: 8px 16px
  card-surface:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    padding: 16px
  segmented-chosen:
    backgroundColor: "{colors.muted-foreground}"
    textColor: "{colors.background}"
    rounded: "{rounded.sm}"
    padding: 1px 12px
  slider-thumb:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.full}"
    size: 14px
---

# Design System: Mosaic Maker

## Overview

**Creative North Star: "The Playful Grid"**

Mosaic Maker is a joyful toy, not a tool. The chrome is a calm laboratory bench; the artwork is the kinetic, ever-drifting mosaic it holds. Panels, buttons, and sliders stay small, neutral, and tactile so that scrubbing a control and watching hundreds of SVG tiles mutate feels immediate and surprising.

The interface is entirely inherited from `@repo/ui` — there is no app-private visual world. Mosaic Maker adds only one signature surface on top: a live CSS-contract grid (`--tile-size`, `--mosaicGap`, `--color-0..4`, `--rotation-0..3`) rendered as flat 100×100 SVG tiles. Everything else — shell, panel, stage, buttons, sliders, segmented theme switch — is the shared lab system.

**Key Characteristics:**

- Joyful toy: coarse, partial control beats precise control; every render drifts.
- Neutral chrome, loud artwork: the frame recedes so the mosaic leads.
- Flat-by-default lab instrument: depth appears only on hover, press, or focus.
- Touch-first, keyboard-operable, `prefers-reduced-motion`-aware throughout.

## Colors

Neutral gruvbox lab chrome frames dynamic mosaic artwork; the frame never competes with the tiles.

### Primary

- **Quiet Paper Ground** (`light-dark(oklch(0.894 0.057 89.24), oklch(0.277 0 0))`): app and stage base (`background`). Warm paper in light mode, near-black audiophile dark in dark mode. The mosaic sits directly on it.

### Secondary

- **Card Parchment** (`light-dark(oklch(0.956 0.055 96.155), color-mix(...dark1 55%, dark0))`): panels, buttons at rest, cards (`card`). Slightly lifted from the ground so controls read as instruments.
- **Soft Lab Gray** (`light-dark(oklch(0.756 0.041 82.284), color-mix(...dark2 60%, dark0))`): tracks, wells, segmented group beds (`muted`). Sunken beds that controls sit inside.

### Tertiary

- **Aurora Signal Blue** (`light-dark(oklch(0.693 0.042 169.768), oklch(0.471 0.082 215.806))`): default family for sliders and Shuffle Colors (`aurora`). Calm, technical, joyful without shouting.
- **Solder Leaf Green** (`light-dark(oklch(0.765 0.158 110.835), oklch(0.546 0.112 106.464))`): Regenerate Tiles (`solder`). The "go again" accent.
- **Neon Violet Jolt** (`light-dark(oklch(0.705 0.098 2.189), oklch(0.489 0.124 344.276))`): Cycle Palettes (`neon-violet`). Reserved for the most surprising action.
- **Amber Workshop Yellow** (`light-dark(oklch(0.832 0.159 82.987), oklch(0.618 0.128 70.674))`): Shuffle Rotations (`amber`, dark ink text on light). Warm kinetic accent for orientation play.

### Neutral

- **Ink on Paper** (`light-dark(color-mix(...dark0 80%, black), oklch(0.965 0.039 100.862))`): primary text (`foreground`, `cardForeground`).
- **Muted Bench Note** (`light-dark(color-mix(...dark0Hard 85%, dark2), oklch(0.756 0.041 82.284))`): labels, section titles, readouts (`mutedForeground`).
- **Hairline Bench Edge** (`color-mix(... 70–75%, transparent)`, hairline `1px`): every border and divider (`border`).
- **Focus Ring Blue** (`light-dark(oklch(0.693 0.042 169.768), oklch(0.471 0.082 215.806))`): `0 0 0 3px` focus ring over a `2px` background gap (`ring`). Always visible, never decorative.

### Named Rules

**The Neutral Chrome Rule.** Chrome stays gruvbox neutral; hue lives in the mosaic tiles (`--color-0..4`) and the four action families. Never introduce a fifth chrome accent for decoration.
**The Dynamic Palette Rule.** `--color-0..4` are runtime content from `nice-color-palettes` (fallback cool grays `#333333`–`#bbbbbb`), never brand tokens. Do not canonize any single mosaic palette.

## Typography

**Display Font:** system-ui stack (with `-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`)
**Body Font:** system-ui stack (same as display — one Sans voice throughout chrome)
**Label/Mono Font:** `"SFMono-Regular", Consolas, "Liberation Mono", monospace`

**Character:** A quiet lab pairing — uppercase Sans titles that label instruments, and Mono micro-labels and numeric readouts that feel measured. No editorial display type; the mosaic is the display.

### Hierarchy

- **Title** (medium `500`, `0.875rem`, tight `1.25`, wide `0.02em`, uppercase): `ControlPanel` title and control labels. Names the instrument (`Tile set`, `Shuffle Colors`).
- **Body** (regular `400`, `0.875rem`, normal `1.5`, tight `-0.01em`): button text, helper copy, slider rows. Kept at `62ch` max where prose appears.
- **Label** (medium `500`, Mono `0.75rem`, normal `1.5`, wide `0.02em`, uppercase): section eyebrows (`ControlSection` titles), tile-set names, slider values (`0.875rem` Mono for values), loading footers. Muted color unless it is a value.

### Named Rules

**The Two-Voice Rule.** Sans names and acts; Mono measures and reports. Never set a numeric readout or eyebrow in Sans, never set a sentence in Mono.
**The Uppercase Eyebrow Rule.** Section titles are always Mono `0.75rem`, uppercase, wide-tracked, muted. Larger or sentence-case section titles break the bench rhythm.

## Layout

A docked lab bench: flexible stage left, fixed instrument rail right. `ExperimentShell` is `row` (`100%` width/height, `12px` gap) with a `280px` control panel and a fluid stage (`240px` min-height, `24px` padding). Below `720px` width or in portrait it stacks to `column` and the panel caps at `300px` height with internal scroll.

The mosaic itself is a centered CSS grid (`repeat(auto-fit, var(--tile-size))`, `gap: var(--mosaicGap)`, default tile `64px`, gap `0px`). Tile count is derived from the live container size; sliders (`32–256px` tile, `0–64px` gap, `2px` steps, `150ms` debounce-regenerate) are the only layout controls. Spacing rhythm is `4px`-based (`4px`, `8px`, `12px`, `16px`, `24px`); panel internals are `16px` padding with `16px` section gaps, stage padding is `24px`.

## Elevation & Depth

Flat-by-default. Surfaces rest flat on tonal layering (paper ground vs. parchment card vs. gray well); shadows appear only as a response to state — hover, press, focus — never as static decoration.

### Shadow Vocabulary

- **Resting hairline** (`0 1px 2px color-mix(...18%), 0 1px 1px color-mix(...10%)`): buttons, thumbs, pressables at rest. Barely-there lift.
- **Hover lift** (`0 2px 8px color-mix(...36%)`): raised control under the pointer.
- **Pressed inset** (`inset 0 1px 1px color-mix(...18%)`): active press confirmation.
- **Floating panel** (`0 8px 28px color-mix(...45%), 0 2px 8px color-mix(...30%)`): floating panel placement and glass panel over stage.
- **Sunken well** (`inset highlights + inset 0 1px 3px color-mix(...16%)`): slider tracks, muted wells.

### Named Rules

**The Flat-By-Default Rule.** No static drop shadows on panels, stage, or tiles. If it is not hovered, pressed, focused, or floating, it is flat.

## Shapes

Gently squared lab instruments on a seamless tile field. Buttons, swatches, tile-set options, and segmented pills are softly squared (`4px`); panels, stage, and cards step up to (`6px`); only knobs, thumbs, spinners, LEDs, and toggle pills go fully round (`9999px`). Tiles themselves are unclipped squares (`0px` radius, `hidden` overflow) — the grid gap, not corner radius, draws the mosaic rhythm. Borders are uniformly hairline (`1px`) solid in `border` color.

## Components

Chrome components are `@repo/ui` primitives verbatim — Mosaic Maker invents no button, slider, or panel style. Documented here as used.

### Buttons

- **Shape:** softly squared (`4px`), hairline border, `8px 16px` padding, Sans `0.875rem` medium.
- **Primary:** parchment fill (`card`) with ink text (`foreground`); resting hairline shadow. Families tint on hover (`color-mix(...card 86%, strong)`) and show a LED dot when a `family` is set.
- **Hover / Focus:** hover lifts (`hover` shadow) and tints border toward the family strong (`55%` mix); focus-visible draws `0 0 0 2px background, 0 0 0 3px ring`; active scales to (`0.98`).
- **Secondary / Ghost / Tertiary:** not used. The four action buttons are `aurora` (Shuffle Colors), `amber` (Shuffle Rotations), `neon-violet` (Cycle Palettes), `solder` (Regenerate Tiles). Theme switch is a neutral `Segmented`, not buttons.

### Chips (if used)

Not used. Tile-set toggles and palette strips are buttons with `radio`/`pressed` semantics, not chips.

### Cards / Containers

- **Corner Style:** stepped up (`6px`).
- **Background:** parchment (`card`) with ink text; `sunken` variant drops to gray (`muted`) well.
- **Shadow Strategy:** flat at rest per the Flat-By-Default Rule; `raised`/`floating`/`glass` effects only for overlays.
- **Border:** hairline (`1px`) in `border` color.
- **Internal Padding:** roomy (`16px`) with `12px` internal gaps.

### Inputs / Fields

- **Style:** custom slider only — sunken gray rail (`4px` height, pill `9999px`), parchment thumb (`14px` circle, hairline strong-color border, resting shadow), family-color fill (`aurora` default).
- **Focus:** pill container draws `0 0 0 2px background, 0 0 0 3px ring` on `:focus-visible`; native range input is visually hidden (`opacity: 0`) but keyboard-operable over a `44px` touch target.
- **Error / Disabled:** disabled drops to `0.45` opacity with `not-allowed` cursor; no error state exists.

### Navigation

No app navigation. Panel visibility is a single `hide panel / show panel` button (absolute, `12px` offsets, `overlay`/`panel` z-index `100/200`); theme is a `Segmented` radio group (`light/dark/system`, arrow-key roving, neutral chosen state, `4px` group bed with `4px` pills).

### Signature Component

**Mosaic grid + Tile.** The grid is a centered `display: grid` field writing `--tile-size` (`64px` default), `--mosaicGap` (`0px`), `--color-0..4`, `--rotation-0..3` (`0/90/180/270deg`) onto its node. Each `Tile` is an SVG (`viewBox 0 0 100 100`, `width/height: var(--tile-size)`, `rotate(var(--rotation-x))`) from 8 families (Square, CornerCircles, OppositeCircles, MiddleCircle, Diamond, Triangles, Cube, Rainbow), fills bound to `var(--color-n)`, morphing on a slow expo-out (`500ms`, `cubic-bezier(0.16, 1, 0.3, 1)`, `0ms` under `prefers-reduced-motion`). **PalettePicker** strips are vertical 5-chip stacks (`36×26px` chips, `2px` pad, `4px` radius, hairline border, `3px` ring when selected). **TileSetControls** is a `repeat(4, 1fr)` preview grid (`32px` tiles, `16px/8px` gaps) with dimmed (`0.65` opacity) unselected states and `3px` ring selection.

## Do's and Don'ts

Concrete guardrails from the incumbent implementation.

### Do:

- **Do** keep all chrome in `@repo/ui` tokens and primitives; put mosaic-only geometry in `--tile-size`, `--mosaicGap`, `--color-0..4`, `--rotation-x` on the mosaic node.
- **Do** keep tiles flat squares with `hidden` overflow and let `gap` (`0–64px`) draw the grid rhythm.
- **Do** use the four action families exactly as assigned: `aurora` / Shuffle Colors, `amber` / Shuffle Rotations, `neon-violet` / Cycle Palettes, `solder` / Regenerate Tiles.
- **Do** honor `prefers-reduced-motion` (`500ms` → `0–1ms`, infinite spin → single turn) on every tile, thumb, and spinner transition.
- **Do** keep touch targets at `44px` minimum and keyboard semantics (`radio`, `pressed`, roving `Segmented`) on every control.

### Don't:

- **Don't** add an app-local color, font, radius, or shadow — theme changes flow through `@repo/ui`, never an app stylesheet (`style.css` holds only `box-sizing`, `color-scheme`, and body margin).
- **Don't** bake mosaic colors into CSS or canonize the fallback grays (`#333333`–`#bbbbbb`); palettes are runtime data, cached 7 days, degrading silently to one palette.
- **Don't** give tiles static shadows, radii, or borders — depth on tiles reads as chrome competing with the artwork.
- **Don't** depend on `PG_LAB` or sibling packages; Mosaic Maker must stay runnable solo under `vp dev`.
- **Don't** put logic-driven styling outside CSS variables — pure modules in `core`/`stores/mosaic`/`utils` talk to the DOM only through `style.setProperty`.
