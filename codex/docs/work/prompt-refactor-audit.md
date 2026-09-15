# Refactor audit — architecture and StyleX review

We are in the middle of a refactor of a small personal React UI toolkit.

**Do not modify any code yet.**

Your job in this session is to act as a senior frontend architect and reviewer. I want an **inventory of problems, questionable decisions, accidental complexity, and architectural drift** before we continue implementing anything.

The previous refactor work was done with an older/smaller model, and I now suspect that some of the implementation has drifted away from the intended architecture — especially around **StyleX**.

## First: understand the project

Before reviewing code:

1. Read the relevant project documentation.
2. Read the current `README.md`, design/product documentation, and any refactor/handoff documents.
3. Inspect the current UI package structure.
4. Inspect the theme/foundation/effects/tokens/intents/components organization.
5. Inspect the actual StyleX configuration and current StyleX usage in the repository.
6. Do not assume that StyleX behaves like Emotion, styled-components, CSS Modules, or a generic runtime CSS-in-JS library.

The repository uses **React 19, TypeScript, and StyleX**.

The project is a **small personal UI toolkit for creative mini-apps**, not a general-purpose design system. Simplicity and composability are more important than making every component infinitely configurable.

---

# Important context

The purpose of the current refactor is to make the UI toolkit **simpler**, not to build a more sophisticated abstraction layer.

A recurring concern during this refactor is accidental complexity:

- too many layers
- generic abstractions introduced too early
- components that know too much
- runtime styling where static composition would be sufficient
- implementation details leaking into public APIs
- "flexible" APIs that make the actual usage harder to understand
- components becoming responsible for unrelated concerns

I specifically want you to look for cases where the refactor is **solving hypothetical future requirements instead of the requirements demonstrated by the current application**.

---

# StyleX is a major review point

I suspect some of the current code was written with a mental model closer to generic CSS-in-JS than to StyleX.

Pay particular attention to:

- `stylex.create`
- `stylex.props`
- `stylex.defineVars`
- `stylex.defineConsts`
- `StyleXStyles`
- dynamic style functions
- runtime-created style objects
- `as StyleXStyles` casts
- arbitrary CSS values
- CSS variables
- style composition
- conditional variants
- theme tokens
- whether styles are statically analyzable
- whether the current API actually follows StyleX's intended model

For every suspicious pattern, distinguish between:

1. **valid StyleX usage**
2. **valid but unnecessarily complicated usage**
3. **usage that defeats important StyleX benefits**
4. **usage that is simply incorrect / unsafe**
5. **usage that may work but indicates the wrong architectural abstraction**

Do not assume that something is valid just because TypeScript accepts it.

---

# Current Surface component

One component that triggered this review is `Surface`.

Here is the current implementation:

```tsx
[PASTE CURRENT SURFACE COMPONENT HERE]
```

Do not immediately rewrite it.

Instead, analyze it as evidence of the current architecture.

In particular investigate:

### 1. Runtime style generation

Look carefully at patterns such as:

```ts
const getSurfaceTint = (...)
```

and:

```ts
const style = {
  ...
} as StyleXStyles;
```

and dynamic StyleX style functions such as:

```ts
canvas: (color: string) => ({
  ...
})
```

Determine whether these are appropriate StyleX patterns or whether they indicate that we are treating StyleX styles as runtime CSS objects.

### 2. Variant modeling

Analyze whether:

- `elevation`
- `tint`
- `color`
- `interactive`
- `muted`
- `glow`
- `align`
- `size`
- `label`

actually belong in one `Surface` abstraction.

Look for combinations that don't make conceptual sense.

### 3. Semantic responsibility

Determine what a `Surface` is actually supposed to represent.

Is it:

- a visual primitive?
- a layout primitive?
- a card?
- an interactive control?
- a themed container?
- a rendering surface?
- several unrelated things accidentally combined?

Do not accept the current API as proof of the intended abstraction.

### 4. Special rendering

Pay particular attention to cases where one prop changes the implementation completely, for example:

```tsx
if (elevation === "glass") {
  return <MaterialScene ... />
}
```

Determine whether this is a legitimate variant or evidence that two concepts have been incorrectly merged.

---

# Broader audit

Do not restrict the investigation to `Surface`.

Trace the architecture around it.

Look for:

## Theme / tokens

Are we correctly separating:

- raw constants
- design tokens
- semantic tokens
- component styles
- effects
- intents
- foundations

Are there unnecessary layers?

Are components reaching too deeply into the theme internals?

Are semantic tokens actually hiding implementation choices?

## Effects

Are effects such as:

- elevation
- glass
- glow
- focus

really independent composable effects, or are we creating abstractions merely to organize CSS?

## Intents

Are "intents" actually useful in this project, or are they another abstraction layer that makes simple components harder to understand?

## Foundations

Are foundations providing genuinely shared behavior, or are they becoming a dumping ground?

## Consts

Are files such as:

- `spacing`
- `radius`
- `typography`
- `motion`
- `layout`
- `interaction`

being used appropriately as StyleX constants/tokens, or are we creating unnecessary indirection?

## Component APIs

Look for props whose sole purpose is to expose implementation details.

Look for APIs that could be replaced by simple StyleX composition.

Look for APIs that are more generic than the actual needs of the toolkit.

---

# Architectural principle

Use this as a strong heuristic:

> Prefer the smallest abstraction that makes the current usage clear.

Do not optimize for:

> "What if a future application needs this?"

Prefer:

> "What does the current application actually need, and what is the simplest API that expresses it?"

Also:

> A component API should describe the semantic concept, not expose the implementation machinery used to render it.

And:

> If two things only share some CSS, that does not necessarily mean they should share a component abstraction.

---

# Important: distinguish real problems from personal preference

For every finding, classify it as one of:

- **Critical** — incorrect architecture or implementation that should be addressed before continuing.
- **High** — likely to cause significant complexity or API problems.
- **Medium** — questionable abstraction that should be discussed.
- **Low** — cleanup / consistency / stylistic issue.
- **Intentional / OK** — initially suspicious but actually reasonable.

Do not manufacture problems.

If something is good, explicitly say so.

---

# Deliverable

Produce an audit report, not code.

Structure it as:

## 1. Executive summary

Give me the 5–10 most important findings.

Tell me whether you think the refactor is:

- broadly on track
- slightly drifting
- significantly drifting
- fundamentally going in the wrong direction

Explain why.

## 2. StyleX audit

List every important place where the code appears to misunderstand or misuse the StyleX model.

For each:

- current pattern
- why it is suspicious
- whether it is actually valid
- what the StyleX-native mental model should be
- severity

## 3. Surface audit

Analyze `Surface` specifically.

Identify:

- responsibilities
- unnecessary variants
- suspicious props
- runtime styling
- abstraction leaks
- special cases
- opportunities for simplification

Do not rewrite it yet.

## 4. Architecture audit

Review the surrounding:

- tokens
- foundations
- intents
- effects
- constants
- components

Identify unnecessary indirection and dependency-direction problems.

## 5. API audit

Identify component APIs that are:

- too generic
- implementation-oriented
- duplicating StyleX composition
- exposing low-level details
- combining unrelated concepts

## 6. Dependency / layering diagram

Give me a simple textual representation of the current architecture, for example:

```text
component
  ↓
intent
  ↓
foundation
  ↓
token
```

Then show where you believe the problematic dependencies or abstractions are.

## 7. What is actually good

This is important.

Identify parts of the current refactor that we should **keep**.

I don't want an audit that assumes everything needs to be redesigned.

## 8. Recommended next step

Do not propose a giant rewrite.

Give me the **smallest sequence of corrective steps** you would take.

For example:

1. fix StyleX misuse
2. simplify one primitive
3. validate with current consumers
4. remove abstractions that are no longer needed
5. continue

But derive the actual sequence from your audit.

## 9. Questions / uncertainties

List anything you cannot confidently determine from the repository and that should be clarified before implementation.

---

# Strict rules for this session

- **Do not edit files.**
- **Do not generate replacement code.**
- **Do not refactor anything.**
- **Do not create new abstractions.**
- **Do not propose a complete rewrite.**
- **Do not assume the current architecture is correct simply because it already exists.**
- **Do not assume the previous refactor decisions are intentional.**
- **Do not treat TypeScript casts as evidence that an abstraction is correct.**
- **Do not treat generic flexibility as a virtue by itself.**
- **Prefer evidence from actual consumers/usages in the repository.**
- **When uncertain, say so.**

The goal of this session is simply:

> **Understand what we have built, identify where we have drifted, and establish a trustworthy map of what should change before writing more code.**

Only after this audit will we decide what to implement.
