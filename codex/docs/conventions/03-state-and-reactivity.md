[← Index](README.md)

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
