# Coding Conventions — Index

These conventions exist to keep the codebase coherent and make design decisions predictable.

They are **preferences, not doctrine**. When a rule makes the code harder to understand, stop and reconsider the rule rather than following it mechanically.

The goal is not to eliminate judgment.

The goal is to make good judgment easier.

---

## How to use this folder

**Humans and agents: do not read everything.**

1. Read this index (priority rules + routing table below).
2. Open only the file(s) relevant to what you are touching.
3. Before calling something done, run through [08-decisions-and-checklist.md](08-decisions-and-checklist.md).

Section numbers (`§2.3`, `§4`, …) are stable across files: cite them when referring to a rule.

---

## Table of contents

| File                                                                     | Sections      | Read it when…                                                                           |
| ------------------------------------------------------------------------ | ------------- | --------------------------------------------------------------------------------------- |
| [01-principles.md](01-principles.md)                                     | §1            | Designing an API, a module boundary, or deciding whether to add an abstraction.         |
| [02-typescript.md](02-typescript.md)                                     | §2            | Writing or reviewing names, types, functions, comments, file structure.                 |
| [03-state-and-reactivity.md](03-state-and-reactivity.md)                 | §3, §4, §5    | Deciding where state lives, how React observes it, how stores are organized.            |
| [04-core-and-rendering.md](04-core-and-rendering.md)                     | §6            | Working on simulation, rendering loops, or anything touching Canvas / WebGL / DOM.      |
| [05-lifecycle-and-async.md](05-lifecycle-and-async.md)                   | §7, §9        | Creating/mounting/destroying live objects, proof tokens, promises, races, cancellation. |
| [06-errors-and-performance.md](06-errors-and-performance.md)             | §8, §10       | Modeling failures, throwing vs returning, or considering an optimization.               |
| [07-patterns-and-project-choices.md](07-patterns-and-project-choices.md) | §11, §12      | Using a named pattern, or touching Zustand / assets / React Compiler setup.             |
| [08-decisions-and-checklist.md](08-decisions-and-checklist.md)           | §13, §14, §15 | Choosing between several valid designs, or doing the final architectural check.         |

---

## Quick routing

| If you are…                                   | Read                                     |
| --------------------------------------------- | ---------------------------------------- |
| Adding a new function or helper               | §2.2, §2.3 (one abstraction level), §1.5 |
| Adding state                                  | §3, §5, §1.3                             |
| Making a component re-render on a mutation    | §4                                       |
| Writing a render loop or simulation step      | §6, §1.2                                 |
| Mounting something with `start`/`stop`        | §7                                       |
| Calling `fetch` or any async API              | §9                                       |
| Loading a static asset from a library package | §12.3                                    |
| Tempted to write `useMemo` / `useCallback`    | §12.4                                    |
| Splitting a file                              | §2.6                                     |
| Deciding where a type lives                   | §2.6                                     |

---

# 0. Priority

When conventions conflict, use this order:

1. **Principles** — fundamental design rules.
2. **Conventions** — default ways of structuring code.
3. **Patterns** — techniques to use when a problem calls for them.
4. **Current choices** — project-specific technology decisions that may change later.

Prefer the simplest solution that satisfies the higher-priority rule.

A lower-level rule must not defeat a higher-level principle merely because it is easier to apply mechanically.
