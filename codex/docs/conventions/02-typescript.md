[← Index](README.md)

# 2. TypeScript

## 2.1 Naming

Names should communicate the concept and intent.

A reader should usually understand what a function or value represents without reading its implementation.

Prefer:

```ts
advanceSimulation(...)
```

over:

```ts
process(...)
```

Prefer names that describe **what the value means**, not merely its implementation.

A good name reduces the amount of architecture that must exist in the reader's head.

---

## 2.2 Functions

A function should represent one coherent operation.

It may contain several implementation steps when those steps form one understandable operation from the caller's point of view.

A function should generally read from top to bottom.

Extract a helper when doing so improves one of:

- readability;
- naming;
- isolation;
- reuse;
- testability;
- separation of abstraction levels (see §2.3).

Do not extract helpers merely to make functions shorter.

Avoid both extremes:

```text
one giant function containing unrelated responsibilities
```

and:

```text
one function per line of implementation
```

---

## 2.3 One level of abstraction per function

A function should operate at a single level of abstraction.

A line of code either says **what** happens (a named step of the operation) or **how** it happens (loops, arithmetic, raw API calls, string building). A function should not alternate between the two.

```text
orchestration   → reads as a sequence of named steps
implementation  → manipulates data and raw APIs
```

Mixing the levels forces the reader to keep switching between intent and mechanics, and buries the shape of the operation under its details.

**Mixed:**

```ts
function renderFrame(ctx: CanvasRenderingContext2D, simulation: Simulation) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    for (const body of simulation.bodies) {
        ctx.beginPath();
        ctx.arc(body.x, body.y, body.radius, 0, Math.PI * 2);
        ctx.fillStyle = body.color;
        ctx.fill();
    }

    updateStatsPanel(simulation);
}
```

**One level:**

```ts
function renderFrame(ctx: CanvasRenderingContext2D, simulation: Simulation) {
    clearSurface(ctx);
    drawBodies(ctx, simulation.bodies);
    updateStatsPanel(simulation);
}

function drawBodies(ctx: CanvasRenderingContext2D, bodies: Iterable<Body>) {
    for (const body of bodies) {
        drawDisc(ctx, body);
    }
}
```

### How to tell

Describe each line of the function in a few words.

- If all lines have the same granularity ("clear", "draw bodies", "update stats"), the function is at one level.
- If one line says "draw the scene" and the next says "set the fill color and loop over the array", it mixes levels.

### Rules of thumb

- **Orchestrators** call named steps. They may contain simple control flow (`if`, `for`, `await`) over those steps, but not the mechanics of the steps themselves.
- **Leaf functions** are entirely low-level. That is fine: a function that is all mechanics is at one level.
- The criterion is the **level**, not the **size**. A long function that is a flat list of equivalent steps (or a table, or a `switch` over cases) is fine. A short function can still mix levels.
- Extract a helper when it separates levels. Do **not** extract a helper that sits at the same level as the code around it: that is the "one function per line" extreme from §2.2.
- When the extracted helper has no good name, that is a signal to reconsider the split, not to pick a vague name (§2.1).

This rule is the concrete form of §1.5 for functions: the identifiable problem that justifies the helper is the mixing of levels.

---

## 2.4 Dependencies

Dependencies flow in one direction:

```text
data → shared helpers → application/components
```

Lower-level code must not reach back into higher-level code.

Dependencies should be visible enough that the reader can understand where behavior comes from.

Prefer passing a dependency explicitly over obtaining it through hidden global access when the dependency is part of the core's behavior.

Keep alternative implementations of the same abstraction close enough that they remain easy to compare.

---

## 2.5 Comments

Comments explain **why**, not **what**.

If the code needs a comment to explain what it does, prefer improving the code or its naming first.

Keep comments when they explain:

- a non-obvious constraint;
- an intentional trade-off;
- a surprising implementation;
- why a seemingly simpler approach is incorrect;
- an external requirement that the code alone cannot communicate.

A comment should explain something that would otherwise be lost.

Avoid comments that merely restate the code.

---

## 2.6 Files

A single file is the default.

Split a file only when it becomes difficult to scan, understand, or modify as one coherent unit.

Do not split based on:

- line count alone;
- one-file-per-concept rules;
- anticipated future growth;
- the desire to make a directory structure look organized.

When a split becomes necessary, make the smallest useful change.

For example:

```text
store.ts
actions.ts
selectors.ts
```

is a reasonable evolution of a store that has become difficult to scan.

It is not a structure to create in advance.
