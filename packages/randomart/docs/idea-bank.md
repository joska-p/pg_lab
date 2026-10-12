# Idea Bank

A collection of ideas, possibilities, and open questions that emerge during the design of the project.

This document is not a roadmap or a list of requirements. Ideas are recorded for future consideration, without implying that they will be implemented.

The space of possibilities is effectively unlimited. The initial project should remain deliberately focused, with a coherent set of capabilities rather than an attempt to expose every possible parameter.

## 1. Generation and Exploration

### Explore beyond the seed

A seed determines a particular result within a generation system, but the generation system itself strongly influences the character of the resulting artwork.

Potential dimensions to explore independently:

- **Seed** — generate a different expression within the current system.
- **Operator vocabulary** — change the mathematical building blocks available to generation.
- **Operator weights** — change how frequently individual operators are selected.
- **Structural constraints** — influence expression depth, size, and shape.
- **Generation rules** — change how expressions are constructed and combined.
- **Parameter values** — vary the values used by an existing expression.

These dimensions need not all be exposed to users, especially in the initial version.

### Randomize the generation system

Instead of randomizing only the generated expression, it could be possible to randomize parts of the system that generates it.

Examples:

- Randomize operator weights while keeping the vocabulary fixed.
- Select a different subset of operators.
- Vary structural constraints within reasonable bounds.
- Randomize several dimensions together while preserving useful constraints.

This creates two complementary exploration loops:

1. Explore images produced by a generation system.
2. Explore generation systems that produce interesting images.

### Explore without losing discoveries

Potential tools for later exploration:

- Keep a promising result while regenerating other candidates.
- Lock parts of an expression during regeneration.
- Compare several candidates side by side.
- Save and revisit interesting generation configurations.
- Explore variations of a known expression rather than starting over.

These are possibilities, not initial requirements.

## 2. Complexity and Artistic Interest

Complexity and artistic quality are different things.

Potentially useful dimensions include:

- **Structural complexity:** expression depth, node count, branching, and dependencies.
- **Computational complexity:** approximate cost of evaluating or rendering an expression.
- **Visual diversity:** variation in colors, spatial structures, and image characteristics.
- **Artistic interest:** a subjective judgment that cannot be reduced reliably to a single metric.

Complexity controls may help navigate the generation space, but greater complexity should not be assumed to produce better artwork.

Future exploration could investigate simple metrics that help organize or filter large collections of candidates without pretending to measure beauty.

## 3. Expressions as Inspectable Artifacts

An expression is more than an intermediate representation used to render an image. It can also be an object of exploration in its own right.

Potential capabilities:

- Inspect the expression as a tree.
- Inspect the same expression as a graph.
- Display a readable mathematical formula.
- Synchronize the different representations.
- Inspect subexpressions and understand their contribution.
- Modify an expression manually.
- Reuse or combine existing expressions.

The tree and graph views should represent the same underlying expression, not become independent sources of truth.

A manually edited expression should be preservable independently of the seed or generation configuration that originally produced it.

## 4. Artwork, History, and Reproducibility

A generated image and the expression that produced it are related but distinct artifacts.

Potentially useful saved information:

- Generation seed.
- Generation configuration or grammar.
- Generated or manually edited expression.
- Rendering parameters.
- Engine and operator versions.
- Output image and optional metadata.

Ideas for later:

- Save and reopen artwork.
- Keep multiple variations of an expression.
- Compare revisions.
- Store collections of interesting results.
- Reproduce an image from its saved expression and rendering configuration.

A seed alone is insufficient to guarantee reproducibility if the generation rules or implementation change.

## 5. Rendering and Mathematical Execution

### GPU-first rendering

GPU execution is the primary direction for rendering, including the possibility of animation.

The expression model should remain independent of its execution backend.

Potential future backends or execution modes should not force the expression model itself to become tied to GLSL.

### GLSL compilation

Generating shader code is not necessarily a direct translation from expression nodes to source statements.

Potential optimization areas:

- Share common subexpressions when beneficial.
- Eliminate computations whose results are unused.
- Avoid unnecessary intermediate values.
- Manage operator dependencies.
- Consider shader instruction cost and register pressure.
- Validate generated results with in-browser range tests, compile fuzzing and snapshot tests (there is no CPU reference evaluator, see D9).

Textually deduplicating expressions is not sufficient by itself; optimizations should be evaluated against actual GPU behavior.

## 6. Extending the Creative Space

The initial focus is Random Art: mathematical expressions that map spatial coordinates to color.

Possible extensions include:

- Time-dependent expressions and animation.
- Additional mathematical types and operators.
- More expressive generation systems.
- Manually composed visual functions.
- A broader visual-function workshop that combines generation with direct editing.

These extensions should grow from the needs discovered while using the initial system, rather than dictate its initial complexity.

## 7. Guiding Principle

**Keep the possibilities open without making them all configurable.**

The project should begin with a small, intentional set of controls and a strong exploration experience. New dimensions should be introduced when they offer a meaningful creative capability, not merely because they can be parameterized.

An idea can remain in this document indefinitely without becoming a feature.
