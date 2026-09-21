# Playground Integration — Status (entry point for multi-session work)

> **Read this file first at the start of every session. Stop there.**
> Read a sibling file only when touching its domain (see _Read-when_ below).
>
> Language rule (repo): French for discussion, English for code/docs/specs.

## Goal

Decide (not yet implement) how `apps/playground` should handle:

1. **Navigation** — single "return to menu" model between experiments.
2. **Package assets** — `public/` files (e.g. `mol-demo` SDFs) break when
   imported as library. Need a repeatable pattern for all future mini-apps.

## Current state

- [x] **S0-plan — written 2026-09-21:** `STATUS.md` + `ANALYSIS.md` +
      `DECISIONS.md` + `SESSIONS.md` created under `codex/playground/`.
      Evidence-backed, no code changed.
- [x] **S1 — reproduce (2026-09-21):** both failures confirmed —
      `GET /molecules/cid-702.sdf → 404` in playground dev (owner-verified),
      `dist/` without `molecules/` after `vp -C apps/playground build`;
      navigation has no return path (`setPageName` only in `MenuPage`).
- [x] **S2 — navigation spike (2026-09-21):** host-owned fixed "← Menu"
      button (`App.tsx`, `setPageName("menu")`, outside `Suspense`);
      fallback is now neutral `LoadingFallback`, guests untouched. D4 recorded.
- [x] **S3 — asset spike (2026-09-21):** `mol-demo` SDFs moved
      `public/molecules/` → `src/assets/molecules/`; `loadMolecule` now resolves
      via lazy `import.meta.glob(..., { query: "?url" })`, no `baseUrl` fallback.
      Verified: mol-demo `check` + 47 tests green, playground `check` + `build`
      green, `dist/` emits base-aware `data:`/`.sdf` URLs, no `/molecules/` fetch.
      Pattern documented in `codex/docs/coding-conventions.md` §12.3.
- [ ] **S4 — RFC:** freeze D1 (navigation) + D2 (assets) in `DECISIONS.md`.

**Next action:** run S4 RFC (freeze D1 + D2, close track).

## Read-when

| Touching                  | Also read                   |
| ------------------------- | --------------------------- |
| navigation design         | `ANALYSIS.md` §2 + §4       |
| asset strategy / mol-demo | `ANALYSIS.md` §3 + §4       |
| new decision or doubt     | `DECISIONS.md`              |
| end of session            | update this + `SESSIONS.md` |

## Session-end protocol

1. Update _Current state_ + _Next action_ above.
2. Append one dated line to `SESSIONS.md`.
3. Append new decisions to `DECISIONS.md` (append-only, never rewrite).
4. Keep this file < 60 lines; push detail to siblings.
