---
title: TypeScript
description: TypeScript style, performance rules, and coding principles.
---

# TypeScript

Preferences, not doctrine. They lean on Clean Code principles. A package can deviate as long as it's consistent within that package.

## Naming and signatures

Names should carry the concept, so you don't need to read the body to know what a function does. Group folders by domain (`cpu/`, `gpu/`), suffix files by variant (`*Declarative`, `*Hybrid`).

Accept the loosest type that works: an iterable instead of an array, a branded type (`ValidatedString`, `NormalizedVector`) instead of a raw string when the caller should have already checked it. Less to validate inside the function.

```ts
type NormalizedVector = { x: number; y: number } & { __brand: "normalized" };

// dot() trusts the type — no need to re-check the vector is normalized
function dot(a: NormalizedVector, b: NormalizedVector): number {
  return a.x * b.x + a.y * b.y;
}
```

Branded types are a compile-time convention, not a runtime guarantee — nothing stops a caller from forcing one with `as`. They exist so validation happens once, at construction, instead of being re-checked in every function that consumes the value. Domain-specific extensions of this pattern (e.g. lifecycle proof tokens) live in `conventions/graphics-architecture.md`.

## Function design

One function, one job. If a chunk of a function needs you to zoom into a raw loop or some string fiddling, pull it into its own helper with a name.

Keep pure logic separate from side effects. A pure function takes all its dependencies as explicit parameters (`dt`, `input`, `randomSeed`, `dimensions`) — it never reads `Date.now()`, `Math.random()`, the DOM, or global state directly, and given the same inputs it always returns the same output. Push everything impure (timers, I/O, `requestAnimationFrame`, network calls) to the edges of the app, and inject it into the pure core as a parameter. Pure functions are easier to test, reuse, and reason about.

Comments explain why, not what — the code already says what.

## Structure

Layer dependencies one way: data → shared helpers → components. Nothing reaches back up. Keep alternative implementations of the same thing next to each other so they're easy to compare.

Every function body operates at one level of abstraction. Don't mix raw loops, string manipulation, or low-level API calls (Canvas, DOM) inside a function that's otherwise doing high-level orchestration — if you catch yourself doing that, extract a named helper for the low-level part. A function reads top-to-bottom like a table of contents, not like an implementation.

## Performance

Throttle or debounce high-frequency events (resize, scroll, mouse) before they touch layout. Use stable, deterministic keys for lists so React doesn't re-render everything.

## Verification

`vp check` runs format, lint, and type checks in one pass. Before calling something done: types check, imports aren't broken, and public APIs haven't silently changed.
