# UI lib refactor — session note

Goal: bespoke minimal UI lib in `apps/brouillon/src/experiments/ui` (StyleX + React 19).
Lab showcase: `apps/brouillon/src/experiments/laboratory.tsx`.

## State

- `ui/styles.stylex.ts` split along static/dynamic:
  - static: `staticStyles({ color, tint, elevation })` — vars (`themed`), `backgrounds.solid/soft`,
    `borders.subtle/strong/rounded`, `elevations`.
  - dynamic: `dynamicStyles({ disabled })` — `pressable`, `hover`, `focus`, `disabled`.
    Reads the same CSS vars set by static, so no `tint` param needed yet.
- `Button` = base + static + dynamic; exposes `color/tint/elevation`
  (defaults `neutral/tinted/raised`). `Card` = base + static; exposes `color/tint/elevation`
  (defaults `neutral/accented/flat`). All components accept native props + `style` override.
- Deliberately untouched: `interactions.active` + `borderHover` defined but not wired;
  `tinted` hover still washes 100% → 42% (open design issue, not a bug).
- Removed dead code: `interactions.base` (invalid CSS props), `glowColor`.
- `laboratory.tsx`: "Buttons on neutral ground" section + `accented`/`tinted` card sections
  with neutral content. No more same-color card+button nesting.
- `focus-visible` verified working (rule generated, outline renders on keyboard focus).
  Mouse click not matching it is browser design, not a bug.
- `vp check --fix` passes. Changes are uncommitted (working tree).

## Next action

Decide the `tinted` hover behavior (darken instead of 42% wash-out → `dynamicStyles`
takes a `tint` param with conditional), optionally add `soft` as third tint,
then continue with the next component.
