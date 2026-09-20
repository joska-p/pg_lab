---
name: Multisession
description: Split a large task across independent restartable sessions using minimal file-based memory. Use when work spans multiple sessions, risks filling the context window, or needs handoff between sessions (or models). The agent records WHAT to accomplish in files so no session needs the full detail.
---

# Multisession work

Split big work into independent sessions. Each session restarts from files
alone — never from carried-over context. The agent needs to know WHAT to
accomplish, not every detail.

## Invariants (always apply, any project)

1. **One entry point, read first.** A single short file at a known path.
   Every session starts by reading it — and only it.
2. **Entry point holds: goal, current state, next action.** Nothing else.
   Keep it short (~60 lines max). Push all detail into sibling files.
3. **Append-only memory.** Decisions and per-session outcomes are appended,
   never rewritten — history must survive, contradictions included.
4. **End-of-session ritual (mandatory).** Before finishing: update state +
   next action in the entry point, append one dated line to the session log,
   record new decisions.
5. **Evidence over memory.** Record only verified facts (command outputs,
   `file:line` refs). Never reconstruct detail from memory — re-read the
   source. Mark a step done only when verified.

## Agent freedom (adapt per project)

- **File layout is yours.** Choose names and splits that fit the work: a
  migration may need an audit + mapping; a feature may need spec + plan; a
  research spike may need findings + open questions. One proven shape is an
  entry point (`STATUS.md`) plus an analysis file, a decisions log, and a
  session log — adopt it, simplify it, or invent better.
- **Step granularity is yours.** Each step must fit in one session and end in
  a verifiable state (a command green, a file written, a decision recorded).
- **Preparation depth is yours.** Do the analysis the project demands, no
  more. Small tasks may need only the entry point file.

## Session start

1. Read the entry point. Stop there.
2. Read a sibling file only when touching its domain.
3. If the entry point is missing or stale, rebuild it from the repo
   (evidence first) before acting.

## Session end

1. Update the state + next action in the entry point.
2. Append one dated line to the session log.
3. Append new decisions (append-only).
4. Commit if the repo workflow expects it.

## Anti-patterns

- Dumping everything into the entry point (unreadable → defeats the purpose).
- Rewriting history instead of appending (loses contradictions).
- Recording intentions as done (verified only).
- Carrying full detail across sessions "just in case" (that is what files
  are for).
- Ending a session without updating the entry point (next session starts blind).
