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
components:
  button-primary:
    backgroundColor: "{colors.aurora}"
    textColor: "{colors.ground-fg}"
    rounded: "{rounded.sm}"
    padding: "8px 16px"
  button-primary-hover:
    backgroundColor: "{colors.aurora-strong}"
    textColor: "{colors.ground-fg}"
    rounded: "{rounded.sm}"
    padding: "8px 16px"
  button-secondary:
    backgroundColor: "{colors.solder}"
    textColor: "{colors.ground-fg}"
    rounded: "{rounded.sm}"
    padding: "8px 16px"
  button-muted:
    backgroundColor: "{colors.muted-well}"
    textColor: "{colors.muted-fg}"
    rounded: "{rounded.sm}"
    padding: "8px 16px"
  card:
    backgroundColor: "{colors.panel-surface}"
    textColor: "{colors.panel-fg}"
    rounded: "{rounded.md}"
    padding: "16px"
  input-default:
    backgroundColor: "{colors.input-well}"
    textColor: "{colors.ground-fg}"
    rounded: "{rounded.sm}"
    padding: "8px 12px"
  toggle:
    backgroundColor: "{colors.muted-well}"
    textColor: "{colors.ground-fg}"
    rounded: "{rounded.full}"
    width: "34px"
    height: "20px"
  badge:
    textColor: "{colors.muted-fg}"
    rounded: "{rounded.full}"
    padding: "2px 8px"
---

# Design System: The Terminal Atelier

## Overview

**Creative North Star: "The Terminal Atelier"**

The Terminal Atelier treats every interface as a workbench for making — a matte, warm-technical surface lit like a dim room where the thing being made is the only thing that should draw the eye. The ground is never black, never glossy, never corporate: it is Gruvbox-warm dark layered in quiet wells, and the UI that frames the canvas is a precise instrument rather than a dressed-up dashboard.

Everything recedes by default and answers when touched. Borders are barely-there hairlines; controls sit flat and calm until a state calls for them. Luminance is a currency spent deliberately: an active slider fill, a glowing toggle, an LED dot before a heading, the aura of a focused ring. Where the interface floats above the work — a floating control panel, a menu, a handle — it turns into glass, translucent and lightly blurred, so the canvas stays present through the chrome.

The character is **Terminal-hued**: the Gruvbox accents are named like bench hardware — Aurora Quartz, Solder Green, Neon Violet, Amber LED, Error Red — and used only as instrumentation, never as decoration. Type is compact and technical: tight sans UI type, uppercase tracked labels, and monospace readouts wherever a number or a value matters. Density is high but serene; the canvas is always the stage, the panel always its servant.

**Key Characteristics:**

- Matte, layered dark ground — never pure black, warmed by Gruvbox.
- Canvas-first: surrounding UI occupies as little attention as possible.
- Instrument-grade controls: tactile, confident, immediate feedback.
- Luminous accents as state language — glow means active, selected, or live.
- Glass + light backdrop blur reserved for floating UI above the canvas.
- Hairline borders, restrained radius, tonal surfaces instead of heavy shadows.
- Compact technical typography with monospace readouts.
- Responsive and touch-first: no interaction depends on hover.

## Color

A dual-mode Gruvbox system: every semantic token is a `light-dark()` pair and the app picks the live scheme via `color-scheme`. Components depend only on semantic tokens; the raw palette (`gruvbox-palette.stylex.ts`) is verbatim Gruvbox and is never referenced directly by components. Exact values live in `theme/tokens.stylex.ts` and in the frontmatter above.

Hardware naming:

- **Aurora Quartz** — primary (default action, focus identity, slider fill, toggle-on, selected segments).
- **Solder Green** — secondary (alt actions, second-choice chrome).
- **Neon Violet** — accent (signature/highlight moments: SectionHeading LED, accent controls, glow text). The most deliberately "instrument-decoration" of the hues.
- **Amber LED** — warning/caution; its foreground **Amber Ink** is almost black in light mode for contrast on yellow.
- **Error Red** — destructive states only.
- **Matte Ground** — app ground (Stage, canvas backdrop). Never pure black.
- **Panel Surface** — card/popover/floating fills, one step off the ground.
- **Muted Well** — non-editable recesses (tracks, rails, toggle-off); **Muted Ink** is its text/signal.
- **Input Well** — editable recesses (fields, selects), always bordered, distinct from muted.

Contrast (D4): where a pair falls under WCAG 4.5:1, the token is _derived_ via `color-mix(in oklab, …)` toward black/white (text) or toward `background` (dark elevated surfaces) — the palette itself is never edited. Audit: `uv run --no-project python scripts/audit_contrast.py`. Shortfalls (dark colored button text, decorative borders, dark track fill) are deliberate and listed in `component-authoring.md` § Colors.

### Named Rules

**The Pilot Light Rule.** Glow — actual luminosity — is a state language for active, selected, and live elements only. Idle elements stay matte; a glowing thing is a living thing.

**The Warm Ground Rule.** Never pure black. Depth comes from the layered Gruvbox darks (dark0→dark4), not from subtracting light to zero.

**The One-Token Rule.** Components consume semantic tokens only. The raw Gruvbox palette is the single source of truth and is never referenced by components directly.

## Typography

**Character:** compact, dense, technical — the voice of a bench instrument, not a magazine. Sans does the UI work; monospace takes over whenever a value is an instrument reading. Hierarchy roles and sizes live in the frontmatter and `theme/consts.stylex.ts`.

- **Headline** — SectionHeading titles (largest size in the system; no display headlines exist).
- **Title** — panel titles inside floating/docked control panels.
- **Section label** (mono) — ControlSection and tile labels.
- **Field label** — labels above inputs and alongside controls.
- **Body** — paragraph text, compact and readable.
- **Readout** (mono) — values in Readouts, input values, slider output.

### Named Rules

**The Upper-Label Rule.** Titles and section labels are uppercase with wide tracking; body and field labels stay sentence-case. Type distinguishes hierarchy through case + tracking, so it can stay small.

**The Mono Readout Rule.** Any displayed number, identifier, or parameter value — slider output, readout values, input text, badges — renders in monospace. If it reads like a reading, it's mono.

## Layout

Composition is a strict hierarchy that keeps the canvas supreme:

```text
ShellWrapper
└─ ExperimentShell
   ├─ Stage (canvas) — flex: 1, the star
   └─ ControlPanel — docked (side/bottom) or floating (glass)
      └─ ControlSection → widget
```

Cards group widgets in the stage; inside a panel, `ControlSection`s stack with a 12px gap and widget rows use the `space` scale (base 4px: 1=4, 2=8, 3=12, 4=16, 8=32, 12=48). `Stack` directions and gaps are string tokens.

Responsive behavior is structural, not a separate design:

- **Landscape** → panel docks vertically beside the canvas (fixed 280px, collapsible).
- **Portrait / ≤720px** → layout flows to a column; panel docks horizontally under (or floats) the canvas.
- The panel is always secondary, always collapsible, and easy to hide.

## Elevation & Depth

**Glass-first, lifted.** The system is matte by default but leans into translucent lift wherever UI floats above the canvas. Depth has four rungs and one orthogonal state channel:

1. **Flat** — no shadow, hairline border only. The resting state for in-flow surfaces (cards, wells).
2. **Raised** — a small tinted cast shadow. The shadow _paints itself_ in the element's own color, so a green button casts green and a card casts card.
3. **Sunken** — inset hairline shadow for embedded, recessed wells (input fields, tracks, muted group rails).
4. **Floating** — **glass**: translucency + `backdrop-filter: blur(24px) saturate(180%)` with a soft floating cast. Reserved for UI that sits over the canvas: floating panels, overlays, toolbars. A lighter blur scale (3/8/16px) plus `blurFab` supports it.

Glow (drop-shadow on `currentColor`) is **orthogonal to elevation**: it communicates active/selected/live state; it never simulates height. In-flow surfaces stay opaque so text contrast never depends on what's behind them — only floating layers hold glass.

### Shadow Vocabulary

Exact values in `theme/shadows.stylex.ts` (all `color-mix`-derived from `--shadow-color`):

- **rest** — resting pressable controls.
- **hover** — raised hover.
- **raised** — docked panels, floating-card elevation.
- **active** (inset) — pressed-in state.
- **sunken** (inset) — embedded wells, slider tracks, toggle-off.
- **floating** — glass and floating UI.

### Named Rules

**The Shadow-Paints-Itself Rule.** Every shadow derives from `--shadow-color`; an element sets its shadow color to its own background (`[shadowColor.color]`), so shadows are always tinted by their carrier and never a flat black.

**The Glass-on-Floating-Only Rule.** Blur and translucency exist only on UI that floats above other content. Anything in normal document flow stays opaque — blur is for floating, not for everything.

## Shapes

Radius is a small, quiet scale (`0 / 4 / 6 / 8 / 12 / full`) in `theme/consts.stylex.ts`. Panels and cards sit at 4–8px; wells at 4px; the only perfect circles belong to intentional interactive shapes — slider thumbs, toggle tracks, badges, LED dots. Borders are hairline (1px) and translucent. The silhouette discipline: _not everything is a card_. Plans/rows/labels are typography first, boxes second; avoid stacking rounded rectangles into a "ui kit shoebox."

## Components

### Buttons

- **Shape:** 4px radius, hairline solid border matching the fill color, compact padding, medium 14px sans.
- **Primary:** Aurora Quartz fill + border, warm ground text. Hover → Aurora Quartz Strong. Active → pressed tinted shadow + `scale(0.98)`.
- **Secondary / Accent / Warning / Destructive:** same anatomy, each in its family hue; muted = Muted Well fill, Muted Ink text (no saturated fill).
- **Loading:** 12px `currentColor` spinner plus `aria-busy`; disabled = 45% opacity, `not-allowed`.
- **Focus:** the universal halo — `0 0 0 2px` ground behind `0 0 0 3px` family ring; keyboard only.

### Cards & Containers

- **Corner Style:** 6px. **Background:** Panel Surface. **Border:** hairline. **Padding:** 16px, 12px internal gap. Flat at rest — shadow only when explicitly raised/floated.
- **Stage:** the canvas surface — 8px radius, hairline border, `background` ground, min-height 240px, scrollable.

### Inputs / Fields

Treated as **sunken wells**: Input Well fill, hairline border, 4px radius. On focus the border and halo switch to the variant's hue (default Aurora) while the fill stays. Field labels sit above; typed value renders in monospace. Disabled = 45% opacity.

### Slider / Toggle / Segmented

- **Slider:** 4px thumb, full-radius track in Muted Well; fill in the variant hue; thumb is the ground color with a variant-hue border and a self-tinted rest shadow; the keyboard focus ring lives on the container (the native input is invisible); a monospace right-aligned output reads the value.
- **Toggle:** full-radius track, small knob on 2px inset. Off = Muted Well track + variant border; **On = filled with the variant hue and a 6px same-hue glow** — the archetype of the Pilot Light Rule.
- **Segmented:** a Muted Well rail; the chosen segment fills with the variant (muted chosen = variant border + brighter text over transparent, never a fill on a fill).

### Badges

Monospace outline pills — transparent fill, hairline border, full radius, tight padding. Neutral = Muted Ink; variants tint border + text only (no fill beyond neutral).

### Readout

An instrument display: hairline-bordered pill (4px radius, Panel Surface) pairing a field label with a monospace value — the canonical "label : value" reading.

### Signature Component: SectionHeading

The system's identity piece — a glowing accent LED dot (7px, full radius, Neon Violet, soft drop-shadow), an optional mono index, and an uppercase wide-tracked 18px title. It opens a section of the atelier like a status light coming on.

## Do's and Don'ts

### Do:

- **Do** keep the canvas the visual priority — scaffolding occupies minimal attention and never competes with the work.
- **Do** spend glow on active, selected, or live state only (Pilot Light Rule).
- **Do** use glass (translucent + blur) for floating UI and keep in-flow surfaces opaque.
- **Do** use monospace for readings and values (Mono Readout Rule); uppercase + wide tracking for titles (Upper-Label Rule).
- **Do** let shadows be tinted by the element that casts them (`[shadowColor.color] = own background`).
- **Do** show keyboard focus with the 2px-ground + 3px-ring halo, whatever the color.
- **Do** build every control so touch works with no hover dependency.

### Don't:

- **Don't** feel like a SaaS dashboard — no gloss, no corporate blues-per-suite, no heavy decorations.
- **Don't** use pure black; warm near-black Gruvbox layers are the ground (Warm Ground Rule).
- **Don't** blur in-flow content — backdrop blur is only for floating UI (Glass-on-Floating-Only Rule).
- **Don't** lean on big shadows; surfaces are flat by default and shadow is a response to state.
- **Don't** reach for display-size headlines; the compact hierarchy is the system.
- **Don't** animate decoratively or perpetually — motion is fast (120–320ms) and purposeful.
- **Don't** hardcode raw palette values in app code; semantic tokens are the only interface to color.
