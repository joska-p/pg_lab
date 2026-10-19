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
- B-01 landed (`0b49486`): the GLSL contract lives in `core/compiler`; B-03 and B-04 are decided
  without code change (registry).
- The audit passes for layers, extensions, banned vocabulary and duplication. **Dead code (B-02,
  barrel pruning) is the last red gate.**

## Where things live

- **Findings registry (read this first):** [`randomart-audit-registry.md`](randomart-audit-registry.md)
  — quantified findings `A` (mechanical), `B` (decisions), `C` (refactor), `D` (docs).
- **Source audit:** `_TMP/Audit de coherence de randomart.md` (working doc, not in git).
- **Prior context:** [`randomart-coherence-plan.md`](randomart-coherence-plan.md),
  [`findings.md`](findings.md), [`randomart-config-knobs.md`](randomart-config-knobs.md).
- **Audit tooling:** `tools/audit/` (`oxlint.audit.jsonc`, `banned-words.mjs`, `run.mjs`), task
  `vp run audit` in the root `vite.config.ts`, dead-code config in `knip.json`.

## Next action

**B-02 — prune the barrels** so every exported symbol has a consumer (policy "export only what is
consumed", decided in the registry), moving the shared types per the new §2.6 placement rule
(`codex/docs/conventions/02-typescript.md`, "Where a type lives"). Work by module: `core/*`,
`renderer/`, `stores/`, `components/`, one commit per barrel, `vp check && vp test` green and
`GENERATOR_VERSION` unchanged after each.

Then promote the audit rules from `tools/audit/` to `tools/lint/` and wire `vp run audit` into CI.

## Workflow rules

- French for discussion, English for code, docs and specs.
- One commit per correction category; no behaviour change.
- `vp run audit` rules stay in `tools/audit/` (non-gating) until A is green **and** the two red
  gates are decided (B-01, B-02); then they get promoted to `tools/lint/` and wired into CI.
