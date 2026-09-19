# @repo/ui

A small, composable, StyleX-powered UI toolkit for creative mini-apps ("The Terminal Atelier"). Canvas-first:
scaffolding stays visually secondary to the work surface.

Canonical docs (the code is the deep truth; these record what the code cannot say):

- **[`codex/docs/ui-setup.md`](../../codex/docs/ui-setup.md)** — how the library is distributed to apps and how to scaffold one (source imports, `.stylex` subpath rule).
- **[`codex/docs/coding-conventions.md`](../../codex/docs/coding-conventions.md)** — repo-wide conventions (ownership, state, lifecycle).

## Composition

Official shell & canvas hierarchy:

```text
ShellWrapper
└─ ExperimentShell
   ├─ Stage (canvas) — flex: 1, the visual star
   └─ ControlPanel — docked or floating (glass)
      └─ ControlSection → widget
```

## StyleX Setup

Setup contract lives in `ui-setup.md` (source distribution, shared `stylexPreset`, per-app compilation with `unplugin-stylex`). Official docs: <https://stylexjs.com>.
