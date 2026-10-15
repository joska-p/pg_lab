[← Index](README.md)

# 1. Principles

These principles apply everywhere.

## 1.1 Accept less, promise more

Accept the loosest input type that works.

Return the strongest useful type the function can honestly guarantee.

Do not force callers to materialize or transform data unnecessarily.

```ts
function sum(values: Iterable<number>): number {
    let total = 0;

    for (const value of values) {
        total += value;
    }

    return total;
}
```

A stronger return type is useful when it represents a guarantee established by the program.

Branded types can represent such guarantees when an API requires a value to have already passed a validation or normalization step.

```ts
type NormalizedVector = {
    x: number;
    y: number;
} & { __brand: 'normalized' };
```

A type-level guarantee is only as meaningful as the boundary that establishes it.

Branded types are compile-time conventions, not runtime guarantees.

Do not use a stronger type merely to make an API look more precise.

---

## 1.2 Keep the core honest

Pure logic must receive its dependencies explicitly.

The core must not discover or reach for its environment.

The core must not directly depend on:

- `Date.now()`
- `performance.now()`
- `Math.random()`
- the DOM
- Canvas / WebGL
- global mutable state
- lifecycle state hidden in `this`
- other ambient environmental state

The **shell** owns those things and passes their values or capabilities into the core.

```text
          real world
               │
               ▼
        ┌─────────────┐
        │    Shell    │
        │ time / I/O  │
        │ DOM / RAF   │
        └──────┬──────┘
               │ explicit inputs
               ▼
        ┌─────────────┐
        │    Core     │
        │ pure logic  │
        └──────┬──────┘
               │ result
               ▼
        ┌─────────────┐
        │    Shell    │
        │ apply / emit│
        └─────────────┘
```

The core does not need to know where its inputs came from.

This makes deterministic behavior, testing, replay, and alternative environments possible without changing the domain logic.

The same principle applies to simulation, rendering, stores, and event handlers.

---

## 1.3 Make ownership explicit

Every piece of state should have a clear owner.

Ownership means responsibility for the state and, when applicable, responsibility for its lifecycle.

Do not copy state into another layer merely to make it easier to access.

A reference to an object gives another layer **reachability**, not ownership.

These are different concepts:

```text
ownership
    who is responsible for the state and lifecycle?

reachability
    who can access the object?

observation
    who can know that it changed?

lifecycle control
    who can start, stop, mount, or destroy it?
```

The same object may have different answers for each question.

If an object has its own lifecycle, it should normally own that lifecycle.

Avoid creating duplicate representations of the same truth unless the duplication solves a specific problem.

---

## 1.4 Hide implementation boundaries

Expose capabilities and concepts, not internal objects.

A consumer should not need to know which object implements an abstraction.

Prefer:

```ts
simulation.advance(dt);
```

over exposing internal implementation details that callers must manipulate correctly.

Do not leak an object merely because it happens to be the current implementation of a concept.

A useful boundary describes **what can be done**, not necessarily **which object happens to do it**.

---

## 1.5 Add indirection only when it solves a problem

Do not introduce an abstraction because it might become useful later.

A new layer, hook, helper, wrapper, file, type, adapter, or abstraction should solve an identifiable problem.

For example, it may:

- improve readability;
- remove meaningful duplication;
- isolate a lifecycle;
- provide a meaningful boundary;
- make ownership explicit;
- prevent a real class of misuse;
- allow two implementations to vary independently.

If removing the abstraction makes the code clearer without losing an important property, remove it.

Prefer code that is easy to understand today over architecture designed primarily for hypothetical future requirements.
