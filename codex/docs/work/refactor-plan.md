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

## 2.1 Clean Input Components

Inspect:

- `TextInput.tsx`
- `NumberField.tsx`
- `TextArea.tsx`
- `Select.tsx`

Remove automatic prototype/demo decorations such as:

```tsx
<Badge>{family}</Badge>
```

or equivalent hardcoded family labels.

The toolkit component should not assume that the family name should be rendered as visible text.

Before preserving or changing the `family` prop, inspect its actual consumers and determine what semantic role it has.

If `family` represents a legitimate visual identity for the control, preserve that behavior.

If the identity/tagging is actually an application-level concern, prefer external composition rather than introducing another internal presentation prop.

Do not automatically introduce a new `tag` API unless current usage demonstrates that it is needed.

## 2.2 Clean RadioGroup & Segmented

Inspect:

- `RadioGroup.tsx`
- `Segmented.tsx`

Ensure they consume the finalized family/token model.

Remove runtime dynamic styling where a static StyleX variant or CSS-variable-based approach is more appropriate.

Do not introduce generic abstractions solely to share implementation details.

## 2.3 Verification

Run:

```text
vp check
```

Verify the relevant `apps/dev` showcase and laboratory views.

Confirm that:

- inputs render without automatic prototype badges;
- existing visual identity remains intact;
- keyboard/accessibility behavior is preserved.

Record notes before finishing.

---

# Session 3: Surface, Stage & Layout Modernization

**Goal:** Remove the accidental complexity around `Surface`, clarify layout responsibilities, and preserve the existing visual presentation.

## 3.1 Deconstruct `Surface.tsx`

First inspect:

- all `Surface` consumers;
- what each prop is actually used for;
- `Card`;
- `MaterialScene`;
- the elevation showcase;
- synth/canvas usage;
- related layout primitives.

Do **not** assume that `Surface` must survive as a component.

The goal is to determine its legitimate semantic role.

In particular remove:

- runtime JS style-object creation;
- `as StyleXStyles` casts;
- dynamic style generation for static variants;
- rendering branches where a prop changes the entire renderer.

If `Surface` has no clear remaining semantic role, **retire it**.

Do not replace it with another generic `Surface`-like abstraction merely to preserve the old API.

Prefer the smallest set of existing concepts that actually describe the use cases, such as:

- `Card` for standard containment;
- `MaterialScene` (or a clearly named equivalent) for the material/3D scene;
- local composition in `apps/dev` for showcase-specific presentation.

If a simplified `Surface` genuinely has a useful semantic role after inspecting consumers, keep only that role.

## 3.2 Clean `Stage` and `ShellWrapper`

Inspect whether these components are reusable toolkit primitives or application-specific presentation shells.

Preserve their existing visual appearance.

Do not remove:

- layered gradients;
- noise;
- artistic backgrounds;
- visual effects

merely because they are not generic.

Instead determine whether those effects belong:

- inside the reusable primitive,
- in an app-level wrapper,
- or in the application composition.

The goal is to separate **visual design from architectural ownership**, not to remove the visual design.

Replace legacy color-system dependencies only when the replacement is clearly established.

## 3.3 Update `apps/dev` Showcases

Update:

- `apps/dev/src/App.tsx`
- `apps/dev/src/lab/laboratory.tsx`
- other affected consumers

to use the cleaned component APIs.

Keep showcase-specific composition in the application where appropriate.

Do not introduce new toolkit components solely to make the showcase code shorter.

## 3.4 Verification

Run:

```text
vp check
```

Then visually inspect `apps/dev`.

Verify:

- dark mode;
- light mode;
- background gradients;
- noise layers;
- elevation visuals;
- material/scene visuals;
- synth canvas;
- interaction states.

The refactor must preserve the intended visual experience.

Record notes before finishing.

---

# Session 4: Dismantle Legacy 6-Role Matrix

**Goal:** Remove the legacy color/intent matrix after all consumers have been migrated.

## 4.1 Inventory Before Deletion

Before deleting anything, search the entire repository for consumers of:

- `colorVariants.stylex.ts`
- `foundations/surface.stylex.ts`
- `colorIntents`
- `intentFills`
- `intentBorders`
- `intents/hover.stylex.ts`
- `intentHovers`

Do not delete a legacy file while it still has unresolved consumers.

## 4.2 Migrate Remaining Consumers

Migrate each consumer to the finalized model:

- `tokens/colors.stylex.ts`
- `tokens/families.stylex.ts`
- or another already-established semantic token when appropriate.

Do not create a new compatibility layer merely to avoid changing consumers.

Once all consumers have been migrated, remove:

- `packages/ui/src/tokens/colorVariants.stylex.ts`
- `packages/ui/src/foundations/surface.stylex.ts`
- `packages/ui/src/intents/hover.stylex.ts`

Update:

`packages/ui/src/index.ts`

and any package exports.

## 4.3 Verify the Layering

After migration, verify that the resulting dependency direction is approximately:

```text
Components
    │
    ├── Foundations
    │
    └── Effects
          │
          ▼
       Tokens
          │
          ▼
       Consts
```

Do not force every file into this diagram if doing so creates unnecessary indirection. The purpose is to keep the conceptual dependency direction understandable.

## 4.4 Verification

Run:

```text
vp check
```

Then:

```text
uv run --no-project python scripts/audit_contrast.py
```

Ensure:

- no legacy imports remain;
- no compatibility bridge remains accidentally;
- contrast requirements pass.

Record notes before finishing.

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
