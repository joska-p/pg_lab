# GLOSSARY.md Format

PG_LAB keeps a single glossary at `codex/docs/GLOSSARY.md`. It is the source of truth for project vocabulary (conventions §2.1.8). Entries are written in English, even when the discussion happens in French.

## Structure

```md
# PG_LAB

One or two sentences describing what this playground is and why these words matter.

## Language

### Playground shell

**Experiment**:
A registered, lazily loaded creative coding package that can be opened in the playground shell.
_Avoid_: App, project, demo

**Scene**:
The component contributed by an Experiment and rendered in the Stage.
_Avoid_: Canvas, render target, artwork

### Rendering

**Frame**:
One image produced by a Surface for a given clock value.
_Avoid_: tick, pass
_Range_: nonnegative integer
```

> The entries above are illustrative only. Confirm every definition against the code before writing it, and follow the session plan in `_TMP/glossary/PLAN.md`.

## Rules

- **Be opinionated.** When multiple words exist for the same concept, pick the best one and list the others under `_Avoid_`.
- **Keep definitions tight.** One or two sentences max. Define what it IS, not what it does.
- **Record distinctions and measurements.** Add a short sentence for near-synonyms that are genuinely different concepts. Add `_Unit_` or `_Range_` when a numeric name carries a unit or a bounded domain that is not obvious.
- **Only include terms specific to PG_LAB's context.** General programming concepts (timeouts, error types, utility patterns, stores, hooks) don't belong even if the project uses them extensively. Before adding a term, ask: is this a concept unique to this playground, or a general programming concept? Only the former belongs.
- **Group terms under subheadings** when natural clusters emerge (shell, rendering, creative concepts). A flat list is fine for a small glossary.
- **No implementation details.** Do not record file names, library choices, TODOs, or decisions here; those belong in the conventions or in an ADR.
- **Create the file lazily.** Do not add an empty `GLOSSARY.md` just to have one.

## Single vs multi-context repos

**Single context (PG_LAB today):** one `codex/docs/GLOSSARY.md` with subheadings.

**Multiple contexts (only if genuinely needed):** a `codex/docs/GLOSSARY-MAP.md` at the same level lists the contexts, where they live, and how they relate:

```md
# Glossary Map

## Contexts

- [Shell](./shell/GLOSSARY.md): registry and layout of experiments
- [Rendering](./rendering/GLOSSARY.md): surfaces, cameras and frames

## Relationships

- **Shell → Rendering**: a Scene draws into a Stage backed by a Surface
```

The skill infers which structure applies:

- If `codex/docs/GLOSSARY-MAP.md` exists, read it to find contexts.
- Otherwise, treat `codex/docs/GLOSSARY.md` as the only glossary.
- Neither exists: create `codex/docs/GLOSSARY.md` lazily when the first term is resolved.

When multiple contexts exist, infer which one the current topic relates to. If unclear, ask.
