# Tracking Confusion

The developer carries a bias toward over-abstraction and toward converting everything into declarative form (hooks, factories, façades). That bias grates against low-level logical layers, which thrive on imperative form (classes, methods, instances, mutations).

The mission is an audit locating those friction points.

## Constraints

1. **Strict isolation**: read, list, and scan files inside the provided path alone. The wider repo enters only to verify a critical import clarifying a package's public API.
2. **Read-only**: files stay untouched, builds stay unrun, scripts stay unexecuted.
3. **Language**: code and comments in English; conversation and report in French.

## Steps

1. **Inventory**: list the main directories and modules; map responsibilities (pure logic, React façades, shared utilities, types).
2. **Logical layers (imperative)**: locate classes, instance methods, mutations, side effects; note how state travels (instances, closures, external store) and the critical external dependencies.
3. **React façades (declarative)**: locate custom hooks and their composition; evaluate whether hooks hide logic cleanly or leak internal detail; check for mutations embedded in hooks (setX, immer, mutable refs).
4. **Paradigm frictions & over-abstractions**: flag direct mutations or hidden side effects inside declarative hooks; poorly isolated imperative logic exposed raw to React; a factory or façade added by habit where a direct approach would be clearer; duplicated logic between logic modules and hooks. Propose alignments at design level only.
5. **Coupling & public API**: examine the exports (index, package.json); measure the API against real needs; suggest encapsulation and naming adjustments.
6. **Synthesis**: a concise report covering current state, strengths, risks, quick wins (fast homogenizing adjustments), and deep transformations (refactors removing the declarative bias).
