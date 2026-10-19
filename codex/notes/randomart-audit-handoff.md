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
- **B batch done**: B-01 landed (`0b49486`); B-02 pruned every barrel (`08ec106` → `a098591`); B-03
  and B-04 are decided without code change (registry).
- The audit is fully green — layers, extensions, banned vocabulary, dead code and duplication all
  pass; cycles stay an informational warning (decision B-04). See the B batch table in the registry.
- **Rules promoted** (`fcccad1`): layers/purity/extensions are override rules in
  `tools/lint/randomart.ts` (enforced by `vp check`), the vocabulary script and the audit runner
  live in `tools/lint/`, and CI runs `vp run audit`.

## Where things live

- **Findings registry (read this first):** [`randomart-audit-registry.md`](randomart-audit-registry.md)
  — quantified findings `A` (mechanical), `B` (decisions), `C` (refactor), `D` (docs).
- **Source audit:** `_TMP/Audit de coherence de randomart.md` (working doc, not in git).
- **Prior context:** [`randomart-coherence-plan.md`](randomart-coherence-plan.md),
  [`findings.md`](findings.md), [`randomart-config-knobs.md`](randomart-config-knobs.md).
- **Audit tooling:** lint-backed gates in `tools/lint/randomart.ts` (run by `vp check`); the audit
  task `vp run audit` (root `vite.config.ts`) runs `tools/lint/banned-words.mjs`,
  `tools/lint/audit.mjs` (knip, jscpd; madge informational), dead-code config in `knip.json`.

## Next action

The coherence audit is closed, and both follow-ups are now done: **D — Documentation** (`f80c169`,
`0ed49b8`, `9082f18`, `a342694`, `3862ebb`) and **B-05 — Duplication** (`6d450af`, `f98ba04`,
`58d6727`, `98b2009`) — see the registry for both. `jscpd` reports 0 production clones. Nothing is
blocking.

## Workflow rules

- French for discussion, English for code, docs and specs.
- One commit per correction category; no behaviour change.
- The gates are promoted: layers/purity/extensions run through `vp check` (`tools/lint/randomart.ts`),
  and `vp run audit` (banned vocabulary, dead code, duplication) runs in CI. Keep both green.
