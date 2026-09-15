# @repo/ui

A small, composable, StyleX-powered UI toolkit for creative mini-apps. Canvas-first:
scaffolding stays visually secondary to the work surface.

Canonical docs (the code is the deep truth; these record what the code cannot say):

- **[DESIGN.md](DESIGN.md)** — the visual contract and sole visual authority (named rules, vocabulary, hierarchy, material, do/don'ts).
- **[PRODUCT.md](PRODUCT.md)** — product truth (purpose, users, scope, principles, direction).
- **[`codex/docs/component-authoring.md`](../../codex/docs/component-authoring.md)** — how to add a component and where each value belongs (local vs shared vs token).
- **[`codex/docs/ui-setup.md`](../../codex/docs/ui-setup.md)** — how the library is distributed to apps and how to scaffold one (source imports, `.stylex` subpath rule).
- **[`codex/docs/coding-conventions.md`](../../codex/docs/coding-conventions.md)** — repo-wide conventions (ownership, state, lifecycle).

**Direction evidence:** `apps/dev`'s _visual laboratory_ view renders the current
system next to the contract's experimental vocabulary (families, matte keys,
LED marks, contact hue, light/glass under-over) — app-local, no API changes.

## Composition

Official hierarchy: `Page > Stack > Card > ControlSection > widget`.

- Variant props are named `variant` everywhere; `Stack` takes string tokens
  (`direction="vertical"`, `gap="3"` backed by `space`).
- Small components + composition + simple APIs; prefer a local solution until a
  real second consumer appears. Extend the palette only through derived tokens
  in the theme layer, never raw values in components.
- Scope (Phase A): layout, instrument and showcase components all live here —
  including `Page`, `Text`, `SectionHeading`, `Swatch`, `Readout`, `Badge`.
  No vitrine vs toolkit split.

## StyleX

Setup contract lives in `ui-setup.md` (source distribution, shared `stylexPreset`,
per-app compilation). Official docs: <https://stylexjs.com>.
