# @repo/ui

A small, composable, StyleX-powered UI toolkit for creative mini-apps. Canvas-first:
scaffolding stays visually secondary to the work surface.

Canonical docs (the code is the deep truth; these record what the code cannot say):

- **[DESIGN.md](DESIGN.md)** — the visual language (named rules, hierarchy, elevation, do/don'ts). Sole visual authority.
- **[PRODUCT.md](PRODUCT.md)** — product truth (purpose, users, scope, principles).
- **[`codex/docs/component-authoring.md`](../../codex/docs/component-authoring.md)** — how to add a component, token, or variant.
- **[`codex/docs/ui-setup.md`](../../codex/docs/ui-setup.md)** — how the library is distributed to apps and how to scaffold one.
- **[`codex/docs/coding-conventions.md`](../../codex/docs/coding-conventions.md)** — repo-wide conventions (ownership, state, lifecycle).

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
