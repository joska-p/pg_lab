# Coding Manifesto

This codebase is guided by a small set of principles.

They are not doctrine.

They exist to make the code easier to understand, easier to change, and harder to misuse.

When a rule conflicts with clarity, reconsider the rule.

---

## 1. Make ownership explicit

Every piece of mutable state should have an owner.

Ownership means responsibility for the state and, when applicable, its lifecycle.

A reference gives **access**, not ownership.

Do not duplicate state merely because another part of the application needs to see it.

Ask:

> **Who owns this?**

---

## 2. Keep the core honest

Pure logic should not discover its environment.

Time, randomness, I/O, DOM, rendering, and other environmental concerns belong outside the core.

Pass what the core needs explicitly.

```text
environment
     ↓
   shell
     ↓
 explicit inputs
     ↓
   core
     ↓
   result
     ↓
   shell
```

The core should remain deterministic where practical.

---

## 3. Keep one source of truth

Do not maintain multiple authoritative representations of the same state.

Prefer deriving information from existing state over storing another mutable copy.

Duplicate state only when the duplication solves a real problem.

If state is duplicated intentionally, make the relationship between the copies explicit.

---

## 4. Expose concepts, not implementations

A boundary should communicate what can be done, not which object happens to implement it.

Hide implementation details when they are not part of the concept being exposed.

Do not create an abstraction merely to hide something.

Create a boundary when it gives the code a meaningful concept, isolates a responsibility, or prevents misuse.

---

## 5. Prefer directness

Prefer explicit data flow over hidden connections.

Prefer a simple function over a framework when a function is enough.

Prefer a local solution over a global mechanism.

Prefer keeping related code together until separation makes it easier to understand.

Do not introduce indirection for hypothetical future needs.

> **Complexity must earn its place.**

---

## 6. Make guarantees honest

Accept inputs that are no stricter than necessary.

Return the strongest guarantee the code can honestly provide.

Use types to represent meaningful invariants when they prevent real misuse.

A type is not a guarantee merely because TypeScript allows us to write it.

The program must establish the invariant that the type claims to represent.

---

## 7. Make lifecycle visible

Objects that live have a lifecycle.

That lifecycle should have an owner and understandable transitions.

Creation, mounting, starting, stopping, destruction, and asynchronous work should not depend on accidental calling order.

When lifecycle misuse is difficult to prevent by structure alone, use types or other mechanisms to make the valid path easier to follow.

Do not add machinery merely because a lifecycle exists.

---

## 8. Let observation follow ownership

The thing that owns mutable state should own the mechanism that reports its changes.

Do not move state merely because another system needs to react to it.

Distinguish between:

```text
owning state
accessing state
observing state
```

These are different responsibilities.

Choose the simplest mechanism appropriate to the kind of change.

---

# When in doubt

Ask, in this order:

> **Who owns it?**

> **Where does the dependency come from?**

> **Where is the source of truth?**

> **Is the core depending on its environment?**

> **Am I adding indirection to solve a real problem?**

> **Can the simpler design remain correct?**

If the answer is unclear, prefer the simpler design.

If the abstraction exists because it _might_ be useful someday, remove it.

If it exists because it solved a real problem, keep it.

The goal is not sophisticated architecture.

The goal is **obvious ownership, explicit dependencies, honest state, visible lifecycles, and simple boundaries**.

That is enough architecture.
