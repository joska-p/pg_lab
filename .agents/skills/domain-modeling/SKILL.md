---
name: domain-modeling
description: Build and sharpen a project's domain model. Use when discussing codebase terminology, writing or editing a GLOSSARY.md, or recording or editing an ADR.
---

# Domain Modeling

Actively build and sharpen the project's domain model as you design. This is the _active_ discipline: challenging terms, inventing edge-case scenarios, and writing the glossary and decisions down the moment they crystallise. (Merely _reading_ `GLOSSARY.md` for vocabulary is not this skill: that's a one-line habit any skill can do. This skill is for when you're changing the model, not just consuming it.)

In PG_LAB the aim is practical: keep the vocabulary stable enough that the author and an agent can talk about the same concept without guessing.

## File structure (PG_LAB)

There is one context for now. The single source of truth is `codex/docs/GLOSSARY.md` — there is deliberately no root-level `GLOSSARY.md`, because `AGENTS.md` puts ecosystem docs under `codex/`.

```
/
├── codex/
│   ├── docs/
│   │   ├── GLOSSARY.md
│   │   └── adr/
│   │       ├── 0001-short-title.md
│   │       └── 0002-short-title.md
│   └── docs/conventions/...
└── apps/ + packages/
```

If `codex/docs/GLOSSARY-MAP.md` ever appears, read it first and treat the repo as having several contexts. Do not create a map speculatively: one flat glossary with subheadings is the default.

Create files lazily: only when there is something to write. If `codex/docs/GLOSSARY.md` does not exist yet, create it when the first term is actually resolved. If `codex/docs/adr/` does not exist, create it when the first ADR is needed. Never leave an empty placeholder.

## Relationship with the repo conventions

- `codex/docs/conventions/02-typescript.md` §2.1.8 defines what a glossary entry must contain; §2.1.9 defines how renames must be propagated.
- `codex/docs/conventions/07-patterns-and-project-choices.md` §12 is the primary decision log. Check it before offering an ADR so the same choice is not recorded twice.
- `PRODUCT.md` and `DESIGN.md` describe the product and the visual language; the glossary describes the concepts. Do not turn it into a second spec.

## During the session

### Challenge against the glossary

When the user uses a term that conflicts with `codex/docs/GLOSSARY.md`, call it out immediately. "Your glossary defines 'Scene' as the component rendered in the Stage, but you seem to mean the whole canvas. Which is it?"

### Sharpen fuzzy language

When the user uses vague or overloaded terms, propose a precise canonical term. "You're saying 'surface': do you mean the rendering abstraction or the UI recipe? Those are different things."

### Discuss concrete scenarios

When domain relationships are being discussed, stress-test them with specific scenarios. Invent scenarios that probe edge cases and force the user to be precise about the boundaries between concepts.

### Cross-reference with code

When the user states how something works, check whether the code agrees. Use `rg` across `apps/` and `packages/`; if a name means two different things, surface it: "The shell calls this `Stage`, but the shader code uses `stage` for an output. Which concept owns the word?"

### Update `codex/docs/GLOSSARY.md` inline

When a term is resolved, update the glossary right there. Don't batch these up: capture them as they happen. Use the format in [GLOSSARY-FORMAT.md](./GLOSSARY-FORMAT.md).

Record the canonical word, the forbidden synonyms, the distinction from near-synonyms, and any unit or range attached to a numeric name. Write definitions in English (docs and specs are English in this repo), even when the discussion is in French.

`codex/docs/GLOSSARY.md` should be totally devoid of implementation details. Do not treat it as a spec, a scratch pad, or a repository for implementation decisions. It is a glossary and nothing else. Generic programming concepts (timeouts, error types, utility patterns, stores, hooks) do not belong here even if the project uses them heavily.

### Offer ADRs sparingly

Only offer to create an ADR when all three are true:

1. **Hard to reverse**: the cost of changing your mind later is meaningful.
2. **Surprising without context**: a future reader will wonder "why did they do it this way?"
3. **The result of a real trade-off**: there were genuine alternatives and you picked one for specific reasons.

If any of the three is missing, skip the ADR. If the choice is already captured in §12 of `codex/docs/conventions/07-patterns-and-project-choices.md`, skip the ADR too and add a cross-link instead. Use the format in [ADR-FORMAT.md](./ADR-FORMAT.md).
