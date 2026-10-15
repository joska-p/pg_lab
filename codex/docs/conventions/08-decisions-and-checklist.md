[← Index](README.md)

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
- Does each function stay at one level of abstraction (§2.3)?

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
