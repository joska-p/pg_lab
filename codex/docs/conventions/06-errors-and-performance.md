[← Index](README.md)

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
