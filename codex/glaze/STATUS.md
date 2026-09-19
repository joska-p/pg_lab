# Glaze — Status (entry point for multi-session work)

> **Read this file first at the start of every session. Stop there.**
> Read the other files in this folder only when you touch their domain
> (see _Read-when_ below) or before recording a new decision.
>
> Language rule (repo): French for discussion, English for code/docs/specs.

## Why this package exists (scope of the work)

- `@repo/glaze` — personal graphic toolkit (Canvas2D + WebGL2 + React bindings).
- **Monorepo-only**: no external consumers; deep imports are fine internally.
  This is a **cleanup/reorg project** (structure, bugs, maintainability),
  NOT an API-hygiene project. No consumer = no urgency to seal anything.
- Entry point: NONE (no `src/index.ts`, no `exports` field — deliberate).
  `exports` will be added to `package.json` **only after** the reorg is done.

## Non-negotiable rules (owner-confirmed)

1. **No barrel file** — `src/index.ts` forbidden; plain modules, direct deep imports.
2. **No `exports` in `package.json` until the reorg is finished.**
3. **No god-surface** — `CpuSurface`/`GpuSurface` compose from `core/` primitives;
   no shared draw base, no merged Cpu/Gpu class. Max 2 surface types — one-off
   duplication beats premature abstraction.
4. **Tests reintroduced deliberately per module** during the reorg (old ones were
   deleted 2026-09-19); no separate "test phase".
5. Docs for this package live in `codex/glaze/` (this folder).

## Current state

- [x] Read-only analysis + critical review (2026-09-19) — archived in `AUDIT.md`.
- [x] **Step 1 — baseline:** `vp check` → pass (34 files formatted, no lint/type
      errors in 32 files); `vp test` → no test files (exit 1). Recorded in `SESSIONS.md`.
- [x] **Step 2 — defects:** A/B/F verified as real bugs and fixed, one test reintroduced
      per defect (A→`CpuSurface.test.ts`, B→`StateBuffer.test.ts`, F→`color.test.ts`);
      `vp test` 13/13 ✓, `vp check` ✓. D12–D13 recorded.
- [ ] **Step 3 — structural reorg:** `core/shapes.ts` (+ `Rectangle`/`ViewBounds`
      rename), split `core/types.ts`, dedupe surface configs, move React internals
      next to `surfaceStack.ts`.
- [ ] **Step 4 — light sealing (hygiene only):** private/opaque `gl`/`context`;
      inject `now/schedule/dpr/document` where trivial (SSR-friendly).
- [ ] **Step 5 — exports:** add progressive per-file `exports` to `package.json`.

**Next action:** Step 3 — structural reorg (`core/shapes.ts` + `Rectangle`/`ViewBounds`
rename, split `core/types.ts`, dedupe surface configs, move React internals).

## Read-when

| Touching                              | Also read                                  |
| ------------------------------------- | ------------------------------------------ |
| `core/`, `cpu/shapes/`, `gpu/shapes/` | `AUDIT.md` §2–§3 (types + disorder)        |
| `gpu/`                                | `AUDIT.md` §4 (leakage) + §4d (defects)    |
| `react/types.ts`, `surfaceStack.ts`   | `AUDIT.md` §4c                             |
| New decision or doubt                 | `DECISIONS.md`                             |
| End of session                        | update this file + 1 line in `SESSIONS.md` |

## Session-end protocol

1. Update _Current state_ checklist and _Next action_.
2. Append one line to `SESSIONS.md`.
3. Record any new decision in `DECISIONS.md` (append-only).
4. Keep this file short: push detail to `AUDIT.md`/`DECISIONS.md`, never back here.
