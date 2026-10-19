# Randomart audit — handoff

Entry point for resuming the coherence audit. The repository is the source of truth; read the
registry before touching anything.

## Goal

Make `randomart` coherent again (naming §2.1, dependency direction §2.4, core purity §1.2, no
duplication / dead code), without changing generator behaviour. `GENERATOR_VERSION` and the
generator snapshots must not move unless a change is explicitly decided.

## State

- `vp check` and `vp test` are green (328 passed / 10 skipped for randomart; 481 / 10 repo-wide).
  Baseline confirmed.
- **A batch done** (A-01 → A-08, one commit per item, no behaviour change, `GENERATOR_VERSION`
  unchanged): see the table in the registry (`randomart-audit-registry.md`, "Progress").
- The audit now passes for import extensions, banned vocabulary and dead files. Two gating checks
  stay red _by decision_: layers (B-01) and dead code (B-02).

## Where things live

- **Findings registry (read this first):** [`randomart-audit-registry.md`](randomart-audit-registry.md)
  — quantified findings `A` (mechanical), `B` (decisions), `C` (refactor), `D` (docs).
- **Source audit:** `_TMP/Audit de coherence de randomart.md` (working doc, not in git).
- **Prior context:** [`randomart-coherence-plan.md`](randomart-coherence-plan.md),
  [`findings.md`](findings.md), [`randomart-config-knobs.md`](randomart-config-knobs.md).
- **Audit tooling:** `tools/audit/` (`oxlint.audit.jsonc`, `banned-words.mjs`, `run.mjs`), task
  `vp run audit` in the root `vite.config.ts`, dead-code config in `knip.json`.

## Next action

Decide the B items in this order — B-01 first, since it is a two-file structural choice that also
unblocks the layers gate:

1. **B-01** — `core/compiler/*.test.ts` importing `renderer/contract.ts` (extract the GLSL contract
   into `core/compiler/`, or allow-list the test-only exception).
2. **B-03** — dataset / bench crosstalk (`sampleGrammars` & friends).
3. **B-04** — cycles: keep madge informational, ignore type-only edges, or move to
   `dependency-cruiser`.
4. **B-02** — barrel policy, then the 108 knip symbols it decides.

Once the two red gates are resolved, promote the audit rules from `tools/audit/` to `tools/lint/`
and wire `vp run audit` into CI.

## Workflow rules

- French for discussion, English for code, docs and specs.
- One commit per correction category; no behaviour change.
- `vp run audit` rules stay in `tools/audit/` (non-gating) until A is green **and** the two red
  gates are decided (B-01, B-02); then they get promoted to `tools/lint/` and wired into CI.
