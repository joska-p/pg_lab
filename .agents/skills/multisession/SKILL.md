---
name: multisession
description: Prepare, structure, and execute large tasks across multiple stateless agent sessions. Defines the standard entry-point PLAN.md workflow, pre-flight deep dive analysis, per-session protocol, and crash resilience rules.
---

# Multisession Workflow Playbook

Use this skill whenever a task is too large, complex, or risky to execute in a single agent turn/session (e.g., library migrations, multi-package refactors, architectural evolutions).

The goal is to make session starts **instant, stateless, and crash-resilient**, relying strictly on the repository and a persistent entry point rather than conversation memory.

---

## 1. Core Principles

1. **Stateless Continuity**: Any agent must be able to crash or wake up in a fresh session and know immediately what to do without reading conversation history.
2. **The Repository is Ground Truth**: Git history and code are the reality. Planning files track intent, current state, and next actions.
3. **Decoupled Increments**: Work is split into discrete sessions. Each session has a clear intent, concrete deliverables, and rigorous verification commands.
4. **Negative Guardrails**: Explicitly state what NOT to build, what abstractions to reject, and what debts must not be introduced.

---

## 2. The Standard Two-File Setup

Before touching code on a large task, create a workspace directory (e.g. `_TMP/<project>/`):

```
_TMP/<project>/
├── analyse.md    # Phase 0: Deep-dive diagnostic, technical audit, and trade-offs
├── PLAN.md       # The living Single Source of Truth and entry point for all sessions
└── prompt.md     # Optional: ready-to-run prompt for the next session
```

> [!IMPORTANT]
> Keep `_TMP/` gitignored so planning files can be edited and referenced across sessions without polluting repository commits.

---

## 3. Phase 0: Deep-Dive Analysis (`analyse.md`)

Before writing a session plan, perform a rigorous discovery phase:

1. **Baseline Health Check**: Run `vp check` / tests to confirm the starting state is green.
2. **Usage & Dependency Audit**: Search all call sites across the monorepo (`rg`, AST, package.json).
3. **Contract Gap Analysis**:
    - Compare source vs target APIs.
    - Scrutinize units and coordinates (e.g. CSS pixels vs physical/device pixels, aspect ratios).
    - Identify lifecycle subtleties (context loss/restore, resize, resource tracking, subscription cleanup).
4. **Categorize Findings**:
    - **Blocking**: Must be resolved before consumer can function.
    - **Cross-cutting Debts**: Cleanups that should be fixed at the source.
    - **Explicit Non-goals**: Things that look tempting to build but must be deferred.

See detailed template in [references/analysis_template.md](./references/analysis_template.md).

---

## 4. Phase 1: Structuring `PLAN.md`

`PLAN.md` is the **obligatory entry point** read at the start of every session. It must contain:

- **Header**:
    - `Status`: Current session progress and date.
    - `Entry point`: Reminder that this file is read first.
    - `Detailed analysis`: Link to `analyse.md`.
- **Goal**: High-level intent and core architecture principles.
- **Current state**: Chronological log of what landed session-by-session.
- **Decisions**: Table of key architectural choices and agreed conventions.
- **Session plan**: Sessions 1 to N, each structured as:
    - `### Session X — <Title> [— ✅ complete (YYYY-MM-DD)]`
    - `**Intent:**` Why this session exists.
    - `**Deliverables:**` Bullet list of files and modifications.
    - `**Verify:**` Exact shell commands or test scenarios.
- **Guardrails**: Explicit negative constraints.
- **Useful commands**: Copy-pasteable CLI commands.
- **Next action**: Explicit pointer to the active session.

See detailed template in [references/plan_template.md](./references/plan_template.md).

---

## 5. Session Execution Protocol

During each session, follow this strict lifecycle:

### Step 1: Ingestion

- Read `_TMP/<project>/PLAN.md` first.
- Read files mentioned in the current session's deliverables.
- Check `git status` to verify working tree.

### Step 2: Implementation

- Implement **only** the deliverables assigned to the current session.
- Respect guardrails (do not add speculative features or branded wrappers).

### Step 3: Verification

- Run the targeted package check & tests (`vp -C packages/<pkg> check`, `vp -C packages/<pkg> test`).
- Run global repository validation (`vp check`, `vp test`).
- Fix any formatting/lint issues immediately (`vp check --fix`).

### Step 4: Close Session & Handoff

- Update `_TMP/<project>/PLAN.md`:
    - Update `Status` header.
    - Append completed deliverables to `Current state`.
    - Mark session header with `— ✅ complete (date)`.
    - Update `Next action` to point to Session N+1 (or mark closed if final).
- Commit code changes to git:
    - Format: `<type>(<scope>): <summary> (session N)`
    - Do NOT commit `_TMP/` files.
- (Optional) Prepare `_TMP/<project>/prompt.md` with instructions for the next agent turn.

See prompt template in [references/session_prompt_template.md](./references/session_prompt_template.md).
