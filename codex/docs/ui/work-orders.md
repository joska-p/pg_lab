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
```

Start every edit by reading `reference/craft-floor.md` (UI quality floor) per the Impeccable skill.

## Current State

| #   | Task                                                                           | Severity | Files                                                              | Status  |
| --- | ------------------------------------------------------------------------------ | -------- | ------------------------------------------------------------------ | ------- |
| S1  | Amber-on-cream contrast (Segmented + RadioGroup)                               | P0       | components/Segmented.tsx, components/RadioGroup.tsx                | pending |
| S2  | Glow merge bug (Toggle, Checkbox) + Button dead focusRing                      | P1       | components/Toggle.tsx, Checkbox.tsx, Button.tsx                    | pending |
| S3  | Glass only when floating (docked panel opaque)                                 | P1       | components/ExperimentShell.tsx, MaterialScene.tsx                  | pending |
| S4  | Retire role-matrix residue (primary, SectionHeading, Swatch)                   | P1/P2    | tokens/colors.stylex.ts, components/SectionHeading.tsx, Swatch.tsx | pending |
| S5  | Pressable parity + touch targets ≥44px                                         | P2       | Toggle, Checkbox, Segmented, RadioGroup, Slider, consts/           | pending |
| S6  | ShellWrapper/Stage ambient washes — **decision task**                          | P1       | components/ShellWrapper.tsx, Stage.tsx                             | pending |
| S7  | P3 batch: geometry, Led typing, ColorField row, error state, heading hierarchy | P3       | multiple (see S7)                                                  | pending |
| S8  | `polish` + re-run `critique` + DESIGN.md sync                                  | —        | interfaces                                                         | pending |

**NEXT: S1.** When a session is in progress, the executing task is marked `in-progress` and the next pending task becomes `NEXT`.

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

| Date       | Session | Decision                                                                             | Impact   |
| ---------- | ------- | ------------------------------------------------------------------------------------ | -------- |
| 2026-09-17 | (plan)  | Session chain uses one task per session, short sessions                              | Workflow |
| 2026-09-17 | (plan)  | ShellWrapper ambience deferred to S6 as a lab-backed decision task (default: reduce) | S6       |

## Handoff Archive

(Newest last. Written at the end of each session by the executing agent.)
