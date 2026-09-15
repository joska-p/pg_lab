# Refactor Phase A — working document (temporary)

> TEMPORARY. Handoff doc for a dedicated refactor session. NOT canonical docs
> (those live in `packages/ui/DESIGN.md`, `PRODUCT.md`, `README.md` and
> `codex/docs/`). When Phase A lands, prune this file section by section.
> Language: code, docs and specs in English; discussions in French.

## 1. Context (4 lines)

A _visual laboratory_ (`apps/dev`, default view) validated a denser direction:
Gruvbox as a vocabulary, matte faces, LED marks as identity, a single contact
hue, wells before cards, and a light/glass under-over material. The docs have
been **updated to that target**. The code in `packages/ui` still ships the old
variant matrix. This doc launches the first refactor phase and, above all,
maps the doc/code gap so the session is not confused.

## 2. Read first (in order)

1. `packages/ui/DESIGN.md` — the visual contract (the target).
2. `codex/docs/component-authoring.md` — writing rules for the target.
3. `codex/docs/ui-setup.md` — the import rule that keeps the StyleX transform
   working (`.stylex` subpaths, not the barrel).
4. `apps/dev/src/lab/` — `families.ts`, `experimental.tsx`, `laboratory.tsx`:
   the visual oracle AND the recreated components.
5. `packages/ui/src/` — the real current state (see § 3).

## 3. THE GAP — do not be confused

**The docs describe the TARGET. The code is still the OLD MODEL.** A statement
in DESIGN.md is not yet true in `packages/ui/src` unless listed below as done.

| Topic                                 | The contract (docs) says                        | Reality today (code)                                                                                                                                                                                                                                                       |
| ------------------------------------- | ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Families `base`/`strong`              | a hue with two tensions = the expressive unit   | **not in the lib**. Only `apps/dev/src/lab/families.ts` (`FAMILIES`, plain TS, not `.stylex`)                                                                                                                                                                              |
| One contact hue                       | a single hue answers interaction                | `tokens/colors.stylex.ts` already has one `colors.ring` (aurora) ✅; `focusRing` uses it on pressables ✅. **`fieldFocus` (`intents/focus.stylex.ts`) still spreads per-family rings** ❌                                                                                  |
| Matte faces, color as marks/light     | faces rest neutral; saturation = identity/state | `Button`, `Toggle`, `Checkbox`, `Badge`, `Text*` still use `colorIntents`/`intentHovers` (saturated per-role fills). `Slider` is already neutral + contact-ringed ✅                                                                                                       |
| 6×N matrix retired                    | shared per-role maps are dismantled             | Still present + consumed: `tokens/colorVariants.stylex.ts` (6 roles × Bg/Border/Fg/Ring), `foundations/surface.stylex.ts` (`colorIntents`/`intentFills`/`intentBorders`), `intents/hover.stylex.ts`, `fieldFocus`. **Leave untouched except where Phase A says otherwise** |
| Canonical palette + anchored contrast | Gruvbox immutable; contrast derived, audited    | `consts/gruvbox-palette.stylex.ts` canonical; `tokens/colors.stylex.ts` derived; audit `uv run --no-project python scripts/audit_contrast.py`. Never edit these                                                                                                            |
| Light field / glass under-over        | under-light feeds the material above            | `effects/glass.stylex.ts` exists ✅; the light field exists only in `experimental.tsx` (app) ❌                                                                                                                                                                            |
| LED mark / glow = state               | 7px mark; glow = live                           | `effects/glow.stylex.ts` exists ✅; the LED mark exists only in `experimental.tsx` (app) ❌                                                                                                                                                                                |

Consequences:

- Do **not** reconcile all of `packages/ui` to DESIGN.md in one pass. Only the
  Phase A scope below.
- Anchors to read-only during Phase A: `gruvbox-palette`, derived `tokens/colors`,
  `tokens/shadows`, `effects/` (glass, glow, elevation), the contrast audit.
- The matrix stays in place for its other consumers; its dismantlement is
  Phases B/C, widget by widget.

## 4. The lab already recreated the components

The refactor is a **harvest**: promote the validated lab pieces into the lib
and migrate widgets onto them, using the lab as the visual + behavioral
reference. Lab → lib target mapping (in `apps/dev/src/lab/experimental.tsx`):

| Lab piece                                  | Target                                        | Status  |
| ------------------------------------------ | --------------------------------------------- | ------- |
| `families.ts` `FAMILIES`                   | `consts/families.stylex.ts`                   | A1      |
| `Led`                                      | shared LED mark (intents/effects)             | A2      |
| `LabSlider` (rail, family/contact fill)    | `Slider` migration                            | A3      |
| `Key`                                      | `Button` migration                            | Phase B |
| `Chip`                                     | `Badge` migration                             | Phase C |
| `LabField` (well + contact + outside tag)  | `TextInput`/`NumberField`/`TextArea`/`Select` | Phase C |
| `MaterialScene` (light field + glass pane) | `Surface`/scene material                      | Phase D |

## 5. Phase A mission

Land the **vocabulary** in the library and prove the whole pattern on the most
self-contained widget (`Slider`), with `LabSlider` as the reference and the lab
view as the oracle. **Do not dismantle the matrix in Phase A.**

### A1 — Vocabulary: `packages/ui/src/consts/families.stylex.ts`

- `families` via `stylex.defineConsts`: per hue `{ base, strong, ink? }` for
  aurora, solder, neon-violet, amber, error, aqua, orange. Derived ONLY from
  `gruvbox-palette`; mirror `apps/dev/src/lab/families.ts` (same base/strong
  rule: `light-dark(bright, faded)` for base, `neutral` for strong). `ink`
  only where text sits on the tint (amber today — DESIGN.md "contrast by
  exception").
- Named types (`FamilyName`, …). Re-exported from `index.ts`; covered by the
  `./consts/*` wildcard. No entries in `tokens/` (families are fixed
  vocabulary, not themable).
- **User checkpoint, one question, before coding:** consts (static strings,
  recommended) vs tokens (CSS variables). Recommendation: consts, matching the
  lab and the "fixed vocabulary" position in DESIGN.md.

### A2 — Small shared marks (additive)

- Promote the **LED mark** from `experimental.tsx` `Led` into the lib
  (e.g. `intents/led.stylex.ts`): ~7px circle, `currentColor`-based, glow
  variant. Real consumers: Key, Chip, LabField, MaterialScene (lab).
- Do **not** promote the light-field/glass-pane styling yet: only
  `MaterialScene` uses it (no second consumer). Keep it app-local until Phase D.

### A3 — Migrate `Slider` to `families`

Reference: `LabSlider` in `experimental.tsx`. Target: `Slider.tsx`.

- Replace the `variant` prop with `family?: FamilyName` (default = the contact
  hue) and drop the `intentFills`/`intentBorders` usage.
- Track stays a neutral recessed well (already sunken, self-tinted). Fill =
  `family.base` via a local style factory `fill(progress, familyBase)`.
  Thumb: neutral `background`, border seed = `family.strong` (+
  `[shadowColor.color]` so the rest cast carries the family, per the
  shadow-paints-itself rule). Container ring = `colors.ring` (already the
  contact ring, unchanged).
- Update its 2 call sites in `apps/dev/src/lab/laboratory.tsx`
  (`cutoff` → violet, `resonance` → orange) and remove the lab's local
  `LabSlider` in favor of the migrated lib `Slider` once visually identical
  (the lab then exercises the lib implementation).
- Private package, no API-stability burden (PRODUCT.md) — the `variant`→`family`
  rename is acceptable; keep a short `variant` alias only if you judge the
  showcase benefits.

### Acceptance (Phase A green)

- `vp check` clean at repo root.
- `vpr build` clean in `apps/dev` (exercises the StyleX transform; no
  `Could not resolve the path`).
- Laboratory renders: migrated `Slider` looks like `LabSlider` did; files
  compile with `families` consts inlined into `stylex.css`.
- Contrast audit still passes / unchanged (`scripts/audit_contrast.py`).

## 6. Constraints — do not

- Do not edit `consts/gruvbox-palette`, `tokens/colors`, `tokens/shadows`,
  `effects/`, or the audit script.
- Do not delete or rewrite the matrix maps (`colorVariants`, `colorIntents`,
  `intentFills`, `intentBorders`, `intentHovers`, `fieldFocus`) — other widgets
  consume them; they are retired in Phases B–D.
- Do not rewrite the docs during Phase A except to record code decisions as
  they land (e.g. `families.stylex.ts` existence).
- Do not use the `@repo/ui` barrel for token/const imports inside a
  `stylex.create`; import from `@repo/ui/<group>/<name>.stylex`. Dynamic colors
  inside `stylex.create` go through style-factory parameters (the Slider
  `fill(progress)` pattern).
- Do not run `vp pack` (it rewrites `exports`).

## 7. Verification commands

```bash
vp check                                   # fmt + lint + types (repo root)
pushd apps/dev && vpr build && popd       # StyleX transform + prod build
vpr dev                                     # visual oracle (lab is the default
                                            # view; light/dark/system top-right)
```

## 8. After Phase A

- Phase B: `Key` → `Button` (matte face + LED + contact ring + family hover
  infusion), retire its `colorIntents`/`intentHovers` usage.
- Phase C: `Chip` → `Badge`; `LabField` → the four text widgets (single well +
  one contact ring + data tag outside the box), retire `fieldFocus` per-family.
- Phase D: `MaterialScene` → `Surface`/scene material (light field + glass
  pane + well strip); retire the matrix leftovers; update DESIGN.md frontmatter
  and prune this working file.

## 9. First message to the user (suggested)

> I'm launching refactor Phase A: land `families` (base/strong) as consts in
> `@repo/ui` and migrate `Slider` onto them (variant → family), using the
> laboratory as the oracle. One question first: families as consts (recommended)
> or tokens? Then I proceed.
