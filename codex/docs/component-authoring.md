# Component Authoring Guide

How to add a component to `@repo/ui`, and where each value belongs — local
style, shared behavior, or theme token.

Read this with `packages/ui/DESIGN.md` (the visual contract) and
`codex/docs/coding-conventions.md`. StyleX reference: <https://stylexjs.com>.

> **Architecture:** The legacy six-role semantic matrix has been dismantled and retired.
> Components are built by **anatomy**, consume **families** (`base` / `strong`), use **one
> contact hue** (`colors.ring`) for response, and keep styles local until a second real consumer.

---

## 1. The visual contract, in code terms

Decisions that shape every new widget:

- **Families, not variants.** A family is a hue with two tensions — `base`
  (light source: LEDs, fills, light fields, glass tint) and `strong` (readable
  line: chip text, thumb seed, hover infusion). It names a _thing_
  (`cutoff`, `record`), never a generic role. If a prop would only exist to
  restyle the same anatomy in another hue, that prop is a **family**, consumed
  locally at the anatomy site.
- **Matte faces.** Keys, fields, and surfaces rest neutral. Saturation lives on
  marks (LED, fill-that-means, glow-then-live). A control should not carry a
  resting saturated fill "because it's the accent".
- **One contact hue.** Response (focus halo, default identity) uses `colors.ring`
  everywhere. Do not add a per-family ring per widget; the old `fieldFocus`
  family spread is retired.
- **Well before card.** Editable/recessed areas are sunken wells; a card is the
  exception, not the default box.
- **Under/over depth.** Shallow surfaces stay opaque; a floating surface above a
  light field may go translucent + blurred so the under-light becomes its
  material (paints-itself shadow, glass-on-floating).
- **Color as data.** Before adding a color to a widget, ask what the hue _names_.
  Nothing? Neutral, or contact.

---

## 2. Create a new component

### Location and shape

One file per component in `packages/ui/src/components/<Name>.tsx`:

- Plain `export function`, no class, no manual memo (React Compiler is on).
- Styles are **co-located**: one local `const styles = stylex.create({ ... })`.
- Controlled/uncontrolled duality: `value` / `defaultValue` + `onValueChange`
  with a `useState` fallback (see `Toggle.tsx`).
- `disabled` handling and `style?: StyleXStyles` passed **last** to
  `stylex.props` so callers always override.
- Register under the existing `./components/*` wildcard in `package.json`
  `exports` (no per-file registration).
- Showcase it in `apps/dev` (the showcase page and/or the _visual laboratory_).
- Variant props are named `variant` where a variant map is genuinely needed;
  prefer a family/anatomy prop over a role variant.
- `Stack` takes string tokens (`direction`, `gap` backed by `space`).
- `ControlField` is for custom content titles only — widgets carry their own
  `<label>`, never duplicate it.
- Run `vp check` after each change.

### Imports

Import theme values **from their defining `.stylex` files**, not the
`@repo/ui` barrel — the StyleX compiler cannot follow re-exports
(`ui-setup.md` § 3). Components themselves import from the barrel.

### Boilerplate skeleton

```tsx
import * as stylex from '@stylexjs/stylex';
import type { StyleXStyles } from '@stylexjs/stylex';

import { focusRing } from '../intents/focus.stylex';
import { disabledStyle } from '../intents/disabled.stylex';
import { radius, space, typography } from '../consts/…';

const styles = stylex.create({
    base: {
        borderRadius: radius.sm,
        paddingBlock: space['2'],
        /* anatomy geometry, marks, family tints */
    },
});

type ComponentProps = {
    disabled?: boolean;
    style?: StyleXStyles;
};

export function Component({ disabled, style }: ComponentProps) {
    return (
        <button
            {...stylex.props(
                styles.base,
                focusRing.base /* universal keyboard halo — one contact ring */,
                disabled ? disabledStyle.base : null,
                style,
            )}
        />
    );
}
```

---

## 3. Decide: local, shared behavior, or token

| Question                                                                                                   | Where it lives                                                                                  |
| ---------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| A semantic color / surface / shadow value, or the single **contact** hue?                                  | **Token** — `tokens/colors.stylex.ts`, `tokens/families.stylex.ts`, `tokens/shadows.stylex.ts`. |
| A fixed, non-themable geometry / type / motion constant?                                                   | **Const** — `consts/*.stylex.ts` (`space`, `radius`, `typography`, `motion`, `layout`…).        |
| A behavior genuinely shared by 2+ components (focus halo, press, disabled, label/value type, glass, glow)? | **Primitive** — `foundations/`, `effects/`, or `intents/`, extracted only on the 2nd consumer.  |
| The visual intent of one widget (a mark, a pressed fill, an anatomy tint)?                                 | **Local** `stylex.create` — the default for new work.                                           |

### Rules of thumb

- Raw palette values never appear in components. Only
  `consts/gruvbox-palette.stylex.ts` holds raw values.
- Do **not** create a shared primitive for a per-widget look. If the value's
  final form depends on application order ("last applied wins"), it stays local.
- Start local, extract deliberately: a shared map needs a second byte-identical
  consumer **and** no component-specific ordering constraint. Primitive files
  stay few: `foundations/` (`field`, `interaction`, `text`), `effects/`
  (`glow`, `elevation`, `glass`), `intents/` (`focus`, `disabled`, `pressable`).
- Before adding a `variant` prop, ask the contract question: is this a _family
  meaning_ (→ consume `base`/`strong` locally) or an _anatomy state_ (→ keep
  local)? Only then decide if a shared map is earned.

---

## 4. Tokens, consts, and contrast

Theming is class-free: tokens are `light-dark()` pairs (first light, second
dark) selected by the app's `color-scheme` — never `prefers-color-scheme`
conditions or theme classes. The palette is **canonical, never edited**;
where a pair falls under WCAG 4.5:1 the **token** is derived by
`color-mix(in oklab, …)` toward black/white (text) or toward `background`
(elevated dark surfaces).

**Contrast is handled by exception, not per family.** A family gains an ink
(a text-on-tint pair) only where a widget genuinely paints text on its tint
(amber has one today). Faded dark bases are documented shortfalls; do not add a
family ink speculatively.

`tokens/shadows.stylex.ts` is the single source of truth for shadow color: one
`shadowColor` variable, every shadow derived via `color-mix`. An element opts in
with `[shadowColor.color]` = its own background — the shadow paints itself.
Elevation lives in `effects/elevation.stylex.ts` (`flat` / `raised` / `sunken` /
`floating`; `sunken` also serves as the recess for wells and rails). Glow
(`effects/glow.stylex.ts`) stays orthogonal: state accent, never elevation.
`glass` (translucent + blur + self-tinted cast) is for floating UI over a
backdrop only.

Consts carry their CSS unit (lengths `px`, text `rem`; unitless only for
CSS-valid numerics). Never reference raw numbers in component styles.

---

## 5. Shared behaviors and static variants

The architecture relies on focused, single-purpose shared layers:

- **Families (`tokens/families.stylex.ts`):** `base` / `strong` tokens consumed
  directly at the anatomy site (e.g., Led dots, Slider fills, Button hover infusions).
- **Foundations (`foundations/*.stylex.ts`):** State-free structural patterns
  (`field.col`, `field.well`, `fieldText.label`, `fieldText.value`, `interactiveBase.base`).
- **Effects (`effects/*.stylex.ts`):** Orthogonal visual treatments (`glow.glowRing`,
  `glass.glass`, `elevation.raised`, `elevation.sunken`).
- **Intents (`intents/*.stylex.ts`):** Interaction states (`focusRing.base`,
  `disabledStyle.base`, `pressable.base`).

### Rules that apply

- Variant/state maps stay plain `stylex.create` lookups. Apply in a stable
  order: `styles.base` → anatomy tints → shared behavior → conditions
  (`disabled`, `loading`) → transient states → `style` **last** (last-applied
  wins).
- `glow.glowRing` (`0 0 6px`, 55%-mixed on `shadowColor`) is the tinted halo for
  on/off marks — set `[shadowColor.color]` from the family, then apply the
  effect.
- `defineConsts` values inline as raw strings; a bare number emits invalid CSS
  (`width:12` is dropped).

---

## 6. Focus rings and SVG finish

Rings are visible for keyboard, silent for mouse:

- **Pressables** (keys, toggles, chips, radio options): `focusRing.base`
  (`:focus-visible`). For pressable composites, compose the ring INTO the shadow
  list on `:focus-visible` so focus keeps its lift.
- **Text-entry fields**: one contact ring on `:focus` (mouse clicks must show
  it) — no per-family ring.
- **Hidden-input composites**: the Slider pattern — ring on the visible
  container via `stylex.when.descendant(":focus-visible")`.

SVG marks share one finish: 12px viewBox, 1.8 stroke, round caps/joins,
`currentColor` (Select chevron, Checkbox check). Radio dot is a CSS circle —
no SVG.

---

## 7. Verification checklist

```text
vp check                     # after every step
```

- No type errors, formatting clean.
- Demo renders every state (hover, focus-visible, press, disabled, loading).
- Ordering verified: transient states and caller `style` win as expected.
- Raw values confined to the theme/const layer.
- **Contract checked:** neutral face at rest; any color _names_ something; one
  contact ring; no new primitive without a second consumer; no new role variant
  where a family/anatomy belongs.
