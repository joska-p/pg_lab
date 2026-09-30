---
name: The Optical Bench
description: A comparison instrument for the @repo/ui design system — eight tinted surfaces across three elevations, two fill densities and three tint channels, judged side by side in three themes.
colors:
    neutral-tint: light-dark(oklch(0.69 0.035 76.307), oklch(0.55 0.023 62.567))
    aurora: light-dark(oklch(0.693 0.042 169.768), oklch(0.471 0.082 215.806))
    solder: light-dark(oklch(0.765 0.158 110.835), oklch(0.546 0.112 106.464))
    purple: light-dark(oklch(0.705 0.098 2.189), oklch(0.489 0.124 344.276))
    amber: light-dark(oklch(0.832 0.159 82.987), oklch(0.618 0.128 70.674))
    error: light-dark(oklch(0.66 0.218 30.392), oklch(0.437 0.179 28.26))
    aqua: light-dark(oklch(0.756 0.108 137.676), oklch(0.534 0.082 155.401))
    orange: light-dark(oklch(0.731 0.182 51.693), oklch(0.513 0.162 39.297))
    surface-ground: light-dark(oklch(0.956 0.055 96.155), oklch(0.277 0 0))
    surface-ink: light-dark(oklch(0.277 0 0), oklch(0.956 0.055 96.155))
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
    label:
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
        fontSize: '0.875rem'
        fontWeight: 500
        lineHeight: 1.5
        letterSpacing: '-0.01em'
    body:
        fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", monospace'
        fontSize: '0.875rem'
        fontWeight: 400
        lineHeight: 1.5
        letterSpacing: '0'
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
    button-tinted-raised:
        backgroundColor: '{colors.aurora}'
        textColor: '{colors.surface-ink}'
        typography: '{typography.label}'
        rounded: '{rounded.md}'
        padding: '8px 16px'
    button-tinted-soft:
        backgroundColor: 'color-mix(in oklab, {colors.aurora} 18%, transparent)'
        textColor: '{colors.surface-ink}'
        typography: '{typography.label}'
        rounded: '{rounded.md}'
        padding: '8px 16px'
    button-accent-flat:
        backgroundColor: '{colors.surface-ground}'
        textColor: '{colors.surface-ink}'
        typography: '{typography.label}'
        rounded: '{rounded.md}'
        padding: '8px 16px'
    card-tinted-soft:
        backgroundColor: 'color-mix(in oklab, {colors.neutral-tint} 18%, transparent)'
        textColor: '{colors.surface-ink}'
        rounded: '{rounded.md}'
        padding: '16px'
    checkbox-on-tinted:
        backgroundColor: '{colors.aurora}'
        rounded: '{rounded.sm}'
        size: '18px'
    checkbox-off-accented:
        backgroundColor: '{colors.surface-ground}'
        rounded: '{rounded.sm}'
        size: '18px'
    panel-soft:
        backgroundColor: 'color-mix(in oklab, {colors.neutral-tint} 18%, transparent)'
        rounded: '{rounded.md}'
        width: '320px'
    stage-soft-raised:
        backgroundColor: 'color-mix(in oklab, {colors.neutral-tint} 18%, transparent)'
        rounded: '{rounded.md}'
        padding: '16px'
---

# Design System: The Optical Bench

## Overview

**Creative North Star: "The Optical Bench"**

An optical bench lines up specimens under a single light and lets you turn one adjustment at a time. That is the whole proposition here. This system is not a set of pretty surfaces; it is an instrument for deciding which surface becomes the system's surface. Every choice the design makes serves that one job — making a difference visible, and making it attributable to exactly one variable.

The geometry is deliberately sober. Corners are short (`rounded.md`, 6px). Borders are hairlines (1px). There are no gradients on any component, no shadows of atmosphere, no decorative motion. Type is two system families at small sizes, with headings set in uppercase and wide-tracked so they read as index tabs rather than titles. All of this restraint exists to protect the one thing the system is actually loud about: **color**. Eight tinted accents are running at once across a matrix of variants, and every visual decision here is in service of keeping them mutually distinguishable.

The result should feel like precision instrumentation rather than a product: dense, quiet, and completely uninterested in impressing anyone. What earns delight here is not polish on any single component — it is the moment a whole matrix resolves at once and the comparison becomes obvious.

**Key Characteristics:**

- A tint is applied through **three independent channels** — background, border, shadow — and any subset is legal.
- Every accent exists as a **light/dark pair** whose hue shifts between themes; the dark palette is re-tuned, not merely darkened.
- Elevation is a **value you choose and compare**, a peer of color and fill density, not decoration.
- Two fill densities: solid, and a veil at 18% of the tint.
- Geometry stays quiet so the palette can be loud.
- Interactive controls are minimum 44×44px at the hit level, even when the visible box is far smaller.

### Known gaps in the current implementation

This document records the system's intended rules. Three pieces of the incumbent app do not yet obey them, and are the first things any refinement should close:

1. **The lab's own chrome is half-migrated.** `ExperimentShell`, `ControlPanel`, `Stack` and the lab surfaces still consume an older parallel token layer whose `neutral` resolves to a near-white paper instead of the mid warm gray documented above. Every component _under test_ is correct.
2. **Form controls are unstyled user-agent elements.** The theme `<select>`, the variant checkboxes and the "Reset" buttons currently render with browser defaults — serif 16px, `2px outset` borders, 13px checkboxes — inside a panel whose labels are already on-token.
3. **`html` is pinned to `color-scheme: dark` by the shared base stylesheet** while the app switches the theme on an inner node, so anything that does not set an explicit ink token inherits the wrong foreground in light mode.

## Colors

Warm paper against warm ink, with eight saturated accents whose light and dark forms are separately tuned rather than computed.

### Primary

The system's primary role is **tint**, not brand. A tint is a pair of colors bound into one token by `light-dark()`, and it is applied through channels, never as a fill on its own.

- **Neutral Tint** (`{colors.neutral-tint}`): the accent of record. A mid warm gray in light mode, a deeper warm brown-gray in dark. Used wherever a surface must read as _neutral-with-an-accent_ — the default tint for Cards, and the only tint used for the shell chrome (stage slot, panel).
- **Aurora** (`{colors.aurora}`): cyan-teal in light mode, shifting to a distinctly bluer hue in dark. The only accent whose hue moves by as much as 46°; it is the system's demonstration that the dark palette is re-tuned rather than inverted.
- **Solder** (`{colors.solder}`): a bright yellow-green, high chroma, the most luminous accent at high lightness.
- **Amber** (`{colors.amber}`): golden yellow cooling to amber in dark.
- **Aqua** (`{colors.aqua}`): green-teal, rotating to a spring green in dark.
- **Purple** (`{colors.purple}`): a pink-crimson in light mode, deepening to true crimson in dark.
- **Orange** (`{colors.orange}`): warm orange, and the reserved voice for messages (see Typography).
- **Error** (`{colors.error}`): the deepest, most saturated red in the system, and the only accent not offered as a general tint in the variant matrix.

### Neutral

- **Ground** (`{colors.surface-ground}`): the page and surface background — a warm near-white paper in light mode, a warm near-black in dark.
- **Ink** (`{colors.surface-ink}`): the default foreground on any surface, and the exact inverse of Ground so that a surface is legible without a tint.
- **Veiled Neutral** (`color-mix(in oklab, {colors.neutral-tint} 18%, transparent)`): the working fill for passive surfaces that must not compete with the specimen — the panel, the stage slot, and Cards.

### Named Rules

**The Three-Channel Rule.** A tint reaches a surface through exactly three channels: background, border, shadow. Each is independently switchable, and any subset is legal. Three channels filled means _this surface is the color_. Border and shadow only means _this surface is neutral with an accent_. Background only means _a wash with no edge_. Never reach for a named combination like "accented" or "tinted" — the correct subset is a property of the component, not of the vocabulary.

**The One-Accent Rule.** A surface carries at most one tint. Two accents on one surface is a defect, not a style.

**The Eight Rule.** Exactly eight tints exist. Adding a ninth means removing one. The count is small enough that all eight can share a screen and stay mutually legible; that property is the reason for the number.

## Typography

**Display Font:** system sans — `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
**Body Font:** the same system sans
**Label/Mono Font:** system mono — `"SFMono-Regular", Consolas, "Liberation Mono", monospace`

**Character:** Two faces with one job each. Sans is for anything the operator reads as a _label_; mono is for anything that is a _measured value_ — counts, dimensions, filter results, IDs. The pairing carries no personality because it carries no need to: it separates "what this is" from "what this measures", and that is the only distinction the instrument needs.

### Hierarchy

- **Display** (600, `1.125rem`, lh 1.25, tracked `0.02em`, uppercase): the topmost heading only. Used almost nowhere by design.
- **Headline** (500, `0.875rem`, lh 1.25, tracked `0.02em`, uppercase): the workhorse section label — every group in the control panel. Small, tracked, uppercase: an index tab, not a title.
- **Title** (mono 500, `0.75rem`, tracked `0.02em`, uppercase): the narrowest label tier, for metadata headings inside dense groups.
- **Label** (500, `0.875rem`, tracked `-0.01em`): control labels and button text. The default reading size of the interface.
- **Body** (mono 400, `0.875rem`): values, counts and readouts. Always mono, so a number is never mistaken for a label.

### Named Rules

**The Two-Face Rule.** Two families, never three. Mono is reserved for measured values; if something is not a measured value, it is sans. A third family has no meaning to add here.

**The Measured-Value Rule.** Any string that is a value rather than a name gets mono: the `N cards × M components = K nodes` readout, filter option labels that are literal tokens (`soft`, `raised`, `true`), and the variant slug under test. This is what lets the operator scan a matrix and pick out values from names without reading them.

## Layout

The instrument is a two-column frame: a fixed-width control panel and a flexible stage that holds the matrix.

- **The frame.** The panel is a fixed 320px column; the stage takes the remainder. Below the narrow breakpoint the frame collapses to a single column and the panel becomes a bottom sheet capped at 300px tall, because a comparison instrument viewed on a phone still has to show controls and specimen together.
- **Independent scroll.** The stage and the panel each scroll on their own axis. The stage reserves a stable scrollbar gutter so that toggling scrollbars never reflows the matrix horizontally — a matrix that shifts when it gains a row is a matrix you stop trusting.
- **Shell inset.** The shell is flush to the viewport edge by default and takes a 16px inset at ≥1024px, at which point the stage and panel also gain their 6px corners. Below that they are square-cornered, because a rounded card floating at the very edge of a phone screen has nothing to round against.
- **Spacing rhythm.** Every dimension comes from the 4px-based scale. Vertical grouping inside the panel uses a 16px step; gaps within a group use 8px and 12px.
- **Panel toggle.** The panel is dismissible via a floating control. When the panel is floating, its toggle offsets by the panel gap so the two never overlap.

### Named Rules

**The 4px Rule.** No dimension is a free number. Every gap, pad, offset and radius is a named step of the spacing scale, and every control dimension is a named step of the layout scale.

**The Stable-Gutter Rule.** Anything that scrolls reserves its scrollbar space permanently. Reflow caused by a scrollbar appearing is never acceptable in a comparison tool, because it changes the very alignment the operator is reading.

## Elevation & Depth

Depth is a **hybrid that is explicitly parameterized**: the system has three shadow states, and which one a surface uses is a value the operator selects and compares, not a decoration the system applies.

- **flat** — no shadow. The neutral default and the correct state for a passive surface.
- **raised** (`0 2px 8px` of the tint's own shadow color at 36%) — a short, tight, chromatic shadow. The shadow is tinted by the surface's own accent rather than neutral black, which is what keeps eight simultaneous accents from muddying each other.
- **sunken** — an inset pair: a bright top edge at 88% and a dark inner spread at 16%. Reads as a carved recess rather than a hole.

Critically, the default elevation differs **by role**, and those defaults are deliberate: Cards are flat, Buttons are raised, the stage slot is raised so the specimen field reads as a lit surface, and the panel is flat because a raised panel would compete with the matrix it is meant to control.

### Shadow Vocabulary

- **raised** (`box-shadow: 0 2px 8px <tint shadow> 36%`): Buttons and the stage slot. Short and chromatic.
- **sunken** (`box-shadow: inset 0 1px 0 <tint shadow> 88%, inset 0 1px 3px <tint shadow> 16%`): recessed wells and inputs.
- **none**: the default. Passive surfaces.

### Named Rules

**The Shadow-Is-A-Variant Rule.** Shadow is one of the axes a surface is judged along, exactly like color and fill density. A shadow that appears for reasons of hierarchy rather than selection has been applied without permission.

**The Tinted-Shadow Rule.** No neutral-black shadow anywhere. Every shadow takes its color from the surface's own tint channel, so that depth and hue never disagree.

**The 18% Rule.** Fills, borders and shadows are one density family: veiled fill at 18%, subtle border at 10%, strong border at 20%, raised shadow at 36%. These four numbers are the entire opacity vocabulary of the system.

## Shapes

Form language is short-cornered and utilitarian. The default corner is `rounded.md` (6px); controls step down to `rounded.sm` (4px); `rounded.lg` (8px), `rounded.xl` (12px) and `rounded.full` exist in the scale for larger surfaces and pills, but a 6px corner is what a component gets unless there is a stated reason.

Borders are always 1px hairlines (`borderWidth.hairline`). There is no heavier border in the system. Clipping follows the corner: where a surface needs to clip its content, it clips at the same 6px it draws itself.

### Named Rules

**The 6px Rule.** 6px is the system's corner, and it is not a default to be overridden casually. Larger radii are reserved for genuinely rounded containers; smaller radii are for controls. A component whose corner differs from its role's default needs a reason written next to it.

**The Hairline Rule.** One border weight exists. Weight is expressed by opacity and color, never by thickness.

## Components

Every component is composed from the same four inputs — a tint, a set of channel flags, a fill density, an elevation — and no component hardcodes a color. This is what makes a matrix of hundreds of variants possible without a single per-variant stylesheet.

### Buttons

- **Character:** small, dense, immediate. The form is quiet; the tint does the talking.
- **Shape:** `rounded.md` (6px), `padding: 8px 16px`, label type at 500 weight.
- **Primary (all three channels):** the tint fills background, border and shadow. Buttons are the system's most saturated surface — the component that _is_ the color.
- **Soft (`bg: 'soft'`):** background veiled to 18%, border and shadow at full tint.
- **Accented (no fill):** ground background, tint on border and shadow only.
- **Elevation:** raised by default, `0 2px 8px` of its own tint.
- **Hover / Focus / Active:** hover darkens the fill toward black in light mode and toward white in dark, both via `light-dark()`, so the same rule reads correctly in both themes. Press scales to `0.98`. Focus-visible draws a 1px outline in the tint's border color at 2px offset — never a glow, never a color change.
- **Motion:** 300ms on `background-color, border-color, color, box-shadow, transform`, easing `cubic-bezier(0.16, 1, 0.3, 1)`.

### Checkboxes

- **Character:** the system's smallest tinted surface — a compact box that carries a full tint, no label inside it.
- **Shape:** `rounded.sm` (4px), `layout.checkboxSize` (18px) visible box.
- **On:** the tint fills background, border and shadow; a 12px stroked check glyph in the current ink color.
- **Off:** ground background with the tint on border and shadow.
- **Interaction:** the same hover/press/focus treatment as Buttons.
- **Hit area:** the visible box is 18px, but an absolutely-positioned 44px (`layout.controlTouchTarget`) transparent span is centered on it and marked `aria-hidden`, so the touch target is generous without inflating the visual or announcing a phantom control.
- **Text tint:** when a checkbox is on but its background is _not_ tinted, the ink switches to the tint color, so the mark never becomes unreadable.

### Cards / Containers

- **Character:** passive surfaces that frame a specimen without competing with it.
- **Corner Style:** `rounded.md` (6px).
- **Background:** `soft` (18% veil) by default; Card defaults to **no** background tint — only border and shadow — so a tinted Card reads as neutral paper with an accent edge.
- **Shadow Strategy:** flat by default, per the Shadow-Is-A-Variant Rule.
- **Border:** `borders.subtle`, hairline at 10% of the tint.
- **Internal Padding:** 16px, with a 12px gap between children.

### Panels & Stage

- **Panel:** 320px fixed, flat, soft-filled, 6px corners at desktop widths, independently scrollable.
- **Stage slot:** raised, soft-filled, 16px padding, stable scrollbar gutter, hosts the matrix.
- **Shell backdrop:** the frame sits on the full-bleed `chaos` ground — eight large radial washes of the eight accents at 20–30%, over a soft diagonal. This is deliberate and permanent: it is a standing reminder that the system manipulates eight hues simultaneously, and it guarantees no specimen is ever judged against a flat, fictional backdrop.

### Not yet built

`select`, `checkbox` (native form inputs), and a plain reset button exist in the interface but are not yet composed from this token layer; they currently render with user-agent styling. Any control added to this system must be built from `surfaceStyles()` and `interactionStyles()` like every other component, and must keep a 44px hit area.

## Do's and Don'ts

### Do:

- **Do** judge every variant in all three themes before accepting it. A tint that survives only one color scheme has not been evaluated.
- **Do** set a surface's three channel flags explicitly rather than inheriting them. Card is border + shadow with no fill; Button is all three. The default is not the answer.
- **Do** keep elevation at its role default: Card flat, Button raised, stage slot raised, panel flat.
- **Do** read tint colors through the `colors` light/dark vars, never from the raw `palette` ramps. The `light-dark()` pair is what makes the theme flip correct.
- **Do** keep hit areas at 44px (`layout.controlTouchTarget`) even when the visible control is 18px.
- **Do** let color carry the expressiveness. If a surface feels flat, change the tint or the elevation — not the geometry.

### Don't:

- **Don't** add a ninth tint without removing one, and don't name new accents with Material or generic scales. The system's names (`neutral`, `aurora`, `solder`, `purple`, `amber`, `error`, `aqua`, `orange`) are the vocabulary; the values are `light-dark()` pairs.
- **Don't** apply two tints to one surface.
- **Don't** introduce a third font family, or use the mono face for anything that is not a measured value.
- **Don't** use a neutral-black shadow, a glow focus ring, or a gradient on any component. Depth is chromatic, focus is an outline, fills are flat or 18% veiled.
- **Don't** reference a token across package boundaries at runtime. StyleX tokens are compile-time constants; a component that needs a token composes from its own layer instead of importing across the workspace boundary.
- **Don't** let a browser default stand in for a designed control. Unstyled native form elements are the most visible defect the system can have, because they are the one surface the operator sees that the system did not draw.
