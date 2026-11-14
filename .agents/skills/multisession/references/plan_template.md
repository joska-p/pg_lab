# <Project / Feature> — Multisession Plan

**Status:** Session 1 pending (YYYY-MM-DD).
**Entry point:** read this file first in every session.
**Detailed analysis:** `_TMP/<project>/analyse.md` (reference only; do not duplicate it here).

---

## Goal

<Concise summary of the architectural objective, scope boundaries, and core principles.>

- <Principle 1>
- <Principle 2>
- <Principle 3>

---

## Current state

- Initial baseline verified (`vp check`, test suite).
- <Chronological list of completed deliverables added after each session>.

---

## Decisions

| Topic     | Decision                        |
| --------- | ------------------------------- |
| <Topic 1> | <Agreed architectural decision> |
| <Topic 2> | <Agreed architectural decision> |
| <Topic 3> | <Agreed architectural decision> |

---

## Session plan

### Session 1 — <Session 1 Title>

**Intent:** <Why this session exists, what problem it isolates>.

**Deliverables:**

- <Deliverable 1>
- <Deliverable 2>
- <Deliverable 3>

**Verify:** `<exact CLI verification command>`

---

### Session 2 — <Session 2 Title>

**Intent:** <Why this session exists>.

**Deliverables:**

- <Deliverable 1>
- <Deliverable 2>

**Verify:** `<exact CLI verification command>`

---

## Guardrails

- <Negative constraint 1: e.g. Do not add branded types>
- <Negative constraint 2: e.g. Do not build speculative abstractions>
- <Negative constraint 3: e.g. At the end of each session, update this file>

---

## Useful commands

```bash
vp -C packages/<target> check
vp -C packages/<target> test
vp check
vp test
```

---

## Next action

Start **Session 1 — <Session 1 Title>**.
