# Coding Conventions

These conventions exist to keep the codebase coherent and make design decisions predictable.

They are **preferences, not doctrine**. When a rule makes the code harder to understand, stop and reconsider the rule rather than following it mechanically.

The goal is not to eliminate judgment.

The goal is to make good judgment easier.

---

# 0. Priority

When conventions conflict, use this order:

1. **Principles** — fundamental design rules.
2. **Conventions** — default ways of structuring code.
3. **Patterns** — techniques to use when a problem calls for them.
4. **Current choices** — project-specific technology decisions that may change later.

Prefer the simplest solution that satisfies the higher-priority rule.

A lower-level rule must not defeat a higher-level principle merely because it is easier to apply mechanically.

---

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
} & { __brand: "normalized" };
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

---

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
- testability.

Do not extract helpers merely to make functions shorter.

Avoid both extremes:

```text
one giant function containing unrelated responsibilities
```

and:

```text
one function per line of implementation
```

High-level orchestration should not be unnecessarily mixed with low-level implementation details.

For example, do not mix rendering orchestration with raw Canvas or DOM operations when separating them would make the flow easier to understand.

---

## 2.3 Dependencies

Dependencies flow in one direction:

```text
data → shared helpers → application/components
```

Lower-level code must not reach back into higher-level code.

Dependencies should be visible enough that the reader can understand where behavior comes from.

Prefer passing a dependency explicitly over obtaining it through hidden global access when the dependency is part of the core's behavior.

Keep alternative implementations of the same abstraction close enough that they remain easy to compare.

---

## 2.4 Comments

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

## 2.5 Files

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

---

# 3. State

There are two fundamentally different kinds of state.

## 3.1 UI state

UI state includes values such as:

- selections;
- booleans;
- palettes;
- panel visibility;
- user preferences.

Use local `useState` when the state belongs to one component.

Use Zustand when the state is shared by multiple unrelated components.

The important distinction is **ownership**, not the library being used.

---

## 3.2 Live objects

Live objects are long-lived objects with their own lifecycle.

Examples:

- engine;
- rendering surface;
- clock;
- simulation;
- other imperative runtime objects.

Store them as **stable references** when application-wide reachability is useful.

```ts
interface EngineSlice {
  engine: Engine | null;
  setEngine(engine: Engine): void;
}
```

Do not copy their internal state into Zustand merely to make it observable.

The live object owns its state.

The store may provide reachability.

Mount the object according to its lifecycle rather than according to React render frequency.

Replacing a live object on every frame is a design smell.

---

## 3.3 One source of truth

Avoid maintaining multiple mutable representations of the same truth.

If state belongs to a live object, do not create a second authoritative copy in application state.

If a derived value can be calculated reliably from existing state, prefer deriving it rather than storing another mutable copy.

Duplication may be justified when it serves a real boundary, performance requirement, persistence requirement, or external representation.

When state is duplicated intentionally, the synchronization rule must be explicit.

---

# 4. Reactivity

A stable reference does not make a mutable object reactive.

Choose the observation mechanism according to the kind of change.

### Values

Zustand selectors react to changes in store values.

### Mutable live objects

A live object should expose its own signal when consumers need to observe mutations.

In React, `useSyncExternalStore` can bridge that signal into React.

A simple version counter is usually enough:

```text
live object
    │
    ├── mutable state
    │
    └── version ──→ subscribers
```

The important architectural rule is:

> The object that owns mutable state should own the mechanism that reports its changes.

Do not select mutable internals from Zustand expecting React to re-render when they change.

Subscribe at the consuming component.

The distinction is:

```text
Zustand selector
    → "this store value changed"

external-store subscription
    → "this live object changed"
```

Subscribe narrowly.

Do not broadcast whole state when a small signal is sufficient.

---

# 5. Store architecture

## 5.1 Store responsibility

The store provides:

- shared UI state;
- access to stable live-object references;
- synchronous state updates.

The store does not become the owner of state that belongs to a live object.

A store should represent an application-level state boundary, not become a general-purpose container for everything the application knows.

---

## 5.2 Actions

Orchestration belongs in plain actions.

Actions may:

- load assets;
- create objects;
- mount objects;
- start processes;
- connect objects to stores;
- perform side effects.

They are the store-level equivalent of the **impure shell**.

Actions coordinate behavior.

They should call domain logic rather than becoming the domain logic.

```ts
export function mountEngine(canvas: HTMLCanvasElement) {
  const engine = createEngine(canvas);

  engineStore.setState({ engine });

  engine.start();
}
```

An action may contain several steps when those steps form one meaningful application operation.

Avoid turning the store into a service layer full of domain behavior.

---

## 5.3 Store boundaries

A store should own one coherent domain.

An action that needs to **read** another domain does not automatically justify merging the stores.

Read the other store directly when appropriate.

Merge domains only when they genuinely share write authority or must be updated atomically.

Split independent concerns into separate stores.

The number of stores is not itself an architectural goal.

---

# 6. Core and rendering

## 6.1 Rendering follows core / shell

Rendering is an application of the same core/shell rule.

### Core

The core contains things such as:

- physics;
- transforms;
- geometry;
- simulation;
- deterministic calculations.

It receives explicit inputs and produces results.

### Shell

The shell owns:

- `requestAnimationFrame`;
- real time;
- Canvas / WebGL / DOM APIs;
- event listeners;
- applying results;
- notifying observers.

Do not hide lifecycle dependencies inside otherwise pure logic.

The rendering shell may be imperative.

That is not a problem.

The problem is allowing imperative environmental concerns to become invisible dependencies of logic that is supposed to be deterministic.

---

## 6.2 Simulation truth

Simulation state belongs to the simulation/core.

Do not copy simulation truth into application state merely to expose it to React.

The core should remain deterministic where practical so that:

- replay is possible;
- seed-based variation is possible;
- behavior can be tested independently;
- rendering and UI concerns do not become part of the simulation.

React does not need to own the simulation merely because React displays its results.

---

# 7. Lifecycle

Lifecycle is an ownership problem.

The component or system that creates a live object should have a clear relationship with its lifecycle.

A lifecycle-sensitive operation should have a clearly defined valid context.

Prefer making valid lifecycle transitions explicit rather than relying on undocumented calling order.

For example:

```text
create
  ↓
configure
  ↓
mount
  ↓
start
  ↓
running
  ↓
stop
  ↓
destroy
```

The exact lifecycle may differ by object.

What matters is that invalid transitions are difficult to make accidentally.

---

## 7.1 Proof tokens

When an operation is only valid during a particular lifecycle phase, consider using a **proof token**.

A proof token represents:

> "This call is being made through the intended lifecycle."

For example, a draw operation may require an active-frame token.

Use proof tokens when the additional type constraint prevents a misuse that would otherwise be difficult or expensive to diagnose.

Do not use proof tokens by default.

First make the lifecycle itself clear.

A proof token is useful when the type system can meaningfully reinforce that lifecycle.

It is not useful merely because the type system can express it.

Proof tokens are compile-time design aids, not runtime security mechanisms.

TypeScript cannot prevent:

```ts
someValue as ActiveFrameToken;
```

and a token can still be retained and misused after its intended lifetime.

The purpose is to make the correct path the natural path.

---

# 8. Errors and invalid states

Expected domain failures should be represented in a form that callers can handle deliberately.

Use types when failure is part of the normal contract of an operation and callers are expected to make a decision about it.

Use exceptions for failures that are exceptional, unexpected, or cannot be meaningfully handled at the local boundary.

Do not use exceptions as the normal control flow of pure domain logic when the failure is an expected outcome.

Prefer making invalid states difficult to represent when doing so simplifies the design.

Do not introduce elaborate error types merely to avoid a simple, understandable `throw`.

The goal is not "never throw."

The goal is to make the failure model honest.

---

# 9. Asynchronous work

Asynchronous work has a lifecycle too.

An async operation should have a clear owner.

When an operation can outlive the object or context that started it, decide explicitly what should happen when that owner disappears.

Possible policies include:

- cancellation;
- ignoring stale results;
- transferring ownership;
- allowing the operation to complete independently.

Do not allow asynchronous work to mutate an object after that object's lifecycle has ended merely because the Promise eventually resolved.

When multiple async operations can race, make the rule for stale results explicit.

For example:

```text
request A starts
    ↓
request B starts
    ↓
B completes
    ↓
A completes later
```

If A is no longer authoritative, its result must not silently overwrite B.

The exact mechanism may be:

- `AbortController`;
- a generation/version number;
- an ownership check;
- another appropriate mechanism.

The architectural rule comes first.

The mechanism comes second.

---

# 10. Performance

Prefer correctness and clarity first.

For high-frequency browser events such as:

- resize;
- scroll;
- pointer/mouse events;

avoid unnecessary layout work and throttle/debounce where appropriate.

For React lists, use stable, deterministic keys.

Do not introduce memoization or other performance mechanisms speculatively.

Measure or identify a real problem first.

Performance optimizations are justified by:

- a measured problem;
- a known expensive operation;
- a clearly understood workload;
- or an architectural constraint that is already known.

Do not optimize merely because something happens frequently.

---

# 11. Patterns

Patterns are tools, not rules.

Use a pattern when it solves a problem already present in the code.

Do not introduce a pattern merely because the problem resembles an example from another project.

Useful patterns in this codebase include:

- branded types for established invariants;
- external-store subscriptions for mutable live objects;
- proof tokens for meaningful lifecycle constraints;
- explicit shells around deterministic cores.

Patterns may be removed when the problem they solved disappears.

A pattern should not acquire authority merely because it already exists.

---

# 12. Current project choices

These are current decisions, not general principles.

They may change when the application's requirements change.

## 12.1 Zustand

Zustand is used for:

- shared UI state;
- reachability of live objects.

This avoids introducing separate mechanisms for application state and module-level object access.

Zustand is an implementation choice.

The underlying architectural principles are:

- explicit ownership;
- explicit reachability;
- appropriate reactivity;
- minimal duplication.

---

## 12.2 No server-data layer

There is currently no server-data requirement.

Do not introduce TanStack Query or another request/response state layer until the application actually has external server data that benefits from it.

Revisit this decision when that requirement appears.

---

## 12.3 Package static assets consumed as libraries

A package imported as a library (e.g. `apps/playground` lazy-imports `@repo/<pkg>/App` source) must not serve its own static files via `public/` + absolute `fetch()` paths.

Vite never merges a guest's `public/` into the host's `public/`, and absolute paths ignore the host's `base`.

Use Vite-resolved assets co-located with the code instead:

- Store files under `src/assets/<domain>/` in the owning package.
- Resolve them with a lazy `import.meta.glob` + `?url` map keyed by filename; `fetch()` the resolved URL.
- Never keep a `baseUrl` / absolute-path fallback alongside it: one pattern only.

```ts
const sdfUrlModules = import.meta.glob("../assets/molecules/*.sdf", {
  query: "?url",
  import: "default",
}) as Record<string, () => Promise<string>>;

const sdfUrlByFile = new Map<string, () => Promise<string>>(
  Object.entries(sdfUrlModules).map(([path, loader]) => [path.split("/").pop() ?? path, loader]),
);

export async function loadMolecule(entry: MoleculeEntry): Promise<Molecule> {
  const loader = sdfUrlByFile.get(entry.file);
  if (!loader) throw new Error(`unknown asset ${entry.file}`);
  const res = await fetch(await loader());
  if (!res.ok) throw new Error(`could not load ${entry.file} (${res.status})`);
  return parseAndValidate(await res.text(), entry.file);
}
```

Why: Vite hashes/emits the files, rewrites URLs with the consumer's `base` automatically, keeps per-file lazy fetch (small files may inline as `data:` URLs, larger ones emit separate files — both fetchable), and works unchanged in package standalone `dev`, host `dev`, and host `build`.

---

# 13. Decision rules

When several implementations seem reasonable, prefer the one that satisfies these rules in order:

1. **Make ownership explicit.**
2. **Keep pure logic independent from its environment.**
3. **Prefer direct data flow over indirection.**
4. **Keep live objects alive rather than copying their state.**
5. **Keep one source of truth.**
6. **Use the simplest appropriate reactivity mechanism.**
7. **Make lifecycle boundaries explicit.**
8. **Add abstractions only when they remove real complexity.**
9. **Keep files and modules together until separation improves readability.**
10. **Prefer a small local solution over a framework-wide mechanism.**

When still undecided, choose the simpler implementation and leave room to extract the abstraction later.

---

# 14. Before calling something done

Use this as an architectural check after the mechanical checks pass.

## Types

- Are inputs no stricter than necessary?
- Are guarantees represented by useful types where appropriate?
- Is a stronger type backed by an actual program invariant?
- Are branded types being used because they solve a real boundary problem?

## Core

- Does pure logic receive its dependencies explicitly?
- Did time, randomness, I/O, or DOM access leak into the core?
- Can the core be tested without its environment?
- Is the core's behavior deterministic where practical?

## Ownership

- Who owns each piece of mutable state?
- Who owns each live object's lifecycle?
- Is another layer merely accessing an object, or does it actually own it?
- Did I create a duplicate source of truth?

## Structure

- Is the dependency direction clear?
- Did I introduce a file or abstraction before it was needed?
- Is the code readable without jumping through layers?
- Does each boundary communicate a meaningful concept?

## State

- Is each piece of state owned by the right layer?
- Are live objects stored as stable references?
- Am I copying state only to make it observable?
- Could this value be derived instead of stored?

## Reactivity

- Am I reacting to values with selectors?
- Am I reacting to live-object mutations with an external-store signal?
- Is the subscription as narrow as it can reasonably be?
- Does the owner of mutable state own its change signal?

## Lifecycle

- Is the lifecycle of each live object clear?
- Could a lifecycle-sensitive API be called incorrectly?
- Would a proof token meaningfully reduce that risk?
- Can async work outlive the object that started it?

## Errors

- Is the failure model honest?
- Are expected failures distinguishable from exceptional failures?
- Could an invalid state be prevented rather than detected later?

## Async

- Who owns this async operation?
- What happens if its owner disappears?
- Can an old result overwrite a newer one?
- Is cancellation or stale-result handling actually necessary?

## Performance

- Is there an identified performance problem?
- Am I optimizing a measured or clearly understood bottleneck?
- Did the optimization make the architecture harder to understand?

---

# 15. Final questions

Before introducing complexity, ask:

> **Did I add complexity to solve a problem, or because the abstraction seemed like a good idea?**

Then ask:

> **Who owns this state?**

> **Where does this dependency come from?**

> **Is this object being exposed because it is part of the public concept, or because it happens to implement the abstraction?**

> **Am I copying state because I need a second source of truth, or because I merely need a way to observe it?**

> **Could the simpler design remain correct if the application grew?**

If the answer is unclear, prefer the simpler implementation.

If the answer is "the abstraction seemed like a good idea", simplify it.

If the answer is "this solves a real problem", keep it — even if the solution is not fashionable.

The purpose of these conventions is not to make the code look architecturally sophisticated.

It is to make the code's **ownership, dependencies, state, lifecycle, and boundaries obvious**.

That is enough architecture.
