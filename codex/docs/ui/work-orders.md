# Work Orders — @repo/ui Session Plan

> **Source of truth for the fix chain.** Every session executes exactly ONE task below, updates this document, and stops. Sessions stay short: one task, few files, a warm context window.
>
> - **Findings archive (immutable):** `codex/docs/ui/critique-report.md` (+ canonical Impeccable snapshot `.impeccable/critique/2026-09-17T10-15-23Z__packages-ui.md`). Never re-run the critique or re-read all sources if the archive covers it.
> - **Design contract:** `packages/ui/DESIGN.md` — any fix that changes a visual decision updates DESIGN.md too, never only code.
> - **Authoring rules:** `codex/docs/component-authoring.md`, `codex/docs/coding-conventions.md`, `codex/docs/ui-setup.md`.

## How to open a session (paste this)

```
Read codex/docs/ui/work-orders.md and codex/docs/ui/critique-report.md.
Run: .agents/skills/impeccable/scripts/impeccable context --target packages/ui
Execute the session marked "NEXT" in the Current State table.
When done, update the Current State table, append a Handoff entry, and add any decision
to the Decision Log. Do not touch other sessions.
note: It's a work we do together. Don't waist your time wondering about a choice. i am running the dev server. I see the change live and can make quick decisions.
```

Start every edit by reading `reference/craft-floor.md` (UI quality floor) per the Impeccable skill.

## Current State

| #   | Task                                                                                                                                    | Severity | Files                                                                                                         | Status                                                 |
| --- | --------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| S1  | Amber-on-cream contrast (Segmented + RadioGroup)                                                                                        | P0       | components/Segmented.tsx, components/RadioGroup.tsx                                                           | done                                                   |
| S2  | Glow merge bug (Toggle, Checkbox) + Button dead focusRing                                                                               | P1       | components/Toggle.tsx, Checkbox.tsx, Button.tsx                                                               | done                                                   |
| S3  | ~~Glass only when floating (docked panel opaque)~~ **cancelled** — panel always has a visual backdrop; glass is unconditional by design | P1       | components/ExperimentShell.tsx, MaterialScene.tsx                                                             | cancelled                                              |
| S4  | Retire role-matrix residue (primary, SectionHeading, Swatch)                                                                            | P1/P2    | tokens/colors.stylex.ts, components/SectionHeading.tsx, Swatch.tsx                                            | done                                                   |
| S5  | Pressable parity + touch targets ≥44px                                                                                                  | P2       | Toggle, Checkbox, Segmented, RadioGroup, Slider, Button, foundations/touch.stylex.ts, consts/layout.stylex.ts | done                                                   |
| S6  | ShellWrapper/Stage ambient washes — **decision task**                                                                                   | P1       | components/ShellWrapper.tsx, Stage.tsx                                                                        | done                                                   |
| S7  | P3 batch: geometry, Led typing, ColorField row, error state, heading hierarchy                                                          | P3       | multiple (see S7)                                                                                             | done                                                   |
| S8  | `polish` + re-run `critique` + DESIGN.md sync                                                                                           | —        | interfaces                                                                                                    | polish done — **re-critique deferred to next session** |

**NEXT: S8.** When a session is in progress, the executing task is marked `in-progress` and the next pending task becomes `NEXT`.

## Handoff Protocol (mandatory)

At the end of EVERY session, the agent must update this file with:

1. **Current State table:** flip your task to `done` (or `blocked` + reason), mark the following task `in-progress` or leave `NEXT`.
2. **Handoff entry** (append below, most recent last): what changed (files, token/API effects), verification performed (commands, tests, detector, lab checks), anything the next session must know (DOM/token gotchas, API breaks, decisions still open).
3. **Decision Log:** any decision taken or question left for the user.

Do not leave a session without a Handoff entry. The next agent starts from the entry, not from re-reading the code.

## Global Rules

- **One session = one task.** Do not creep into other tasks; if a blocking dependency is found, note it in the Handoff and stop.
- **Token-first.** One-Token Rule: never reference the raw palette (`consts/gruvbox-palette.stylex.ts`) from a component; consume semantic tokens.
- **Contract rules that govern fixes:** One Contact Rule (single `colors.ring` focus halo), Glass-on-Floating-Only (no blur/translucency on in-flow surfaces), Warm Ground (no pure black faces), Mono Readout (readings in mono), matte faces (no resting saturated fill outside marks/LEDs).
- **StyleX runtime reality:** properties that compile to the same runtime key (e.g. `box-shadow`) are deduped by registration order. When composing shadow-like effects (glow/focus/press), verify the **merged** output in `apps/dev`, not the source classes. This is what caused P1-B.
- **Verify in the real surface:** `apps/dev` is the reference app; the visual laboratory there compares current vs experimental before any token/API change.
- **Touch policy:** no interaction depends on hover; targets aim for ≥44px.
- **Accessibility:** keep `prefers-reduced-motion` honoring, roving-tabindex (arrows + Home/End), `aria-live` on readings; fix color-meaning-by-highlighted-state only, never text contrast below ~4.5:1.

---

## S1 — Amber-on-cream selection text (P0)

**Critique ref:** `P0-A` in critique-report.md.
**Command:** `$impeccable audit`
**Files:** `packages/ui/src/components/Segmented.tsx`, `packages/ui/src/components/RadioGroup.tsx`.

- `Segmented.tsx:81-86` and `RadioGroup.tsx:84-89` set `backgroundColor: amberBase` and `color: colors.background` on the chosen option.
- In light mode this is ~1.1:1 contrast (bright yellow on near-white). The tree already ships `families.amber.ink.fg` for text-on-tint.
- **Fix:** chosen-option text color derives from `fam.ink` (or a forced neutral for amber in light). Keep the family on the fill, not an extra variant hue.

**Acceptance criteria:**

- Chosen option text in light mode ≥ 4.5:1 on its tint (measure with a contrast check, both Segmented and RadioGroup).
- Dark mode unchanged.
- No component references the raw palette.
- `apps/dev` shows the selection legible in both modes.

**Handoff notes to write:** the exact token used, before/after contrast numbers, any other widget found painting text on a tint fill.

---

## S2 — Glow merge bug (P1)

**Critique ref:** `P1-B`.
**Command:** `$impeccable polish`
**Files:** `Toggle.tsx`, `Checkbox.tsx`, `Button.tsx`.

- In Toggle/Checkbox, `glow.glowRing` vs `focusRing.base` collapse to one runtime `box-shadow` key; styleq keeps the last-registered value, so the ON glow never renders.
- Button: `pressable.base` wins the same merge, making its `focusRing.base` dead code.
- **Fix:** order glow _after_ the focus ring, or fold the ring into glow's shadow list (as pressable already does). Remove Button's dead `focusRing.base`.
- The glow is the system's state channel ("a glowing thing is a living thing"); ON = 6px same-hue halo, 120–320ms, disabled at rest.

**Acceptance criteria:**

- Verify the **compiled** output in `apps/dev` (inspect computed `box-shadow` on an ON Toggle/Checkbox): glow halo present, focus ring still present on keyboard focus, focus halo and glow both visible on focus+ON.
- `prefers-reduced-motion` still honored.
- Button focus appearance unchanged (pressable ring already handles it).

**Handoff notes to write:** the ordering/merge fix used, the computed-style evidence, whether a visual-regression check exists in the lab for this.

---

## S3 — Glass only when floating (P1)

**Critique ref:** `P1-C` (glass half).
**Command:** `$impeccable distill`
**Files:** `ExperimentShell.tsx`, `MaterialScene.tsx`.

- `ExperimentShell.tsx:131` applies `glass.glass` unconditionally to `styles.panel`, including the **docked** placement (in-flow). Contract: "In-flow surfaces stay opaque so text contrast never depends on what sits behind them."
- **Fix:** glass only when `isFloating`; docked panel uses the opaque panel surface.

**Acceptance criteria:**

- Docked panel (side/bottom) renders opaque; floating panel keeps glass + blur(24px) saturate(180%) over the light backdrop.
- Docked text contrast is independent of the scene behind it.
- `MaterialScene` under/over still demonstrates the light-field → glass marriage.

**Handoff notes to write:** the exact conditional used, both modes verified in `apps/dev`, any surface where docked glass was intentional (flag to S6/decision).

---

## S4 — Retire role-matrix residue (P1/P2)

**Critique ref:** `P2-D` + minor observations (Led typing, Swatch teaching).
**Command:** `$impeccable extract`
**Files:** `tokens/colors.stylex.ts`, `components/SectionHeading.tsx`, `components/Swatch.tsx`, `components/Led.tsx`, `components/Stage.tsx` (reads only, resourced in S6).

- `colors.primary/secondary/accent/destructive/warning/*` still exist; `primary ≡ aurora ≡ ring` (redundant vocabulary for one hue).
- `SectionHeading.tsx:21` LEDs in `colors.accent`; every other LED uses `families.*`.
- `Swatch.tsx` presents the legacy roles as the canonical example set.
- `Led` accepts any color string with no guard, which is how `accent` got in.
- **Fix:** alias `primary`/`accent`/etc. to families or remove; SectionHeading LED → a `families.*` value; Swatch demonstrates families (`base`/`strong`); optionally type `Led`'s color prop to a `FamilyName`.

**Acceptance criteria:**

- No component references a removed/legacy role token; search for `colors.(primary|secondary|accent|destructive|warning)` returns only the alias/removal shim or nothing.
- `SectionHeading` LED consistent with other LEDs.
- `apps/dev` visual laboratory still passes on tokens (compare current vs experimental).

**Handoff notes to write:** what was aliased vs removed (breaking vs non-breaking), whether swatch/docs copy changed, any consumer of the legacy tokens found.

---

## S5 — Pressable parity + touch targets (P2)

**Critique ref:** `P2-E` + minor observations (pixel geometry).
**Command:** `$impeccable adapt`
**Files:** `Toggle.tsx`, `Checkbox.tsx`, `Segmented.tsx`, `RadioGroup.tsx`, `Slider.tsx`, `components/Button.tsx`, `consts/layout.stylex.ts` (or a new size-space const).

- Hit areas today: Button ~33, Toggle 20, Checkbox 18, Radio 28, Segmented ~19, Slider rail 14.
- Toggle/Checkbox/Segmented/RadioGroup lack `pressable` (no hover shadow, no active press) — Button is the only true pressable.
- `layout.controlFieldMinHeight: 44px` exists but only pads wrappers.
- **Fix:** add `pressable.base` to the four widgets; introduce a `touchTarget` const / min-height + padded hit-area (visual footprint stays compact — expand the hit box, keep the stroke tight). Move the scattered 34/20/14/18/16/12px geometry into the const layer. Consider arrow-key scale hopping on Slider for keyboard precision (Alex persona).

**Acceptance criteria:**

- Every interactive widget's effective touch target ≥44×44px (measure hit area, not visible box) and no interaction depends on hover.
- Press feedback exists on Toggle/Checkbox/Segmented/RadioGroup (shadow lift + active sink), consistent with Button, `prefers-reduced-motion` honored.
- No raw pixel geometry left in component style props (visual-atom dimensions like LED/LED dot sizes may stay).
- Slider keyboard: arrows + Home/End already fine; only add refinement if it doesn't disturb the rail anatomy.

**Handoff notes to write:** target map before/after, the const introduced, whether Slider refinement was included.

---

## S6 — ShellWrapper/Stage ambience — DECISION TASK (P1)

**Critique ref:** `P1-C` (ambience half) + question 5.
**Command:** `$impeccable quieter` (if reducing)
**Files:** `components/ShellWrapper.tsx`, `components/Stage.tsx`.

- `Stage`/`ShellWrapper` paint 18–55% radial washes (`colors.primary/accent/secondary/warning`) over the whole background on load. The review reads this as violating canvas-first and the "dim, Gruvbox-warm room" brief.
- The affected users dismissed the decision once; do **not** ask again in-session. Default recommendation: compare in the **visual laboratory** (current vs experimental) and, unless the experimental direction explicitly preserves the washes, reduce presence significantly or drop for the default shell.

**Acceptance criteria:**

- Decision recorded in the Decision Log with the lab evidence.
- If reduced: the canvas recedes the washes; scaffold is visibly secondary; light fields (if kept) sit in the `MaterialScene` regime, not on loading-page chrome.
- S4 (token cleanup) lands before or together with this task — washes should be re-sourced onto `families.*`, never legacy roles.

**Handoff notes to write:** the decision taken and its lab evidence, exact wash values before/after, DESIGN.md impact.

---

## S7 — P3 batch

**Critique ref:** minor observations + cognitive-load failures (heading hierarchy).
**Command:** `$impeccable harden`
**Files:** multiple — `SectionHeading.tsx` / `ControlPanel.tsx` / `ControlSection.tsx` (hierarchy), `Led.tsx` (typing), `ColorField.tsx` (family/LED row), an error/`aria-invalid` affordance (any field component + an intent), pixels → `consts/`.

Sub-tasks (each independently verifyable; do them in order):

1. **Error affordance:** add a sanctioned invalid/error state (border + `aria-invalid` + message slot) to the field family; NumberField should not clamp silently. (Heuristic #9 = 1 is the weakest score.)
2. **Heading hierarchy:** the three heading components carry three recipes (18px sans / 14px sans / 12px mono, all uppercase muted). Collapse to a real stepped hierarchy consistent with the Upper-Label Rule, so level is readable at a glance.
3. **`ColorField`** gains the family/LED row the other fields have.
4. **`Led`** color prop typed to `FamilyName` (blocking raw palette injection).
5. **Pixel geometry → const layer** (the residue left from S5).

**Acceptance criteria:**

- A field in error shows: invalid styling, `aria-invalid`, a plain-language message near the control, and (for NumberField) explicit feedback on clamp.
- The three heading levels are distinguishable at a glance (size/weight/tracking), still following the case+tracking rule.
- `ColorField` family/LED row present and consistent.
- `Led` rejects raw/hex colors at type level.
- No new raw pixel literals in component style props.

---

## S8 — Polish + measure (final)

**Command:** `$impeccable polish` then `$impeccable critique packages/ui`

- Run `polish` against the latest critique snapshot; it inherits the priority issues.
- Re-run `critique` to refresh the score and the snapshot; update `critique-report.md` reference to the new snapshot file.
- Check DESIGN.md is in sync with every decision taken (glow, glass rule, ambience, role-matrix retirement, error vocabulary).

**Acceptance criteria:** no P0/P1 open; score improved vs 27/36; DESIGN.md matches the code.

---

## Decision Log

| Date       | Session | Decision                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Impact                                           |
| ---------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| 2026-09-17 | (plan)  | Session chain uses one task per session, short sessions                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Workflow                                         |
| 2026-09-17 | (plan)  | ShellWrapper ambience deferred to S6 as a lab-backed decision task (default: reduce)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | S6                                               |
| 2026-09-17 | S1      | Chosen Segmented option: text = `colors.foreground` (dark in light, bright in dark) for ALL families; the fill carries the family hue. Do not special-case amber with the ink token. **Validated by user** in `apps/dev`                                                                                                                                                                                                                                                                                                                                                                                                                                  | S1/S4                                            |
| 2026-09-17 | S1      | **Uniform mark/text-on-family-fill rule** (extends Segmented): any mark/text on a family fill = `colors.foreground` (dark in light, bright in dark), family lives only on the fill. Applied to RadioGroup dot. **Validated by user**                                                                                                                                                                                                                                                                                                                                                                                                                      | S1/S4                                            |
| 2026-09-17 | S2      | **Compose-glow-with-focus** (Pilot Light fix): when a glowing widget is also keyboard-focused, `boxShadow` is a single list — glow halo + focus halo — never two competing `box-shadow` declarations. Implemented as a `glowRingWithFocus` variant with a `:focus-visible` slot. Toggle/Checkbox are mutually exclusive by state (`isOn ? glowRingWithFocus : focusRing.base`), so no argument-order coupling. Button keeps `pressable.base` only; `pressable` is now the primitives' focus owner and supplies `outline: none`.                                                                                                                           | S2/S5                                            |
| 2026-09-17 | S3      | **Glass always applies to panel** — the docked panel always sits over a visual backdrop (stage or experiment shell), so `glass.glass` stays unconditional. The original P1-C finding is not a bug for this panel; S3 scope is cancelled.                                                                                                                                                                                                                                                                                                                                                                                                                  | S3/S6                                            |
| 2026-09-17 | S4      | **Alias, don't delete, the four residual roles.** `colors.primary` → `families.aurora.base`, `secondary` → `solder`, `accent` → `neon-violet`, `warning` → `amber` — as `var()` aliases (single source = families), because Stage/ShellWrapper washes still consume them (reads-only until S6). `destructive`, all `*Foreground`, all `*Hover` removed — no consumers. **Breaking:** `primaryForeground`/`secondaryForeground` retired; lab switched to `colors.foreground` (S1 uniform rule). SectionHeading LED keeps its violet hue via `families["neon-violet"].base` (appearance unchanged, token vocabulary fixed). Swatch API: `variant` = surface | `FamilyName`, new `tension: "base" \| "strong"`. | S4/S6 |
| 2026-09-17 | S5      | **Touch-target floor deliberately relaxed (user decision).** The mini-apps consuming `@repo/ui` are desktop-first, not realistically mobile; the strict ≥44px target is eased. Press feedback (the actual P2-E gap) is the hard requirement; the 44px floor applies only where invisible and free: Toggle/Checkbox carry a transparent 44×44 hit span; Slider's container is the 44px band (the invisible input needs it). Button/Segmented/RadioGroup keep their compact visible footprints with no target inflation.                                                                                                                                    | S5                                               |
| 2026-09-17 | S5      | **`glowWithPress` replaces `glowRing`/`glowRingWithFocus`** (which became dead code). ON Toggle/Checkbox now emit ONE `box-shadow` list per state (halo + rest / hover / active, and halo + ring on focus) — the S2 compose idiom extended to the press ladder. The widgets set `[shadowColor.color]` to the family `base`, so halo and lift are family-tinted (Shadow-Paints-Itself on a live key). Verified in compiled `stylex.css`.                                                                                                                                                                                                                   | S2/S5                                            |
| 2026-09-17 | S5      | **No pseudo-elements for hit areas (StyleX guidance).** The touch floor rides a REAL absolutely-positioned `<span aria-hidden>` centered on the control, so `:hover`/`:active`/`:focus-visible` still fire on the visual box; `touch.hit` in `foundations/touch.stylex.ts`.                                                                                                                                                                                                                                                                                                                                                                               | S5                                               |
| 2026-09-17 | S6      | **Light fields are localized to material scenes, not full-page chrome.** ShellWrapper washes reduced from 45–55% `oklch` saturates to 10–12% `oklch` tints (aurora bottom-left, solder top-right); conic gradient removed. Stage washes removed entirely (plain `background→card` linear gradient). Noise texture kept on both. Canvas is now visually neutral — color lives in MaterialScene and data marks. The `MaterialScene` in the laboratory correctly demonstrates the under/over light-field concept; the shell should not repeat it at viewport scale.                                                                                          | S6/DESIGN.md                                     |
| 2026-09-17 | S7      | **Error vocabulary (Heuristic #9 closed).** `invalid` + `errorMessage` on all five field primitives (TextInput, TextArea, Select, NumberField, ColorField): error family owns the well border, `aria-invalid` via the control, message in `fieldText.message` (mono xs, `role="alert"`, `aria-describedby`). Focus still answers with the contact ring — error and focus are never conflated. `field.wellInvalid` in `foundations/field.stylex.ts`.                                                                                                                                                                                                       | S7/DESIGN.md                                     |
| 2026-09-17 | S7      | **NumberField never clamps silently.** A typed out-of-range value paints the well invalid (internal `clampNotice`) and reports the bound in plain language (`value clamped to 100 (maximum)`), cleared on blur or when back in range. Rationale: silent clamp was the #9 failure and the "no reset/undo" control gap (Heuristic #3).                                                                                                                                                                                                                                                                                                                      | S7/DESIGN.md                                     |
| 2026-09-17 | S7      | **Heading recipes collapsed into one ladder** (`foundations/heading.stylex.ts`, `heading.level1/2/3`): L1 SectionHeading = sans 18px 600 fg · L2 ControlPanel = sans 14px 500 fg · L3 ControlSection = mono 12px 500 muted. All uppercase + wide (Upper-Label Rule). Structure was already numerically stepped; the win is a single authored foundation instead of three component-local recipes. L3 stays mono because a control-group label is a technical mod name (a reading).                                                                                                                                                                        | S7/DESIGN.md                                     |
| 2026-09-17 | S7      | **`Led` `color` tightened to `FamilyName`** (breaking for raw-string callers, internal-only consumers updated). The mark takes `families[color].base` — a family name, never a palette/hex string, blocking S4-era `colors.accent`-style injections at the type level. App.tsx launcher LED is now `<Led color="amber" />`; experimental.tsx's lab-local Led (string) stays untouched.                                                                                                                                                                                                                                                                    | S7                                               |

## Handoff Archive

(Newest last. Written at the end of each session by the executing agent.)

### S1 (2026-09-17) — Amber-on-cream selection text

**Change:** `packages/ui/src/components/Segmented.tsx` and `components/RadioGroup.tsx`.

- `Segmented.tsx`: all seven `chosenVariants` now set `color: colors.foreground` (light: `dark0`@80%→black, dark: `light0Hard`) instead of `colors.background`. `chosenNeutral` untouched (its dark-mode pill is a light surface, dark text stays correct).
- `RadioGroup.tsx`: removed the `dotFamily` override (was `colors.background`). The chosen dot now always keeps its base `colors.foreground`, i.e. the same uniform rule. No token/API change.

**Decision (Decision Log):** uniform rule — **any mark/text on a family fill uses `colors.foreground` (dark in light mode, bright in dark mode); the family lives only on the fill.** Amber does **not** use `families.amber.ink.fg`.

**Contrast (Segmented amber):** light old = cream `light1` on `amberBase` (`brightYellow`) ≈ 1.1:1 (FAIL). Light new = near-black `colors.foreground` on `brightYellow` ≈ 9.7:1 measured (docs 4.62:1 for the parallel `dark0Hard` pair) ≥ 4.5 ✓. Dark new = `light0Hard` (bright) on `fadedYellow` — the documented ~2–2.7:1 shortfall for text on `faded*` fills, accepted by design (user preference).

**Verification:** `vp check` format/lint/type passes. Rendered amber Segmented and RadioGroup dot both validated by user in `apps/dev` (`minisynth.tsx:193` amber Segmented, `minisynth.tsx:303` RadioGroup, `laboratory.tsx:198`).

**Notes / for next sessions:**

- **King-attempts reverted:** an earlier pass changed `families.amber.inkFg` to a constant `dark0Hard` (both modes dark), added a RadioGroup `dotAmber`, and edited DESIGN.md. All reverted; the tree is token- and API-identical to before S1.
- `colors.foreground` is now the sanctioned mark/text-on-family-fill token. When S4 retires the role matrix, `families.*.ink.fg` and `warningForeground` may be re-audited against this rule.

### S2 (2026-09-17) — Glow merge bug (Pilot Light)

**Change:** `components/Toggle.tsx`, `components/Checkbox.tsx`, `effects/glow.stylex.ts`, `components/Button.tsx`, `intents/pressable.stylex.ts`.

- `effects/glow.stylex.ts`: added `glow.glowRingWithFocus` — a single `boxShadow` value that composes the glow halo (`0 0 6px shadowColor@55%`) with the universal focus halo (`0 0 0 2px background / 0 0 0 3px ring`) via a `:focus-visible` slot. This is exactly how `pressable` already composes the ring onto its lift: one `box-shadow` key per state, never two competing keys.
- `Toggle.tsx` / `Checkbox.tsx`: ON → `glow.glowRingWithFocus`; OFF → `focusRing.base`. The states are mutually exclusive (`isOn ? glowRingWithFocus : focusRing.base`), so there is **no argument-order coupling** and no StyleX dedupe blind spot. ON+focus renders halo+ring; OFF+focus renders ring only; ON+rest renders halo only.
- `Button.tsx`: removed `focusRing.base` (provably dead — `pressable.base` won the `box-shadow` key) and its import. Focus appearance unchanged: `pressable.base:focus-visible` already carries the same ring.
- `intents/pressable.stylex.ts`: added `outline: "none"` (previously supplied by the removed `focusRing.base`). `pressable` is now the single focus/rest/elevation owner for primitives.

**Verification:** `vp check` passes (format, lint, types, 64 files). No test files exist in the repo (`vp test`: no files found). **Live check pending user** in `apps/dev`:

- ON family Toggle/Checkbox (minisynth.tsx:243-248, 254-259) should now show a 6px same-hue halo instead of a flat fill.
- Keyboard-tab to an ON widget → glow + focus halo both visible; focus an OFF widget → ring only.
- Button keyboard focus → the halo ring (via `pressable`) still shows; no default browser outline.

**Notes / for next sessions:**

- **Pattern to reuse:** the compose-in-one-`boxShadow` idiom (a `:focus-visible` slot inside the effect's own value) is the sanctioned way to make an effect run _alongside_ focus. Prefer it over footgun reordering. S5 can lean on `pressable.base` (which now also owns `outline: none`) without double outline concerns.
- `glow.glowRing` (ring without focus) is now consumed by nothing; kept as a standalone building block at this stage — S7/S8 may re-audit if it stays unused.
- Disabled ON toggle/checkbox keeps its glow at 45% opacity (`disabledStyle.base` only sets cursor+opacity; no box-shadow conflict). Confirms the disabled lab case (`minisynth.tsx:248`, `:260`) unchanged apart from now glowing.
- No token/API changes; `colors.*`, `fx` consts untouched.

### S4 (2026-09-17) — Retire role-matrix residue

**Change:** `tokens/colors.stylex.ts`, `components/SectionHeading.tsx`, `components/Swatch.tsx`, `apps/dev/src/lab/minisynth.tsx`, `apps/dev/src/lab/laboratory.tsx`.

**`colors.stylex.ts`:**

- **Aliased (to families, `var()` chain — verified in compiled CSS):** `primary` → `familiesConsts.auroraBase`, `secondary` → `solderBase`, `accent` → `neonVioletBase`, `warning` → `amberBase`. These four remain because Stage/ShellWrapper/App/minisynth/laboratory still reference the role names; they are reads-only until S6. Single source of truth is now `./families.stylex`.
- **Removed (non-breaking, zero consumers):** `destructive`, `destructiveForeground`, `destructiveHover`, `accentForeground`, `accentHover`, `warningForeground`, `warningHover`, `primaryHover`, `secondaryHover`.
- **Removed (breaking):** `primaryForeground`, `secondaryForeground` — replaced everywhere by `colors.foreground` per the S1 uniform rule (identical computed value; verified).
- Extracted the shared on-tint foreground into `onFillForeground` const used by `foreground`, `cardForeground`, `popoverForeground` (DRY; values byte-identical to before).
- `ring`, `muted`, `mutedForeground`, `mutedHover`, neutrals, wells untouched.

**`SectionHeading.tsx`:** LED `colors.accent` → `families["neon-violet"].base` (both `backgroundColor` and `color`). Appearance unchanged (accent ≡ neon-violet base); vocabulary now a family like every other LED.

**`Swatch.tsx`:** API reworked. `variant` is now `"background" | "card" | "popover" | "muted" | FamilyName`; new `tension?: "base" | "strong"` (default `"base"`) selects the family tension. No `variant` role set — Swatch teaches surfaces + families, not the legacy matrix. Exported `SwatchSurfaceVariant` type. `minisynth.tsx` family section now shows all 7 families × base/strong (+ surfaces section keeps background/card/popover).

**`Led` untouched:** typing the color prop is S7 sub-task 4 (explicitly planned there); SectionHeading was the only `colors.accent`-via-Led leak and is now gone.

**Verification:**

- `vp check` (--fix) passes: format, lint, types.
- `vp -C apps/dev build` succeeds. Compiled `stylex.css`: the four role aliases emit as `--x…:var(--x…)` referencing the families block, which defines raw `light-dark()` values — no cycles, valid custom-property chain. `colors.primary` still resolves to aurora in the app shell.
- Grep `colors\.(primary|secondary|accent|destructive|warning)`: only Stage/ShellWrapper (S6) + app surfaces remain via the alias shim; **no** `destructive`/`*Foreground`/`*Hover` references anywhere in code.
- No tests in repo. **Live check pending user:** minisynth "families" swatches (7 families × base/strong), SectionHeading LEDs unchanged hue, elevation tiles still tinted aurora/solder.

**Notes / for next sessions:**

- S6 must re-source Stage/ShellWrapper washes onto `families.*` and then the four role aliases can be deleted outright.
- `colors.ring` is the sanctioned contact token and stays; it happens to equal aurora base — that duplication is intentional and documented (S5 focus-ring note).
- Swatch's own docs copy was not changed (no doc file for Swatch found); the DSL hack section in `swatch` rendered in the lab is the canonical teaching now.

### S5 (2026-09-17) — Pressable parity + touch targets

**Change:** `Toggle.tsx`, `Checkbox.tsx`, `Segmented.tsx`, `RadioGroup.tsx`, `Slider.tsx`, `Button.tsx`, `effects/glow.stylex.ts`, `foundations/touch.stylex.ts` (new), `consts/layout.stylex.ts`.

- **Press parity (P2-E):** OFF Toggle/Checkbox, Segmented options and RadioGroup rows now consume `pressable.base` (rest→hover lift→active sink + folded `:focus-visible` ring), replacing `focusRing.base` — which was provably lost to the `box-shadow` dedupe anyway. Button unchanged (already pressable).
- **ON Toggle/Checkbox:** `glow.glowWithPress` — ONE `box-shadow` list per state: halo + `shadows.rest` (rest), halo + `hover`, halo + `active`, halo + ring on focus. Supersedes `glowRing`/`glowRingWithFocus` (both deleted; now dead). The widgets now set `[shadowColor.color] = fam.base` on ON, so the halo **and** the new lift are family-tinted (this also fixes the S2-era grey halo — the tint was never actually injected). Compiled CSS verified: `box-shadow:0 0 6px color-mix(...55%,transparent),rest` and a focus list with the ring.
- **Touch targets (relaxed by user):** desktop-first miniapps → no strict floor. Invisible real-element hit span (`foundations/touch.stylex.ts` → `touch.hit`, a transparent 44×44 `<span aria-hidden>` centered on the control; NO pseudo-elements per StyleX guidance) applied to Toggle/Checkbox only. Slider's container grew to the 44px band (the opacity-0 range input must span it); rail/thumb stay 4px/14px centered — anatomy intact, ring now pill-rounded. Button/Segmented/RadioGroup keep compact visible footprints (min-heights reverted after user live-flagged the 44px inflation as ugly).
- **Const layer (S7 residue #5 reduced):** `controlTouchTarget 44px`, `toggleTrackWidth/Height/KnobSize/KnobTravel`, `checkboxSize/MarkSize`, `radioOptionMinHeight/CircleSize/DotSize`, `segmentPadBlock`, `sliderRailHeight/ThumbSize` all moved into `consts/layout.stylex.ts`; no raw px left in these components' style props except the 1px hairline border-widths (BorderWidth tokens) and Slider's `top:"50%"`/`"2px"` knob inset (Slice-internal, kept).

**Verification:** `vp check` passes (format/lint/type, 65 files). `vp -C apps/dev build` succeeds; compiled `stylex.css` shows the composed glow+press `box-shadow` single lists and the deduped `44px` hit atom. **Live check pending user** in `apps/dev`:

- Toggle/Checkbox ON: fill + family-tinted halo + subtle rest lift; hover raises, press sinks inset; tab into an ON widget → halo + focus ring together.
- Toggle/Checkbox OFF: rest lift + hover/active + focus ring (pressable), no glow.
- Segmented/RadioGroup: hover lift + press sink on the compact footprint; focus ring unchanged.
- Slider: rail/thumb unchanged, ring now a pill around the wider band.

**Notes / for next sessions:**

- **User decision on record:** strict ≥44px is NOT required (desktop-first miniapps, live call). S7 #5's "pixel geometry residue" is largely cleared by this session; remainder (LED/LED-dot atoms, knob inset) is allowed to stay by the S5 acceptance ("visual-atom dimensions may stay").
- Design tension observed but left: RadioGroup+SldrSlender pressable rest cast is `shadowColor`-default (`oklch(0% 0 0)`) — transparent options' lift reads as a neutral fade, chosen segmented pills lift with a black-tinted cast. If S7 polishes, tint segmented chosen/`chosenNeutral` via `[shadowColor.color]` to the family/`mutedForeground` for Shadow-Paints-Itself parity.
- Slider arrow-scale hopping (Alex) deliberately skipped: native range already arrow/Home/End; scale-hopping would need custom dragging logic that risks the rail anatomy — left for S7/S8 if ever wanted.
- `disabledStyle.base` untouched; disabled ON Toggle/Checkbox keeps halo at 45% (unchanged from S2).

### S6 (2026-09-17) — ShellWrapper/Stage ambient washes

**Change:** `components/ShellWrapper.tsx`, `components/Stage.tsx`.

- **Stage.tsx:** removed all three radial gradients (`primary` 24%, `accent` 18%, `warning` 20%) and the `isolation: "isolate"` declaration. `backgroundImage` is now a plain `linear-gradient(150deg, background, card)` — neutral canvas, no color. `backgroundColor: colors.background` unchanged.
- **ShellWrapper.tsx:** removed the third radial gradient (`primary` 55%), the conic gradient (`secondary` 20%), and the two remaining `oklch` washes (`accent` 45%, `secondary` 50%). Replaced with two subtle washes sourced directly on families: `auroraBase` at 12% in the bottom-left corner, `solderBase` at 10% in the top-right — both via `color-mix(in oklab, ...)`. Noise texture and the `foreground→background` linear gradient kept. `backgroundBlendMode` updated from 5 layers to 4. New import: `familiesConsts` from `../tokens/families.stylex`.

**Wash values before/after:**

| Layer         | Before                  | After                  |
| ------------- | ----------------------- | ---------------------- |
| SW accent     | 45% oklch (neon-violet) | —                      |
| SW secondary  | 50% oklch (solder)      | —                      |
| SW primary    | 55% oklch (aurora)      | —                      |
| SW conic      | 20% oklch (solder)      | —                      |
| SW aurora     | —                       | 12% oklch (auroraBase) |
| SW solder     | —                       | 10% oklch (solderBase) |
| Stage primary | 24% srgb                | —                      |
| Stage accent  | 18% srgb                | —                      |
| Stage warning | 20% srgb                | —                      |

**Verification:** `vp check` passes (format/lint/type, 65 files). `vp -C apps/dev build` succeeds. Compiled CSS shows the reduced wash `color-mix` values — SW now emits two small `radial-gradient` layers plus noise and linear foundation; Stage emits only the linear gradient.

**Live check pending user** in `apps/dev`:

- Launcher (menu): neutral canvas, subtle warm gradient under the noise, no colored backdrop.
- Mini-synth Stage: neutral background, content-only canvas.
- Laboratory: same neutral canvas, light fields now only appear inside the localized MaterialScene study.

**Notes / for next sessions:**

- **Role aliases (`primary`, `secondary`, `accent`, `warning`) not removed.** S4 planned to delete these once S6 re-sourced the washes; however, `minisynth.tsx` (elevation tiles at lines 116–150), `laboratory.tsx` (legacy tile at line 172), and `App.tsx` (menu hover feedback at lines 81–82) still consume them. These are app-level consumers, not `@repo/ui` library consumers. The aliases stay in `colors.stylex.ts` until S7/S8 cleans up the app code.
- **DESIGN.md updated:** light field regime now explicitly scoped to "localized MaterialScene and similar under/over compositions; not full-page chrome."
- Canvas is now visually quiet — the only color on a fresh page is the noise texture and the very subtle SW gradient. MaterialScene in the laboratory is the one place light fields are visible. This matches the "dim room" brief and gives the Pilot Light glow (state) and data marks (identity) room to be the only chromatic signals.

### S7 (2026-09-17) — P3 batch: error state, heading ladder, ColorField row, Led typing, pixels

**Change:** `Led.tsx`, `Button.tsx`, `Badge.tsx`, `TextInput.tsx`, `TextArea.tsx`, `Select.tsx`, `NumberField.tsx`, `ColorField.tsx`, `SectionHeading.tsx`, `ControlPanel.tsx`, `ControlSection.tsx`, `foundations/field.stylex.ts`, `foundations/text.stylex.ts`, `foundations/heading.stylex.ts` (new), `consts/layout.stylex.ts`, `packages/ui/DESIGN.md`, `apps/dev/src/App.tsx`, `apps/dev/src/lab/minisynth.tsx`.

**1. Error affordance (Heuristic #9, score 1 → closed).** `invalid?` + `errorMessage?` on TextInput, TextArea, Select, NumberField, ColorField.

- `field.wellInvalid` in `foundations/field.stylex.ts`: `borderColor: families.error.base` (incl. `:focus`), recess sunken shadow untouched. Focus keeps the contact ring on the shadow — error owns the border, focus owns the ring, never conflated.
- `fieldText.message` in `foundations/text.stylex.ts`: mono xs, `families.error.base`.
- Each field: `aria-invalid={invalid || undefined}`, `aria-describedby` → message id, message rendered `role="alert"`. Copy names problem + recovery (`"missing value — enter a valid patch name"`).
- **NumberField clamp feedback:** internal `clampNotice` state — a typed out-of-range draft paints the well invalid and reports `value clamped to 100 (maximum)`; cleared on blur or when back in range. Control error border/slot wiring: `invalid || isClamped`.

**2. Heading ladder collapsed.** New `foundations/heading.stylex.ts` with `level1` (sans 18px 600 fg), `level2` (sans 14px 500 fg), `level3` (mono 12px 500 muted), all uppercase + wide. `SectionHeading` h2 → level1, `ControlPanel` h2 → level2 (drops the old `fieldText.label` merge), `ControlSection` span → level3. Visually the step is what previously rendered (the numbers were right); the fragmentation between three component-local style blocks is gone — one authored ladder, DESIGN.md gains the L1/L2/L3 table.

**3. ColorField family/LED row.** Now `field.col` + `field.labelRow` anatomy exactly like the other fields: optional `family` + `live` render the LED + label above, control row (color input + mono hex readout, `aria-live`) below. Previously the label sat inline with the input.

**4. `Led` typed.** `color: FamilyName` (was `string`); renders `families[color].base`. Consumers updated: Button, Badge, TextInput, TextArea, Select, NumberField, ColorField use `<Led color={family} …/>`; App.tsx launcher → `<Led color="amber" live />` (unused `families` import removed). The lab-local Led in `experimental.tsx` (string) is untouched — it is the probe vocabulary.

**5. Pixels → consts.** Added to `consts/layout.stylex.ts`: `ledAtomSize 7`, `colorSwatchWidth/Height/Pad 36/26/2`, `chevronSize 12`, `spinnerSize 12`, `spinnerRingWidth 2`, `chipPadBlock 2`. Applied to Led + SectionHeading led, ColorField input, Select chevron, Button spinner, Badge chip. **Allowed to stay** (S5 acceptance): Toggle knob inset `2px` (slice positioning), Slider ring offsets `2/3px` (focus halo), `MaterialScene` `-32px` bleed (scene composition).

**Verification:**

- `vp check` passes (format/lint/type, 66 files), `vp -C apps/dev build` succeeds. Compiled `stylex.css` contains the error border (`light-dark(oklch(0.66 0.218 30.392), oklch(0.437 0.179 28.26))`), the new `26px/36px` swatch atoms and the 7px LED atoms.
- No test files exist in the repo.

**Live check pending user** in `apps/dev`:

- Field in error styling + the `invalid` TextInput in the minisynth (label row → error border + message under the well; focus the field → error border stays but contact ring appears).
- NumberField "clamp demo": type 250 (or -5) into the box → border goes error, message `value clamped to 100 (maximum)`; back to 62 → error clears. NumberField/TextInput/Select/etc. with `family` now show the LED via `<Led color={family}>` (identical appearnce to before).
- Headings: SectionHeading (L1) vs ControlPanel title (L2) vs ControlSection (L3) — unchanged look, one ladder.
- ColorField "warm tint": label row now above the swatch; give it `family` to see the LED.

**Notes / for next sessions:**

- **API additions are optional & backward-compatible** (`invalid`, `errorMessage` on the five fields; `family`/`live` gained by ColorField). Breaking change: `Led` `color` is now `FamilyName` — no raw palette/hex strings at type level. Any external consumer passing a CSS var breaks; the only such caller was App.tsx.
- **Clamp notice vs consumer message:** NumberField renders `errorMessage ?? clampNotice` — if both set, the caller's message wins and the clamp notice is suppressed (documented in the Decision Log). A follow-up could compose them; left as-is for simplicity.
- DESIGN.md now documents the Heading Ladder table, error vocabulary, and the ColorField LED row under "Fields".
- Swatch's `tension` API (S4) untouched; `Led` typing had no effect on it.
