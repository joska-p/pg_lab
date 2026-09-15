# Component Authoring Guide

How to add a component to `@repo/ui`, and how to decide between a local style, a
primitive, and a theme token.

The patterns below are the current state of the toolkit. Read them with
`codex/docs/coding-conventions.md`. StyleX reference:
<https://stylexjs.com>.

---

## 1. Create a new component

### Location and shape

One file per component in `packages/ui/src/components/<Name>.tsx`, mirroring the
existing widgets (`Toggle`, `Slider`, `Segmented`, `ColorField`, `Button`):

- Plain `export function`, no class, no manual memo (React Compiler is on).
- Styles are **co-located**: a single local `const styles = stylex.create({ ... })`.
- Controlled/uncontrolled duality: `value`/`defaultValue` + `onValueChange`, with
  `useState` for the internal fallback (see `Toggle.tsx`).
- `disabled` handling, and a `style?: StyleXStyles` prop passed **last** to
  `stylex.props` so callers can always override.
- Register the export in `packages/ui/package.json` under `exports`
  (covered by the `"./components/*"` wildcard for
  `src/components/<Name>.tsx`).
- Showcase it in `apps/dev/src/App.tsx`.
- Variant props are named `variant` everywhere (Phase A: `Badge.tone`,
  `Text.tone`, `Swatch.swatch` migrate to `variant`).
- Layout primitives use string tokens: `Stack` takes
  `direction="vertical" | "horizontal"` and `gap="0" | "1" | ...`
  backed by `space` (Phase A: no mixed string/number API).
- `ControlField` is for custom content titles only (plain span): widgets
  carry their own associated `<label>`, never duplicate it (Phase B, S10).
- Run `vp check` after each change.

### Boilerplate skeleton

```tsx
import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";

import { interactiveBase } from "../foundations/interaction.stylex";
import { colors, radius, space, typography } from "../tokens/colors.stylex";

const styles = stylex.create({
  base: { ... },
});

type ComponentProps = {
  disabled?: boolean;
  style?: StyleXStyles;
};

export function Component({ disabled, style }: ComponentProps) {
  return (
    <button {...stylex.props(styles.base, interactiveBase.base, focusRing.base,
      disabled ? disabledStyle.base : null, style)} />
  );
}
```

---

## 2. Decide: local style, primitive, or token

Before writing any style, ask where the value belongs.

| Question                                                                                                                                                       | Answer                                                                                  |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Does this value represent a semantic concept that flips for light/dark, or an interaction feedback driven by an element's identity (shadow tint, hover shade)? | A **token** in `tokens/colors.stylex.ts` or `tokens/shadows.stylex.ts`.                 |
| Does 2+ components genuinely share the same **behavioral** style (cursor + transitions, focus ring, disabled opacity, label/value typography)?                 | A **primitive** in `foundations/interaction.stylex.ts` or `foundations/text.stylex.ts`. |
| Is this the **visual intent** of this one component (the fill of a selected chip, a pressed state, a variant of a button)?                                     | A **local** `stylex.create` map in the component file.                                  |

### Rules of thumb

- Raw palette values (`oklch(...)`) never appear in components. Only the theme
  layer (`consts/gruvbox-palette.stylex.ts`) holds raw values.
- Do **not** create primitives for a per-component look. `selected` and `active`
  used to be primitives; they were moved back into local component maps because
  their final value depends on ordering ("last applied wins") which is
  component-specific.
- Primitive files stay few and shared: today only `interactiveBase`
  (`base`) in `foundations/interaction.stylex.ts` and
  `fieldText` (`label`/`value`) in `foundations/text.stylex.ts`. `effects`
  (`flat`/`raised`/`sunken`/`pressable`/`floating`, `glow*`, `blur*`,
  `grain`, `glass`) is the shared elevation-and-atmosphere module. Add a new
  primitive only when a second real consumer exists.
- Per the StyleX principle of co-location, prefer a small local solution until
  the sharing is real. Do not abstract in advance.

---

## 3. Add tokens

Semantic color tokens live in `tokens/colors.stylex.ts` (`colors = stylex.defineVars`),
shadows in `tokens/shadows.stylex.ts`.

### Colors

Theming is class-free: `colors.stylex.ts` uses `light-dark()` (StyleX
light-dark recipe — first value light, second dark). Apps select the scheme
with the `color-scheme` property (`light`, `dark`, or `light dark` for
system, which follows the OS live with no JS — see `useTheme` in
`apps/dev`). Never reintroduce `prefers-color-scheme` conditions or a theme
class in tokens. Import theme values in apps from their defining
`tokens/*.stylex` files, not the barrel (see `ui-setup.md`).

Each functional family follows a `<family>` + `<family>Foreground` pattern, with a
`<family>Hover` when the family needs a hover shade:

```ts
primary:           { default: palette.brightBlue, [DARK]: palette.fadedBlue },
primaryForeground: { default: palette.dark0,     [DARK]: palette.light1 },

// The neutral shade works as hover in both modes:
// its lightness sits between bright (light mode bg) and faded (dark mode bg).
primaryHover: palette.neutralBlue,
```

`mutedHover` has no neutral equivalent, so it uses the explicit two-mode form
(`light4` on light, `dark3` on dark).

Family audit (Phase C): `primary`, `secondary`, `accent`, `warning`,
`destructive` each carry base + `Foreground` + `Hover`; `muted` carries
base + `mutedForeground` + `mutedHover`. `success` was removed (it duplicated
`secondary` with no hover and no widget consumer).

`muted` expression differs per widget by contrast necessity (Phase C, S8 —
assumed differences, documented here, not unified):

- `Slider`: track `muted`, progress fill `mutedForeground` (readable signal).
- `Segmented`: group well `muted`, chosen chip transparent + `mutedForeground`
  border (a fill would blend into the well).
- `Toggle`: track `muted` off and on, state carried by knob + glow.
- `Button`/`Badge`/`Checkbox`/`RadioGroup`: `muted` as neutral fill or outline.

`input` vs `muted` (Phase C): distinct roles, kept separate. `input` is for
editable wells (text fields, selects — always bordered recesses); `muted` is
for non-editable neutral surfaces (tracks, group wells, muted fills). Their
values converge in dark mode (`dark2`); disambiguation comes from border +
context, not from the fill value.

### Contrast (Phase D4)

The gruvbox palette is canonical — never edit it. Where a pair falls under
WCAG 4.5:1, the **token** is derived by mixing the palette value in OKLab
(`color-mix(in oklab, ...)`, first value of the `light-dark()` pair is
light): toward black/white for text, toward `background` for elevated dark
surfaces. Hue stays gruvbox; only lightness moves. The audit is scripted and
must keep matching tokens (`uv run --no-project python scripts/audit_contrast.py`).

Current state (D4):

- Light mode reads ≥ 4.5:1 everywhere except colored signal buttons
  (`accent` 4.15, `destructive` 3.08 are marked as signal tints, low alert) —
  body, labels, inputs, chips all pass.
- Dark mode: body on `background` passes (4.85). Elevated surfaces cap at
  ~4.1:1 (`card`), ~4.0 `input`, ~3.5 chips — a stricter pass would require
  flattening the dark ladder onto `background`, structurally rejected.
- Dark colored-button text (~2–2.7:1, destructive 5.51 excepted) and the
  decorative 55 %-translucent `border` (~1.1–1.7:1) are documented shortfalls:
  the art direction keeps those surfaces tinted and quiet.
- `in srgb` mixes were switched to `in oklab` (border, shadows, glass) to match
  the palette's color model; transparent blends are endpoint-identical, so this
  is a consistency change, not a color change.

### Shadows

`tokens/shadows.stylex.ts` is the single source of truth for shadow color
(Phase B, S1/S2: the dead `colors.shadow` token was removed). It exposes
one `shadowColor` variable that all shadow tokens derive from via
`color-mix`. An element opts in by setting the variable
with its root color:

```ts
import { shadowColor } from "../tokens/shadows.stylex";

const colorVariants = stylex.create({
  primary: {
    [shadowColor.color]: colors.primary, // tint every derived shadow
    ...
  },
});
```

- The default `shadowColor` is black (`oklch(0% 0 0)`), so elements that do not
  set it keep a neutral shadow.
- The shadow follows the **root** color, not the hover color: a primary button
  keeps a blue-tinted shadow even while the background shifts to the neutral
  hover shade.
- Elevation lives in `effects/elevation.stylex.ts` (Phase B model): `flat`
  (no cast shadow, border only), `raised` (tinted diffuse cast shadow),
  `sunken` (two-layer inset: a top-light line + a soft bottom shade — a recess
  needs a lighter inner top edge, so the tint never collapses into the
  surface it hollows) plus the `pressable` (`rest`/`hover`/`active`) and
  `floating` composites. Every consumer of an elevation sets `shadowColor` to
  its own background (teinte auto — Phase B, S3: `Button` per variant,
  `ExperimentShell` panel with `card`, `Slider` thumb with `background`).
  `sunken` also serves as the recess for editable wells and rails: fields
  (`fieldFocus` map) tint it with `colors.input`, the Slider track and
  Segmented rail keep the boundary visible via `colors.border`/inset. The
  depth ladder is alpha-ordered (`rest < raised < hover < floating`).
- The glow (`glow`/`glowSubtle`/`glowStrong`, plus the 55 %-mixed `glowRing`)
  stays orthogonal: state accent (selection, activity, handles), never
  elevation.
- `grain` is a near-invisible monochrome noise overlay for tactile texture
  (`Page`, `Stage`); `glass` (translucent `card` + 24px blur + a cast shadow
  derived from `shadowColor`/`shadows.floating`) is for floating UI over a
  backdrop only — in-flow surfaces stay opaque so text contrast never depends
  on what's behind them.
- Borders stay quiet by default: the `border` token is a translucent mix,
  never a hard rectangle (see DESIGN.md, restrained borders).

When you add a new theme module, it is covered by the `"./tokens/*"` wildcard
in `packages/ui/package.json` `exports` — no registration needed.

---

## 4. Create variants

A variant is a plain map in `stylex.create`, keyed by name, applied with a
lookup (`colorVariants[variant]`). The prop carrying the variant is named
`variant` (Phase A, S6). See the canonical implementation in
`Button.tsx`.

### Recipe

1. Define the base layout once in `styles.base` (padding, border, type, radius).
2. Define one map per axis, e.g.:

```ts
const colorVariants = stylex.create({
  primary: {
    [shadowColor.color]: colors.primary,
    backgroundColor: { default: colors.primary, ":hover": colors.primaryHover },
    borderColor: colors.primary,
    color: colors.primaryForeground,
  },
  ...
});

type ButtonProps = { variant?: keyof typeof colorVariants; ... };
```

3. Apply in a stable order, with override-capable styles **last**:

```tsx
stylex.props(
  styles.base,
  colorVariants[variant],
  interactive.base,
  interactive.focusRing,
  effects.pressable,
  isDisabled ? interactive.disabled : null,
  loading ? styles.loading : null,
  style,
);
```

### Rules for ordering

- StyleX resolves deterministically: when two styles set the same property, the
  **last applied wins**. Compound conditions (disabled, loading) go after the
  variants so they override them.
- Transient states come last among conditions, so they win while active:
  `selected` then `active` (the active state must be able to override the
  selected fill).
- `style` stays last: caller-owned styles always win.

---

## 5. Reuse variants across components

Yes — this is a real use case, and it is centralized in the toolkit. The six
color "intents" (`primary … muted`: root color + border + foreground +
`shadowColor`) and the text-entry focus map are shared, token-built variant
maps in `behaviors/intents.stylex.ts`, exported from `index.ts` and covered by
the `./behaviors/*` wildcard like `interactive` / `fieldText`.

Start local, extract deliberately:

- **Default: keep the map in the component file.** StyleX favors co-location,
  and convention rule _1.5 / 10_ ("add indirection only when it solves a
  problem", "prefer a small local solution") applies.
- **Extract a shared map only when both hold:**
  1. a second real consumer appears with byte-identical needs, and
  2. the shared map carries no component-specific selected/active/disabled
     interaction state.

### The shared maps

All are stateless — no `:hover`, `:active`, or selected fill:

| map             | carries                                                                                           | consumers                                        |
| --------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| `colorIntents`  | `[shadowColor.color]` + `backgroundColor` + `borderColor` + foreground (the full surface)         | Button, Toggle-on, Checkbox-on, Segmented chosen |
| `intentHovers`  | `background-color` `:hover` per family (the `<family>BgHover` tokens)                             | Button, Toggle-on, Checkbox-on                   |
| `intentFills`   | `backgroundColor` only; `muted` = `mutedFg`                                                       | Slider fill, Radio dot                           |
| `intentBorders` | `borderColor` + `[shadowColor.color]` (border AND cast harmonize per family); `muted` = `mutedFg` | Toggle-off, Slider thumb, Radio circle           |
| `fieldFocus`    | field border + `[shadowColor.color]` (well tint) + ring on `:focus` per family                    | TextInput, NumberField, TextArea, Select         |

### Composition recipe

Base intent first, interaction states after, `style` last:

```ts
import { colorIntents, intentHovers } from "../foundations/surface.stylex";

const styles = stylex.create({ base: { /* layout only */ } });

export function Button({ variant = "primary", style }: Props) {
  return (
    <button
      {...stylex.props(
        styles.base,
        colorIntents[variant],
        intentHovers[variant],
        interactiveBase.base,
        focusRing.base,
        pressable.base,
        style,
      )}
    />
  );
}
```

- **Do not share selected/active/disabled.** They differ per component (a
  Button hovers, a selected Segmented chip does not) and their merged value
  depends on application order. `intentHovers` is the one deliberate shared
  `:hover`: three consumers need the byte-identical hover background, and
  `:hover` has no "last applied wins" ordering problem — documented as shared.
- **`glow.glowRing`** (`0 0 6px`, 55 %-mixed, on `shadowColor`) is the
  tinted halo for on/off marks — an effect, not a per-family map. Apply a
  `colorIntents[variant]` map first (it sets the tint var), then the effect.
- **`muted` divergences (S8) are documented, not unified.** Canonical
  `colorIntents.muted` = fill `mutedBg` / border `mutedBorder` / foreground
  `mutedFg`. The slices `intentFills`/`intentBorders` signal through
  `mutedFg` (the mark sits on a `mutedBg` track/well). Widgets that
  diverge override locally with a comment: Toggle-off keeps a neutral `mutedBorder`
  border; Segmented chosen is transparent + `mutedFg` border; Checkbox
  on-state uses `mutedFg` border + `foreground`.
- `Swatch` is a token display, not an intent consumer: it shows every surface
  and family swatch and stays local.

### Rules of thumb

- Local `stylex.create` stays the default for per-widget geometry, layout, and
  one-off states (selected fill, press scale) — component-authoring.md §3.
- Raw values are tokenized in components: `borderWidth.hairline` for borders,
  `space`/`radius`/`motion` elsewhere; only the token/const layers hold raw values.
- `defineConsts` values carry their CSS unit. The compiler inlines the raw
  string, so a bare number would emit invalid CSS (`width:12` is dropped).
  Lengths are `px` (widget geometry, effects) or `rem` (text sizes) per
  context; `em`/`ch` for text-relative measure. Unitless is reserved for
  CSS-valid numerics (`0`, opacity, line-height, font-weight, z-index).
  JS code that needs a plain number parses the const (see `KNOB_TRAVEL` in
  `Toggle.tsx`).

---

## 6. Focus rings and SVG finish

Rings are visible for keyboard, silent for mouse — per context (D2 audit):

- Pressables (buttons, toggles, chips, radio options): `focusRing.base`
  (`:focus-visible`). For pressable composites (`pressable.base`), the ring
  is composed INTO the shadow list on `:focus-visible` (rest cast + 2px/3px
  ring) so keyboard focus keeps its lift instead of replacing it.
- Text-entry fields: the shared `fieldFocus` map on `:focus` (a mouse click
  into a text field must show the ring).
- Hidden-input composites: the Slider pattern — ring on the visible container
  via `stylex.when.descendant(":focus-visible")`, since the opaque input
  can't show its own shadow.

SVG marks share one finish (D2): 12px viewBox, 1.8 stroke, round caps and
joins, `currentColor` (Select chevron, Checkbox check). RadioGroup needs no
SVG — its dot is a CSS circle.

---

## 7. Verification checklist

```text
vp check                     # after every step
```

- No `TS2305` / type errors, formatting clean.
- Demo renders every variant and every state (hover, focus-visible, press,
  disabled, loading).
- Ordering checked: transient states and caller `style` win as expected.
- Raw values confined to the theme layer; no new primitive without a second
  consumer; every new semantic concept tokenized.
