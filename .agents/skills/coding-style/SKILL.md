---
name: coding-style
description: Use when editing, refactoring, or creating TypeScript/React code, for organization and convention rules.
---

# Coding Style

TypeScript composes through intersections, layers dependencies one way, and names through whole concepts. Every function sits at one level of abstraction; pure logic stays separate from side effects. Files carry one responsibility and code reads like a sentence. `vp check` (oxlint + oxfmt + types) verifies each pass.

Facts live in `codex/docs/conventions/typescript.md` (repo root). They govern every edit.

For code that touches Canvas, WebGL, or a render loop, also read `codex/docs/conventions/graphics-architecture.md` — it extends the general rules with lifecycle proof-token and honest-core patterns specific to that domain.
