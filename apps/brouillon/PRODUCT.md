# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

One primary user: jpotin, the repository owner, alone on a local machine, mid-way through UI work, with the design system open in the editor beside this app.

No collaborators, guests, or external audience were confirmed as users. The wider monorepo describes itself as "documented for collaborators", but that audience belongs to the repository, not to this app.

## Product Purpose

`@repo/brouillon` is a test bench for the shared design system. It renders combinations of UI variants side by side so they can be judged against each other in one screen, in every theme, before a decision is made about what gets promoted into `@repo/ui`.

The job it does is to turn a variant decision — a color, an elevation, a tint combination — from something argued about in code review into something visible. The unit of value is a comparison, not a component demo.

Success means a variant has been seen, judged, and either promoted or rejected. A round of work here that changes nothing in `@repo/ui` was still a valid round, but it is not the intended end state.

## Positioning

The mechanism is filtered cartesian rendering with a declared node count. Where a component page or Storybook shows one component in a curated set of states, this app lets the operator declare the axes of variation and then see the full product, alongside how many nodes that product actually is.

Exhaustiveness plus an honest count of the combinatorial surface is what a neighbouring product could not copy without becoming a different tool. The point is not to browse pleasing examples; it is to keep the design system honest about its own size.

## Operating Context

- Dev-only, never deployed. Started with `vp dev` in `apps/brouillon`; nobody ever opens it at a URL.
- The operator works in one session across the workspace. `packages/ui` is open in the editor; this app is the visual feedback loop for it.
- The repository root README states the ecosystem is "a creative coding playground ... Built for fun, documented for collaborators", and "a playground, not a product". This app inherits that posture: it is an instrument, not a deliverable.
- Engineering conventions are not local to this app. `codex/docs/coding-conventions.md` at the repository root is binding — core/shell separation, explicit state ownership, Zustand as an implementation choice rather than a rule.
- Verification is visual and by eye. There is no visual-regression baseline for this app; a change is verified by running it and looking at it.

## Capabilities and Constraints

Confirmed behavior:

- Theme selection across `light`, `dark`, and `system`, applied through `color-scheme`. **`system` is the default.**
- A component registry (`demos/registry.ts`) selects which component is under test. Currently `button` and `checkbox`.
- A variant filter over six declared axes: color, elevation, background, tint background, tint border, tint shadow. One filter instance is applied independently to the card layer and to the component layer.
- The canvas renders the cartesian product of the card filter and the component filter, and reports the resulting node count inline.

Constraints confirmed as binding:

- **The six filter axes must be preserved.** Do not collapse them into one opaque control, and do not remove a section's ability to reset independently.
- **`system` must remain the default theme.** Do not change the initial theme to `light` or `dark`.

Nothing else about the current surface is a commitment. The card × component cartesian framing, the specific component set, the shell layout, and the panel placement are all changeable. They are the current state of an instrument, not protected structure.

Technical constraints, established by the code:

- React 19 + Vite+ (`vp`) + TypeScript, StyleX for all styling, Zustand for shared UI state, pnpm workspaces with a version catalog.
- The app carries its own local StyleX UI kit at `src/experiments/stylex/ui/`. StyleX tokens are compile-time constants and do not cross the package boundary, so the local kit is a sandbox rather than a fork kept in sync by hand.
- `@repo/ui` is reached only as a stylesheet: `src/styles.css` imports `@repo/ui/src/styles.css` through a relative path into `node_modules`. Every component rendered by the lab is local. Do not assume the two kits are interchangeable.
- No server-data layer, and no request/response state library, unless that requirement actually appears.

Open decisions, deliberately unrecorded:

- Where a variant decision gets captured, if anywhere. State is in-memory today and lost on reload.
- Whether the app should ever gain routing, export, or shareable state.

## Brand Commitments

- Name: `@repo/brouillon`. Its README says "App de dev". No verbal or visual brand commitment has been made for it.
- The repository identifies itself publicly as the work of jpotin. `AGENTS.md` requires French for discussion and English for code, docs, and specs; both apply here.
- No binding aesthetic, palette, typography, or style direction has been stated. The incumbent token set is evidence of what exists, not a confirmed brand.

## Evidence on Hand

Real material that exists and may be relied on:

- Local StyleX layer: `const.stylex.ts` (palette, typography, space, radius, border width, z-index, breakpoints, layout), `tint.stylex.ts`, `surface.stylex.ts`, `typography.stylex.ts`, `styles.stylex.ts`, `interactions.stylex.ts`, `layout.stylex.ts`.
- Local components: `Button`, `Card`, `Checkbox`, `ControlPanel`, `ExperimentShell`, `ShellWrapper`, `Stack`, `Stage`.
- `packages/ui`: a wider set — 27 components, 7 token files, 4 recipe files, `styles.css`, `stylex-preset.ts`. It is the promotion target, not the source of the lab's current rendering.
- `public/favicon.svg`, `public/icons.svg`.

Stated absences that future work must not fabricate:

- No users, testimonials, metrics, or adoption data exist for this app.
- No visual-regression goldens or screenshot fixtures exist; `dist/` is gitignored, so a local build is not a committed reference.
- No product documentation, onboarding, or changelog exists for the app.

## Product Principles

1. **Exhaustiveness over curation.** Show the whole surface, including the parts that look wrong. A filtered-away variant is a variant that has not been decided.
2. **The count is part of the answer.** Naming how large a design system has become is how it stays honest about its own complexity.
3. **Decide in all three themes.** `system` is the default because a variant that only survives one color scheme has not been evaluated.
4. **A test bench is judged by what it changes.** The output is a decision about `@repo/ui`, not a prettier laboratory.
5. **No ceremony for a solo local instrument.** The operator is the only user and already holds the whole context. Optimize for the fastest honest look, not for onboarding a newcomer.

## Accessibility & Inclusion

No accessibility standard or specific requirement was established for this app; its only user is the operator.

Signals that exist in the code and should not be silently dropped when the surface is rebuilt:

- Deliberate minimum control sizing in `const.stylex.ts`: `controlTouchTarget: 44px`, `controlFieldMinHeight: 44px`, `radioOptionMinHeight: 28px`, plus explicit per-control dimensions.
- Semantic labeling already present: `aria-label` on the control panel and each filter section, native `<select>` and `<input type="checkbox">`, and an `aria-hidden` hit-area span in `Checkbox` so the enlarged touch target is not announced.

Any move away from a native control should be checked against these.
