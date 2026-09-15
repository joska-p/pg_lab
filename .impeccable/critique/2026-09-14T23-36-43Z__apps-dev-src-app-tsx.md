---
target: apps/dev/src/App.tsx
total_score: 16
max_score: 24
na_heuristics: 7,9,10
p0_count: 2
p1_count: 2
target_identity: "file:/home/muratha/Dev/dev-container/pg_lab/apps/dev/src/App.tsx"
target_fingerprint: "sha256:6c427d03c30b078db9817e558cd6b14b4165820b1c86dd01ceb8219cace0aad2"
target_path: /home/muratha/Dev/dev-container/pg_lab/apps/dev/src/App.tsx
timestamp: 2026-09-14T23-36-43Z
slug: apps-dev-src-app-tsx
---

# BORDERS & ELEVATION — Combined Design Critique

## Report Header Provenance

Method: dual-agent (A: design review · B: detector+browser evidence)

## Design Health Score (Heuristic Scoring for Border/Elevation System)

| #         | Heuristic                         | Score       | Key Issue                                                                                                  |
| --------- | --------------------------------- | ----------- | ---------------------------------------------------------------------------------------------------------- |
| 1         | Visibility of System Status       | 2           | Borders invisible at rest (1.1:1); no resting state feedback for containment                               |
| 2         | Match System / Real World         | 3           | Elevation metaphors (raised/sunken/floating) correctly modeled; shadow tinting is physical                 |
| 3         | User Control and Freedom          | 3           | Focus rings compose correctly; no trapping                                                                 |
| 4         | Consistency and Standards         | 2           | Border token used universally but calibrated wrong; glass panel border diverges; Segmented chosen diverges |
| 5         | Error Prevention                  | 3           | No error states in scope                                                                                   |
| 6         | Recognition Rather Than Recall    | 2           | Invisible borders remove container affordance; user must recall grouping                                   |
| 7         | Flexibility and Efficiency of Use | n/a         | Not applicable to this showcase surface                                                                    |
| 8         | Aesthetic and Minimalist Design   | 3           | Intent is quiet/minimal; execution is _too_ quiet (absent)                                                 |
| 9         | Error Recovery                    | n/a         | Not applicable                                                                                             |
| 10        | Help and Documentation            | n/a         | Not applicable                                                                                             |
| **Total** |                                   | **16 / 24** | **Rating: Acceptable** (67% → 50%+ Acceptable)                                                             |

_Heuristics 7, 9, 10 scored n/a (showcase surface, not an app flow). Applicable max = 24._

## Design Specificity Verdict

**LLM Assessment (A):** The border/elevation language is _authored for this system_ — the `colors.border` token is a palette-native semi-transparent mix (oklab, Gruvbox keys), not a generic gray. The 5-level elevation ladder with single-tint variable (`shadowColor.color`) is a coherent, craft-level architecture. Glass elevation is first-class with documented rationale. **However**, the calibration ships broken: borders at 1.1:1 contrast are invisible, and the shadow ladder compresses the bottom three levels (rest/raised/hover at 20/24/26% alpha) into perceptual identity on dark surfaces. The _intent_ is specific; the _delivery_ is generic-flat.

**Deterministic Scan (B):** CLI detector returned `[]` (no scannable markup for `.tsx` source). Browser pixel-edge scan confirms: all structural borders render as `#333130` / `#bdae93` hairlines matching the `colors.border` token — semi-transparent, not hard rectangles. Only decorative variant borders (Badge families, Segmented chosen, Checkbox checked) use opaque tokens. No raw `box-shadow` literals outside `shadows.stylex.ts` / `effects.stylex.ts`. One hard-coded `borderWidth: 2` in Button outlined variant.

**Visual Overlays:** Headless captures (1440×2400 desktop, 390×844 mobile) show: Cards, Surface, Stage, ExperimentShell panel all framed by quiet hairlines. Floating glass panel translucent with 24px blur over Stage gradients. Elevation ladder: `flat` = border only; `raised`/`hover` indistinguishable from flat in dark mode; `floating` visibly separated; `sunken` (inset) visible on inputs; `glass` legible. Focus rings compose onto rest elevation correctly.

**Agreement:** Both assessments confirm the same root cause — border opacity and shadow alpha spacing are miscalibrated for dark mode. Detector caught the Button hard-coded `borderWidth: 2` that the LLM review missed.

## Overall Impression

A **senior architecture with junior calibration**. The border/elevation system has all the right structural decisions: palette-native transparent tokens, single-tint shadow variable, orthogonal glow, five-level ladder, glass as first-class elevation. But the _numbers_ ship invisible: 1.1:1 borders, compressed shadow alphas. The page reads as a flat list despite rich elevation code. Fix the two P0 calibrations (border opacity, shadow ladder spacing) and this becomes a reference-grade system.

## What's Working

1. **Single-tint shadow architecture** (`shadowColor.color` + `color-mix` in `shadows.stylex.ts:26-31`). Every surface opts in by setting one variable; shadows inherit hue automatically. No per-component shadow maps. This is craft.

2. **Glass elevation as a first-class citizen** (`effects.stylex.ts:71-76` + comments L58-69). Translucent fill (45% bg), strong backdrop blur (24px + saturate), tinted border (12% foreground), floating cast shadow. Documented _why_ it exists (floating over backdrop only) and _why_ it deepened from 30%→45%. Rare clarity.

3. **Glow orthogonality & focus-ring composition** (`effects.stylex.ts:46-52`). `pressable` focus-visible _composes_ ring onto rest shadow (`shadows.rest, 0 0 0 2px bg, 0 0 0 3px ring`) instead of replacing it. Preserves elevation during keyboard focus — a subtle but critical UX detail often botched.

## Priority Issues

### [P0] Universal border opacity — `tokens.stylex.ts:93` (`colors.border`)

**Why:** 1.1:1 contrast vs card/page makes _every_ structural border (Card, Surface, Stage, Input, Toggle, Segmented, Swatch, Checkbox, RadioGroup, Readout, Badge base, ExperimentShell panel) invisible at rest. The "quiet" intent ships as "absent." Users lose container affordance and grouping cues.
**Fix:** Raise opacity: light `light3 75%`, dark `dark2 70%`. Target ~1.4:1 vs card, ~1.6:1 vs page. Keep oklab mix.
**Suggested command:** `$impeccable colorize` (adjust border token opacity) → `$impeccable audit` (verify contrast)

### [P0] Shadow ladder compression — `shadows.stylex.ts:26-30` (`rest`/`raised`/`hover` alphas 20/24/26%)

**Why:** Three elevation levels collapse to indistinguishable on dark surfaces. `raised` cards/panels don't lift; `hover` on pressables doesn't deepen; `rest` elevation on interactive elements is invisible. Only `floating` (30%+22%) and `sunken` (88% inset highlight) create readable depth.
**Fix:** Re-space alphas: `rest 18%`, `raised 30%`, `hover 36%`, `floating 45%+30%`. Keep `sunken` inset highlight at 88%.
**Suggested command:** `$impeccable colorize` (adjust shadow alphas) → `$impeccable audit`

### [P1] Floating panel border inconsistency — `ExperimentShell.tsx:51-53` vs `:153`

**Why:** Docked panel gets 50% `dark2` border (`colors.border`); floating gets 12% `foreground` border (`effects.glass:L74`). Different visual language for same component in two placements. Floating panel border nearly invisible over Stage gradients.
**Fix:** Unify: floating panel should keep `colors.border`. Remove `borderColor` from `effects.glass` (L74) — let base border win.
**Suggested command:** `$impeccable layout` (panel border parity)

### [P1] Stage border lost in gradient — `Stage.tsx:17-19`

**Why:** Stage has 4 radial gradients + linear gradient + noise. A 1.1:1 border disappears into gradient noise. Stage reads as unbounded canvas, not a framed workspace.
**Fix:** Either (a) give Stage a subtle `boxShadow: shadows.raised` (tinted to `background`) instead of border, or (b) add 1px inner highlight (`inset 0 1px 0 color-mix(white 15%)`) that survives gradients.
**Suggested command:** `$impeccable layout` (Stage framing)

### [P2] Interactive border fidelity — Segmented chosen muted — `Segmented.tsx:60-64`

**Why:** `chosenMuted` uses `mutedForeground` border (bright #BDB9A6 on dark muted #3A3A3A) with no fill. Reads as "selected = bright outline" not "selected = filled." Diverges from Slider fill / Radio dot model.
**Fix:** For muted chosen: `backgroundColor: colors.mutedForeground` (fill) + `color: colors.background` (text). Border transparent.
**Suggested command:** `$impeccable harden` (interactive state consistency)

### [P3] Glass panel shadow too heavy — `effects.stylex.ts:71-76`

**Why:** `glass` composes `shadows.floating` (30%+22% of `card` color ≈ #515151). Dark halo on dark stage muddies the glass edge. Glass depth should come from blur, not cast shadow.
**Fix:** Glass shadow = `color-mix(in oklab, ${shadowColor.color} 18%, transparent)` (half of floating) or dedicated `glassShadow` token.
**Suggested command:** `$impeccable quieter` (glass shadow)

### [P3] Card `sunken` variant missing inset shadow — `Card.tsx:36-40` + `effects.sunken`

**Why:** `Card` variant `sunken` changes bg to `muted` and `shadowColor.color: colors.muted` but `variantEffects.sunken = effects.sunken` (which IS the inset). Need to verify visually if the inset highlight (88% ambient) reads on `muted` bg.
**Fix:** Verify in browser; if inset not visible, strengthen ambient mix or add explicit `boxShadow: effects.sunken` to variant.
**Suggested command:** `$impeccable audit` (verify sunken Card)

## Persona Red Flags

### Alex (Power User) — Dashboard / Data-heavy

- **Red flag:** Invisible borders on Cards/Surfaces mean Alex can't scan group boundaries at a glance. Must hover/inspect to discover containment.
- **Red flag:** Compressed shadow ladder — `raised` cards don't lift, so "promoted" content doesn't visually promote. Alex loses the "lift = priority" affordance.

### Sam (Accessibility-Dependent) — Keyboard + Screen Reader

- **Red flag:** Focus rings compose correctly (good), but resting borders invisible means the _transition_ from "no border" to "ring" is the only visual cue. If border opacity fixes (P0), the ring-on-border composition must be re-verified for 3:1 contrast on the border itself.
- **Note:** `sunken` inset on inputs is visible (88% highlight) — good non-color cue for focus/active well state.

### Riley (Stress Tester) — Edge Cases

- **Red flag:** Glass panel over Stage gradients — at 45% `background` opacity with 24px blur, text contrast is ~12:1 (excellent), but the `floating` shadow casts a dark halo that _reduces_ perceived edge clarity over dark gradient regions.
- **Red flag:** Segmented `chosenMuted` bright border on dark muted well — high contrast but wrong metaphor (outline vs fill). Stress test: rapid selection toggling produces flashing bright outlines.

## Minor Observations

1. **Button outlined variant** (`Button.tsx:43-45`): hard-coded `borderWidth: 2` instead of `borderWidth.hairline` or a const. Inconsistent with token system.
2. **Toggle focus border** (`Toggle.tsx:55`): uses `colors.muted` (opaque) for focus — diverges from focus-ring pattern used elsewhere. Should use `interactive.focusRing` or `colors.ring`.
3. **Slider track** (`Slider.tsx:69`): uses `shadows.sunken` (inset) on `colors.muted` bg — correct well metaphor, no border needed. Good.
4. **Surface `glow` prop** (`Surface.tsx:108,151,158`): correctly applies `effects.glowSubtle` to a dot indicator, not the surface border. Glow stays orthogonal.

## Questions to Consider

1. **Is "quiet border" the right default for _inputs_?** Text fields are _recesses_ — they want an inner shadow (sunken), not a hairline. The current `colors.border` on `colors.input` serves neither. Should inputs drop the border entirely and rely solely on `shadows.sunken` (which is visible)? The `fieldFocus` rest state already does this.

2. **Should `raised` elevation be _tinted by the surface_ or _neutral_?** Current: `shadowColor.color = surface bg` → dark card casts dark shadow on dark bg (invisible). Alternative: `shadowColor.color = neutral dark` (e.g., `dark0`) for all elevations — shadows become ambient occlusion, not colored light. Would fix dark-mode ladder compression but lose the "tinted cast" craft. Which serves the brand?

3. **Does the Stage _need_ a border?** Stage is a "canvas" — its gradient background _is_ the boundary. A hairline border on a gradient is visual noise. Consider: `borderWidth: 0`, `boxShadow: shadows.raised` (tinted to `background`) — a soft vignette that frames without a line. Would that feel more "canvas" and less "card"?

## Run Notes

- Target slug: `apps-dev-src-app-tsx`
- Ignore list: none (no `.impeccable/critique/ignore.md`)
- Assessment independence: dual-agent, no cross-contamination
- CLI detector: exit 0, `[]` findings (expected for .tsx source)
- Browser visibility: headless Chrome captures at 1440×2400 (desktop) + 390×844 (mobile)
- Overlay injection: skipped (detector doesn't inject on source files; visual evidence via screenshots)
- Live server: started on :5199, stopped after captures
- Temp files: `/tmp/opencode/b-full-default.png`, `/tmp/opencode/b-mobile-390.png`, `/tmp/opencode/border_scan.py` — cleanup pending
