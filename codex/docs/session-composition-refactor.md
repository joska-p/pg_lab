# Session brief — Composition refactor of `@repo/ui`

Self-contained brief for a future session. Read the referenced docs before coding,
present a plan, get validation, then implement. No coding before validation.

## Context

`@repo/ui` has reached a good, stable visual state (see `apps/dev` — lit gradient
`Stage`, glass `Card` variants). The design is right; the code structure is not.
Variants and styles are hardcoded and duplicated "in every direction". Behaviors
primitives exist (`behaviors/interactive.stylex.ts`, `behaviors/text.stylex.ts`,
`behaviors/effects.stylex.ts`) and are meant to be the composition mechanism, but
component code only partially composes from them. This brief consolidates the
repeated variant maps into shared, token-built behavior primitives and removes the
leak of intent styles into the demo app.

Design is frozen. This is a structural refactor: zero (or intentional, documented)
visual change.

## Sources of truth to read first

- `codex/docs/component-authoring.md` — §4 (variant recipe), §5 (when to extract a
  shared variant map), §7 (verification checklist).
- `codex/docs/stylex-variants.txt`, `codex/docs/stylex-mindset.txt`.
- `codex/docs/conventions/coding-manifesto.md`, `codex/docs/conventions/coding-conventions.md`.
- `packages/ui/src/behaviors/*` (current primitives), `packages/ui/src/theme/*` (tokens).
- `codex/docs/polish-roadmap.md` (decisions already locked: S3, S6, S7, S8; dark-first).

## Goal

Centralize the repeated six-intent variant maps (`primary | secondary | accent |
warning | destructive | muted`) and any byte-identical focus maps into shared
behavior primitives built from semantic tokens, then rebuild every component and the
demo app on top of them. The demo app must stop reimplementing toolkit styles
locally.

## Inventory of duplication (from current code)

1. **Six-intent maps duplicated per component**, each a local `stylex.create` with
   `[shadowColor.color]` + `backgroundColor` (+ `:hover`) + `borderColor` +
   foreground (`*Foreground`):
   - `Button.tsx` `colorVariants` (lines ~56-116) — the canonical recipe.
   - `Toggle.tsx` `trackOnVariants` / `trackOffVariants`.
   - `Checkbox.tsx` `boxOnVariants`.
   - `Slider.tsx` `fillVariants` / `thumbVariants`.
   - `Segmented.tsx` `chosenVariants`.
   - `RadioGroup.tsx` `circleOnVariants` / `dotVariants`.
   - Demo app `apps/dev/src/App.tsx`: `tileStyles.primaryBg / secondaryBg /
mutedBg / cardBg` (lines ~116-133) and `tileTints` (lines ~142-148,
     `[shadowColor.color]` per family) — the same intents reimplemented in app code.
2. **`focusVariants` duplicated** in the four text-entry components:
   `TextInput.tsx`, `NumberField.tsx`, `TextArea.tsx`, `Select.tsx`. Verify whether
   they are byte-identical; if so, extract.
3. **Hardcoded raw values** that have tokens: scan components for `borderWidth: 1`,
   literal `1px`, magics handles etc. Replace with the token (`borderWidth.hairline`,
   `space`, `radius`, `motion`) wherever a token exists. Only the theme layer may
   hold raw values.

## Extraction rules (binding)

Follow `component-authoring.md` §5 strictly:

- Extract to a shared map **only** where a second real consumer with byte-identical
  needs exists (extend to N = many, since every widget is a consumer).
- **Do not share stateful variants.** Hover/press/selected/disabled stay local per
  component. The shared map carries the stateless intent: `[shadowColor.color]`,
  `backgroundColor` (default only — no `:hover`), `borderColor`, foreground color.
- Hover must be composed locally (e.g., Button overrides `backgroundColor` `:hover`
  on top of the shared intent), or via a shared bicolor structure if the new session
  prefers — decide and document.
- Local `stylex.create` stays the default for anything component-specific
  (component-authoring.md §3).
- `muted` has a documented divergence (S8) — Slider fill = `mutedForeground`,
  Segmented selected = border + brighten text, no fill on fill. Preserve each
  component's `muted` behavior exactly; centralize only the parts that are truly
  common and document the divergence.

## Proposed shape (to validate)

- Add a shared primitives module, e.g. `packages/ui/src/behaviors/intents.stylex.ts`
  (component-authoring.md §5 suggests `primitives/intents.stylex.ts` — pick one
  location, honor the existing `exports` wildcard `./behaviors/*`/`./theme/*` layout,
  and export from `index.ts`), exposing `colorIntents` (six families).
- Rebuild `Button`, `Toggle`, `Checkbox`, `Slider`, `Segmented`, `RadioGroup` on it,
  composing component-local hover/press/selected on top.
- Text-entry focus: extract one shared map if the four `focusVariants` are identical;
  otherwise keep local. Export via the same mechanism as `interactive` / `fieldText`.
- Demo app: replace `tileStyles.primaryBg/secondaryBg/mutedBg/cardBg` + `tileTints`
  with the shared map; drop the local `tileTints`. Keep the `Tile` demo component
  (it composes `effects.*`, which is correct). Keep `synthStyles.container` inline —
  it is canvas content, not UI (locked in polish-roadmap D3).
- `Card` material variants (`surface | glass | raised | sunken`) stay as-is; only
  flatten/clean if a clearer composition emerges without API change.

## Non-goals

- No visual change (design frozen). If a refactor forces a pixel difference, stop
  and ask.
- No new theme tokens unless needed to replace a hardcoded raw value that has no
  token yet.
- No API renames beyond exactly what composition requires (naming convention
  `variant` everywhere is already locked — S6).
- No docs rewrite beyond updating `component-authoring.md §5` to the now-canonical
  shared map (SSOT) and whatever divergences the refactor clarifies.

## Constraints & verification

- Demo-driven: every change to `@repo/ui` must be visible in `apps/dev`
  (components only). The demo must still render every variant and every state
  (hover, focus-visible, press, disabled, loading) — component-authoring.md §7.
- Run `vp check` after every step; `vp -C apps/dev build` at the end.
- Manual regression glance on the demo in **light and dark** before finishing
  (the gradient `Stage` and glass cards are the new baseline).
- Update `codex/docs/` (SSOT) where a pattern evolves.
- Do not commit or push without an explicit request.
- French for discussion, English for code/docs/spec.
