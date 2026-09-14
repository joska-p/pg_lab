# Component Authoring Guide

How to add a component to `@repo/ui`, and how to decide between a local style, a
primitive, and a theme token.

The patterns below are the current state of the toolkit. Read them with
`codex/docs/coding-conventions.md` and the StyleX docs in
`codex/docs/` (`stylex-variants.txt`, `stylex-mindset.txt`).

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

import { interactive } from "../behaviors/interactive.stylex";
import { colors, radius, space, typography } from "../theme/tokens.stylex";

const styles = stylex.create({
  base: { ... },
});

type ComponentProps = {
  disabled?: boolean;
  style?: StyleXStyles;
};

export function Component({ disabled, style }: ComponentProps) {
  return (
    <button {...stylex.props(styles.base, interactive.base, interactive.focusRing,
      disabled ? interactive.disabled : null, style)} />
  );
}
```

---

## 2. Decide: local style, primitive, or token

Before writing any style, ask where the value belongs.

| Question                                                                                                                                                       | Answer                                                                              |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Does this value represent a semantic concept that flips for light/dark, or an interaction feedback driven by an element's identity (shadow tint, hover shade)? | A **token** in `theme/tokens.stylex.ts` or `theme/shadows.stylex.ts`.               |
| Does 2+ components genuinely share the same **behavioral** style (cursor + transitions, focus ring, disabled opacity, label/value typography)?                 | A **primitive** in `behaviors/interactive.stylex.ts` or `behaviors/text.stylex.ts`. |
| Is this the **visual intent** of this one component (the fill of a selected chip, a pressed state, a variant of a button)?                                     | A **local** `stylex.create` map in the component file.                              |

### Rules of thumb

- Raw palette values (`oklch(...)`) never appear in components. Only the theme
  layer (`theme/gruvbox-palette.stylex.ts`) holds raw values.
- Do **not** create primitives for a per-component look. `selected` and `active`
  used to be primitives; they were moved back into local component maps because
  their final value depends on ordering ("last applied wins") which is
  component-specific.
- Primitive files stay few and shared: today only `interactive`
  (`base`/`focusRing`/`disabled`) in `behaviors/interactive.stylex.ts` and
  `fieldText` (`label`/`value`) in `behaviors/text.stylex.ts`. `effects`
  (`flat`/`raised`/`sunken`/`pressable`/`floating`, `glow*`, `blur*`,
  `grain`, `glass`) is the shared elevation-and-atmosphere module. Add a new
  primitive only when a second real consumer exists.
- Per the StyleX principle of co-location, prefer a small local solution until
  the sharing is real. Do not abstract in advance.

---

## 3. Add tokens

Semantic color tokens live in `theme/tokens.stylex.ts` (`colors = stylex.defineVars`),
shadows in `theme/shadows.stylex.ts`.

### Colors

Theming is class-free: `tokens.stylex.ts` uses `light-dark()` (StyleX
light-dark recipe — first value light, second dark). Apps select the scheme
with the `color-scheme` property (`light`, `dark`, or `light dark` for
system, which follows the OS live with no JS — see `useTheme` in
`apps/dev`). Never reintroduce `prefers-color-scheme` conditions or a theme
class in tokens. Import theme values in apps from their defining
`theme/*.stylex` files, not the barrel (see `ui-setup.md`).

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

### Shadows

`theme/shadows.stylex.ts` is the single source of truth for shadow color
(Phase B, S1/S2: the dead `colors.shadow` token was removed). It exposes
one `shadowColor` variable that all shadow tokens derive from via
`color-mix`. An element opts in by setting the variable
with its root color:

```ts
import { shadowColor } from "../theme/shadows.stylex";

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
- Elevation lives in `behaviors/effects.stylex.ts` (Phase B model): `flat`
  (no cast shadow, border only), `raised` (tinted diffuse cast shadow),
  `sunken` (inset, embedded) plus the `pressable` (`rest`/`hover`/`active`)
  and `floating` composites. Every consumer of an elevation sets
  `shadowColor` to its own background (teinte auto — Phase B, S3: `Button`
  per variant, `ExperimentShell` panel with `card`, `Slider` thumb with
  `background`).
- The glow (`glow`/`glowSubtle`/`glowStrong`) stays orthogonal: state accent
  (selection, activity, handles), never elevation.
- `grain` is a near-invisible monochrome noise overlay for tactile texture
  (`Page`, `Stage`); `glass` (translucent `card` + 12px blur) is for floating
  UI over a backdrop only — in-flow surfaces stay opaque so text contrast
  never depends on what's behind them.
- Borders stay quiet by default: the `border` token is a translucent mix,
  never a hard rectangle (see README Borders).

When you add a new theme module, it is covered by the `"./theme/*"` wildcard
in `packages/ui/package.json` `exports` — no registration needed.

---

## 4. Create variants

A variant is a plain map in `stylex.create`, keyed by name, applied with a
lookup (`colorVariants[variant]`). The prop carrying the variant is named
`variant` (Phase A, S6). See the full pattern in
`codex/docs/stylex-variants.txt` and the canonical implementation in
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

Yes — this is a real use case, and it is already latent in the toolkit. The six
color "intents" (`primary` … `muted`: root color + border + foreground +
`shadowColor`) are the same shape that will legitimately reappear as a
selection state in `Segmented`, chips, cards, or toasts.

Start local, extract deliberately:

- **Default: keep the map in the component file.** StyleX favors co-location,
  and convention rule _1.5 / 10_ ("add indirection only when it solves a
  problem", "prefer a small local solution") applies.
- **Extract a shared map only when both hold:**
  1. a second real consumer appears with byte-identical needs, and
  2. the shared map carries no component-specific interaction state.

  Then export it from a shared module (`primitives/intents.stylex.ts`) exactly
  like `interactive` / `fieldText`, and import it in the consumers:

```ts
export const colorIntents = stylex.create({
  primary: { [shadowColor.color]: colors.primary, backgroundColor: colors.primary, ... },
  ...
});
```

- **Do not share stateful variants.** Hover, press, and disabled differ per
  component (a Button hovers, a selected Segmented chip does not). Share the
  base intent map; compose each component's own interaction states locally on
  top of it.
- Re-evaluate when the second consumer appears — e.g. the day `Segmented`'s
  `chosen` or the demo's local `selected` map can be replaced by a shared
  intent without changing behavior.

---

## 6. Focus rings and SVG finish

Rings are visible for keyboard, silent for mouse — per context (D2 audit):

- Pressables (buttons, toggles, chips, radio options): `interactive.focusRing`
  (`:focus-visible`).
- Text-entry fields: local `focusVariants` on `:focus` (a mouse click into a
  text field must show the ring).
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
