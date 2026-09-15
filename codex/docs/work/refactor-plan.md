# Refactor Execution Plan: @repo/ui Architecture & StyleX Cleanup

> **Instructions for the Agent**
>
> 1. Read this document, `packages/ui/DESIGN.md`, `codex/docs/component-authoring.md`, and `codex/docs/ui-setup.md` at the start of every session.
> 2. Execute **only ONE session per conversation**. Do not jump ahead to later sessions.
> 3. Before changing anything, inspect the current implementation and all relevant consumers for the current session. Do not rely solely on this plan or the previous audit.
> 4. Treat the previous refactor audit as useful evidence, not as an unquestionable specification. If the current code contradicts the audit, investigate and explain the discrepancy.
> 5. Prefer **deletion and simplification over replacement abstractions**. Do not introduce a new abstraction merely to preserve an old API.
> 6. This is a **cleanup/refactoring plan, not a redesign plan**. Preserve the existing visual language and good architectural decisions unless there is a concrete reason to change them.
> 7. Verify all changes after each session with `vp check` at the repository root.
> 8. Update the task checkboxes in this file (`[ ]` -> `[x]`) and record concise notes before finishing your session.

---

## Operating Rules & Constraints

### StyleX Idioms

- Do not create runtime style objects and cast them as `StyleXStyles`.
- Do not use dynamic style functions when the variation is a finite/static set of variants.
- Prefer statically declared StyleX styles and composition.
- Use CSS variables / `stylex.defineVars` where runtime theming or scoped values are actually required.
- Do not treat `StyleXStyles` as a generic runtime CSS object.
- Do not "fix" StyleX typing with casts such as `as StyleXStyles`.
- Preserve existing idiomatic StyleX patterns when they are already correct, such as scoped CSS-variable overrides.

### Visual Continuity

Preserve the visual appearance of `apps/dev`.

In particular, refactoring architecture must **not accidentally remove or simplify away the existing visual language**, including the layered gradients/noise/effects currently provided by:

- `ShellWrapper`
- `Stage`
- `ExperimentShell`

If those visual effects belong at the application level rather than in reusable toolkit primitives, move their responsibility rather than deleting the visual treatment.

### Single Source of Truth

- `consts/gruvbox-palette.stylex.ts` is the source of the immutable palette.
- Theme-dependent values should use CSS variables in `tokens/`.
- Do not maintain parallel color systems that represent the same semantic concepts.
- Before moving `families`, verify whether it genuinely belongs in `tokens/` as a CSS-variable-based theme token or should remain a compile-time constant. The fact that it currently uses `defineVars` is evidence, not by itself a reason to move it.

### Anatomy & Composition

- Components should own their own internal anatomy and layout.
- Components should not contain application/demo-specific presentation.
- Do not automatically render prototype badges or other demo-only decorations.
- Prefer composition over adding props for unrelated presentation concerns.
- A shared component should exist because it represents a meaningful semantic concept, not merely because two things share some CSS.

### Simplicity

> **Prefer the smallest abstraction that makes the current usage clear.**

Do not optimize for hypothetical future consumers.

When deciding whether to preserve or introduce an abstraction, ask:

> "Does the current application actually need this abstraction?"

rather than:

> "Could a future application need this?"

If an existing abstraction has no clear semantic role, prefer removing it over replacing it with a smaller-looking abstraction that serves the same purpose.

---

# Session Roadmap

## Session 1: Tokens, Consts & Component Relocations

**Goal:** Clarify the boundary between `consts` and `tokens`, relocate misplaced components, and remove unnecessary metric indirection.

### 1.1 Review and Formalize `families` [x]

- [x] Inspected all consumers of `families`.
- [x] Confirmed that `families` represents theme-dependent values (`light-dark()`) that require CSS variables / `defineVars`.
- [x] Relocated to `packages/ui/src/tokens/families.stylex.ts`.
- [x] Updated all imports across components and barrel export in `packages/ui/src/index.ts`.
- [x] Removed old `consts/families.stylex.ts`.

### 1.2 Move `Led` [x]

- [x] Relocated `packages/ui/src/intents/led.stylex.tsx` to `packages/ui/src/components/Led.tsx`.
- [x] Updated all component imports to `./Led`.
- [x] Updated barrel exports in `packages/ui/src/index.ts` to export `Led` and `LedProps` under Components.
- [x] Removed old `intents/led.stylex.tsx`.

### 1.3 Co-locate Widget Geometry [x]

- [x] Inspected `packages/ui/src/consts/controls.stylex.ts`.
- [x] Inlined private widget geometry metrics into `Toggle.tsx`, `Button.tsx`, `Badge.tsx`, `Slider.tsx`, `Checkbox.tsx`, `RadioGroup.tsx`, `Segmented.tsx`, `Select.tsx`, `ColorField.tsx`, `Led.tsx`, `SectionHeading.tsx`, `Surface.tsx`, and `apps/dev/src/lab/experimental.tsx`.
- [x] Removed `controls` export from `packages/ui/src/index.ts`.
- [x] Removed `packages/ui/src/consts/controls.stylex.ts`.

### 1.4 Verification [x]

- [x] Ran `vp check` at repository root (all formatting, linting, type-checking pass with zero errors).
- [x] Built `@repo/ui` (`vp pack`) and `apps/dev` (`vp -C apps/dev build`) to ensure clean StyleX compilation and CSS emission.

**Session 1 Notes:**

- `families` was formalized as a token set in `tokens/families.stylex.ts` because it generates dynamic `light-dark()` CSS variables.
- `Led` is now in `components/Led.tsx`.
- `controls.stylex.ts` was eliminated, and all private control dimensions were co-located into their respective component definitions.

---

# Session 2: Form Controls & Input Primitives Cleanup

**Goal:** Remove prototype leakage from form controls and clarify their actual APIs.

### 2.1 Clean Input Components [x]

- [x] Inspected `TextInput.tsx`, `NumberField.tsx`, `TextArea.tsx`, and `Select.tsx`.
- [x] Removed automatic prototype badge decorations (`<Badge>{family}</Badge>`) and unused `Badge` imports.
- [x] Preserved `family` prop for data identity via the `Led` indicator in the label row without injecting hardcoded family text.

### 2.2 Clean RadioGroup & Segmented [x]

- [x] Inspected `RadioGroup.tsx` and `Segmented.tsx`.
- [x] Migrated from runtime dynamic style functions (`activeIntent.fill(fam.base)`, `styles.chosen(fam.base)`) to statically declared StyleX variants (`circleChosenVariants`, `chosenVariants`) powered by `familiesConsts`.
- [x] Preserved full keyboard navigation (arrows) and ARIA radiogroup / radio semantics.

### 2.3 Verification [x]

- [x] Ran `vp check` at repository root (0 format, lint, or type errors).
- [x] Built `@repo/ui` (`vp -C packages/ui pack`) and `apps/dev` (`vp -C apps/dev build`) with zero StyleX compiler issues and verified atomic CSS emission.
- [x] Verified contrast audit (`uv run --no-project python scripts/audit_contrast.py`).

**Session 2 Notes:**

- Prototype leakage `<Badge>{family}</Badge>` was removed from all four input primitives (`TextInput`, `NumberField`, `TextArea`, `Select`).
- `RadioGroup` and `Segmented` now declare static compile-time StyleX variants for all 7 palette families rather than calling runtime dynamic style functions.
- Visual identity, keyboard accessibility, and component APIs remain fully intact.

---

# Session 3: Surface, Stage & Layout Modernization

**Goal:** Remove the accidental complexity around `Surface`, clarify layout responsibilities, and preserve the existing visual presentation.

### 3.1 Deconstruct and Retire `Surface.tsx` [x]

- [x] Inspected all consumers of `Surface`, `Card`, `MaterialScene`, and layout primitives.
- [x] Confirmed `Surface` was an overloaded chameleon component with runtime JS style objects, `as StyleXStyles` casts, and renderer branch switching.
- [x] Retired `Surface.tsx` from `@repo/ui` and removed its exports and unused layout metrics (`surfaceMinHeight`, `surfaceFlex`).
- [x] Maintained `Card` for containment and `MaterialScene` for the under/over light+glass presentation.

### 3.2 Clean `Stage`, `ShellWrapper`, `Card`, and `Text` [x]

- [x] Inspected `Stage.tsx`, `ShellWrapper.tsx`, `ExperimentShell.tsx`, `Card.tsx`, and `Text.tsx`.
- [x] Migrated all background/surface/text styles to use canonical semantic tokens (`colors.*`) directly rather than legacy `colorVariants`.
- [x] Preserved full visual design: layered radial gradients, SVG fractal noise, background blend modes, and dark/light color-scheme fidelity.

### 3.3 Update `apps/dev` Showcases [x]

- [x] Refactored elevation showcase and synth canvas in `apps/dev/src/App.tsx` using local static StyleX styles and semantic tokens.
- [x] Updated Study 05 in `apps/dev/src/lab/laboratory.tsx` to remove `Surface` dependency.

### 3.4 Verification [x]

- [x] Ran `vp check` at repository root (0 format, lint, or type errors across workspace).
- [x] Built `@repo/ui` (`vp -C packages/ui pack`) and `apps/dev` (`vp -C apps/dev build`) to ensure clean StyleX extraction and atomic CSS bundling.
- [x] Ran contrast audit (`uv run --no-project python scripts/audit_contrast.py`).

**Session 3 Notes:**

- `Surface.tsx` has been retired. Showcase-specific grids and canvases compose local StyleX styles, while `Card` and `MaterialScene` provide clean, dedicated toolkit primitives.
- `Stage`, `ShellWrapper`, `Card`, and `Text` now consume `colors` tokens directly instead of `colorVariants`, while retaining full visual styling and layered effects.
- No runtime style object creation or `as StyleXStyles` casts remain in `@repo/ui`.

---

# Session 4: Dismantle Legacy 6-Role Matrix

**Goal:** Remove the legacy color/intent matrix after all consumers have been migrated.

### 4.1 Inventory and Migrate Consumers [x]

- [x] Inspected the entire repository for references to `colorVariants.stylex.ts`, `foundations/surface.stylex.ts`, `intents/hover.stylex.ts`, `colorIntents`, `intentFills`, `intentBorders`, and `intentHovers`.
- [x] Migrated remaining consumers in `apps/dev/src/lab/experimental.tsx` and `apps/dev/src/lab/laboratory.tsx` from `colorVariants.mutedFg` to `colors.mutedForeground`.
- [x] Cleaned up legacy matrix references and comments in `packages/ui/src/tokens/colors.stylex.ts` and `packages/ui/src/effects/glow.stylex.ts`.

### 4.2 Retire Legacy Matrix Files and Update Exports [x]

- [x] Deleted `packages/ui/src/tokens/colorVariants.stylex.ts`.
- [x] Deleted `packages/ui/src/foundations/surface.stylex.ts`.
- [x] Deleted `packages/ui/src/intents/hover.stylex.ts`.
- [x] Updated `packages/ui/src/index.ts` to remove `colorVariants`, `colorIntents`, `intentFills`, `intentBorders`, and `intentHovers` exports.

### 4.3 Verify Architecture Layering [x]

- [x] Verified clear one-way dependency flow: `Components / Apps -> Foundations & Effects & Intents -> Tokens -> Consts`.
- [x] Confirmed zero lingering compatibility shims, runtime style objects, or dead matrix references.

### 4.4 Verification [x]

- [x] Ran `vp check` at repository root (0 formatting, linting, or type errors across workspace).
- [x] Built `@repo/ui` (`vp -C packages/ui pack`) and `apps/dev` (`vp -C apps/dev build`) with zero compiler warnings and verified atomic CSS emission.
- [x] Ran contrast audit (`uv run --no-project python scripts/audit_contrast.py`).

**Session 4 Notes:**

- The legacy 6-role matrix (`colorVariants.stylex.ts`, `foundations/surface.stylex.ts`, and `intents/hover.stylex.ts`) has been completely dismantled and removed.
- All former consumers use canonical semantic tokens (`colors.*`) and static family tokens (`families.*`) directly.
- Package entry points and barrel exports in `packages/ui/src/index.ts` are streamlined with zero legacy matrix artifacts remaining.

---

# Session 5: Documentation, Polish & Final Validation

**Goal:** Synchronize documentation with the final architecture and perform full validation.

## 5.1 Update Canonical Documentation

Update:

- `codex/docs/component-authoring.md`
- `packages/ui/README.md`
- `packages/ui/DESIGN.md`

Document the finalized architecture, particularly:

- StyleX usage conventions;
- token vs const boundaries;
- family tokens;
- component composition;
- effects;
- removal of the legacy color matrix;
- where application-specific visual composition belongs.

Archive or update:

- `codex/docs/archive/refactor-phase-a.md`
- `codex/docs/archive/migration-status.md`

Do not document abstractions that were removed during the refactor.

The documentation should describe the architecture that actually exists, not the architecture we originally intended to build.

## 5.2 Final Validation

Run:

```text
vp check
```

across the workspace.

Run:

```text
vp test
```

across the workspace.

Build `apps/dev` using the production build path.

Verify that StyleX compilation produces the expected output and that no runtime style fallback or compilation issue has been introduced.

Perform a final review for:

- unnecessary abstractions;
- dead files;
- dead exports;
- stale imports;
- duplicate sources of truth;
- compatibility bridges;
- unnecessary constants;
- runtime style generation;
- `StyleXStyles` casts;
- application-specific presentation leaking into reusable components.

The final objective is not maximum abstraction.

It is a toolkit whose architecture is **small, explicit, composable, and easy to reason about**.
