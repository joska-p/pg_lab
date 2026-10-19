# Randomart audit — handoff

Entry point for resuming the coherence audit. The repository is the source of truth; read the
registry before touching anything.

## Goal

Make `randomart` coherent again (naming §2.1, dependency direction §2.4, core purity §1.2, no
duplication / dead code), without changing generator behaviour. `GENERATOR_VERSION` and the
generator snapshots must not move unless a change is explicitly decided.

## State

- `vp check` and `vp test` are green (328 passed / 10 skipped). Baseline confirmed.
- Step 1 is done: the mechanical rules are tooled and their first output is written up.
- No line under `packages/randomart/src` has been changed yet.

## Where things live

- **Findings registry (read this first):** [`randomart-audit-registry.md`](randomart-audit-registry.md)
  — quantified findings `A` (mechanical), `B` (decisions), `C` (refactor), `D` (docs).
- **Source audit:** `_TMP/Audit de coherence de randomart.md` (working doc, not in git).
- **Prior context:** [`randomart-coherence-plan.md`](randomart-coherence-plan.md),
  [`findings.md`](findings.md), [`randomart-config-knobs.md`](randomart-config-knobs.md).
- **Audit tooling:** `tools/audit/` (`oxlint.audit.jsonc`, `banned-words.mjs`, `run.mjs`), task
  `vp run audit` in the root `vite.config.ts`, dead-code config in `knip.json`.

## Next action

Run `vp run audit` from the repository root to see the current state, then start the **A batch**
from the registry:

1. A-07 / A-08 — delete verified dead code (3 symbols + `src/core/index.ts`).
2. A-01 → A-06 — rename / extension fixes, **one commit per item**.
3. After each item, `vp check && vp test` must stay green and `GENERATOR_VERSION` must not change.

Then move to `B` (decisions): B-01 (`core` → `renderer` test imports), B-03 (dataset/bench
crosstalk), B-04 (madge cycles), B-02 (barrel policy).

## Workflow rules

- French for discussion, English for code, docs and specs.
- One commit per correction category; no behaviour change.
- `vp run audit` rules stay in `tools/audit/` (non-gating) until the A batch is green, then get
  promoted to `tools/lint/` and wired into CI.
