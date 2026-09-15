# @repo/ui

A small, composable, StyleX-powered UI toolkit for creative mini-apps ("The Terminal Atelier"). Canvas-first:
scaffolding stays visually secondary to the work surface.

Canonical docs (the code is the deep truth; these record what the code cannot say):

- **[DESIGN.md](DESIGN.md)** — the visual contract and sole visual authority (named rules, vocabulary, hierarchy, material, do/don'ts).
- **[PRODUCT.md](PRODUCT.md)** — product truth (purpose, users, scope, principles, direction).
- **[`codex/docs/component-authoring.md`](../../codex/docs/component-authoring.md)** — how to add a component and where each value belongs (local vs shared vs token).
- **[`codex/docs/ui-setup.md`](../../codex/docs/ui-setup.md)** — how the library is distributed to apps and how to scaffold one (source imports, `.stylex` subpath rule).
- **[`codex/docs/coding-conventions.md`](../../codex/docs/coding-conventions.md)** — repo-wide conventions (ownership, state, lifecycle).

## Architecture & Layers

The toolkit enforces a strict one-way dependency flow:

```text
Components / Apps
       ↓
Foundations & Effects & Intents
       ↓
     Tokens
       ↓
     Consts
```

- **Tokens (`tokens/*.stylex.ts`):** Theme-dependent values defined via `stylex.defineVars` with `light-dark()` pairs (`colors`, `families`, `shadows`).
- **Consts (`consts/*.stylex.ts`):** Immutable, non-themeable constants defined via `stylex.defineConsts` (`gruvbox-palette`, `spacing`, `radius`, `typography`, `motion`, `borderWidth`, `breakpoints`, `zIndex`, `interaction`, `effects`, `layout`).
- **Foundations (`foundations/*.stylex.ts`):** State-free base styles (`field`, `interaction`, `text`).
- **Effects (`effects/*.stylex.ts`):** Orthogonal visual styles (`elevation`, `glass`, `glow`).
- **Intents (`intents/*.stylex.ts`):** Interaction and state styles (`focusRing`, `disabledStyle`, `pressable`).
- **Components (`components/*.tsx`):** Instrument widgets, layout primitives, and display elements.

## Composition

Official shell & canvas hierarchy:

```text
ShellWrapper
└─ ExperimentShell
   ├─ Stage (canvas) — flex: 1, the visual star
   └─ ControlPanel — docked or floating (glass)
      └─ ControlSection → widget
```

- **Containment & Flow:** `Card` (surface, glass, raised, sunken) and `Stack` (`direction`, `gap`, `justify`).
- **Instrument Controls:** `Button`, `Slider`, `Toggle`, `Checkbox`, `RadioGroup`, `Segmented`, `Select`, `TextInput`, `NumberField`, `TextArea`, `ColorField`.
- **Display & Identity:** `Led`, `Badge`, `Readout`, `SectionHeading`, `Text`, `Swatch`, `MaterialScene`.

## StyleX Setup

Setup contract lives in `ui-setup.md` (source distribution, shared `stylexPreset`, per-app compilation with `unplugin-stylex`). Official docs: <https://stylexjs.com>.
