# Art Canvas — Status (entry point for multi-session work)

> **Read this file first at the start of every session. Stop there.**
> Read the other files in this folder only when you touch their domain
> (see _Read-when_ below) or before recording a new decision.
>
> Language rule (repo): French for discussion, English for code/docs/specs.

## Why this package exists (scope of the work)

- `@repo/art-canvas` — WebGL shader workshop container: an interactive canvas +
  module-per-idea architecture (spirale, seed, folded-space, atlas, manual) + seeded
  procedural shader assembly (`assembly/`, `shaders/`, `palettes/`).
- This project is a **migration/port** from the old monorepo's `@repo/tlc` UI onto
  pg_lab's `@repo/ui` (StyleX) + `@repo/glaze` (already present & compatible).
  **Behavior-preserving**: shaders and procedural logic are copied as-is; only UI
  imports, store idioms, and packaging change.
- Entry: standalone package `packages/art-canvas` (pattern: `packages/mosaic-maker`),
  independent from `apps/dev`. Reference migrated app: `mosaic-maker`.

## Non-negotiable rules (owner-confirmed)

1. **Behavior-preserving migration.** Shader/assembly/palette logic copied as-is;
   formatting only. No redesign of the rendering.
2. **No `@repo/tlc`, no tailwind.** All UI maps to `@repo/ui` (mapping table in
   `AUDIT.md` § 6); styles stay minimal (`src/style.css`).
3. **Store idiom = repo pattern**: zustand `create<T>(() => …)` + plain
   `actions.ts`/`selectors.ts` functions; modules self-contained under
   `src/modules/<name>/`.
4. **ErrorBoundary lives in `@repo/ui`** (adapted from `_TMP/error-boundary.tsx`,
   styled with StyleX); no local copy in the app.
5. Docs for this package live in `codex/art-canvas/` (this folder).

## Current state

- [x] Analysis + source copy + ErrorBoundary + workflow reorg (2026-09-19) —
      recorded in `SESSIONS.md`.
- [x] **Step 0 — foundation:** sources copied (74 files) from
      `_TMP/art-canvas-to-migrate/` into `packages/art-canvas/src/` (backup kept);
      `ErrorBoundary` added to `@repo/ui` (adapted from `_TMP/error-boundary.tsx`);
      `vp -C packages/ui check` → pass; skeleton `App.tsx` rewired (UI shell +
      ErrorBoundary, no module imports yet). D1–D7 recorded.
- [x] **Step 1 — baseline:** `vp -C packages/art-canvas check --fix` → formatting
      pass; `vp -C packages/art-canvas check` → 11 errors in 4 `*Controls.tsx`
      files (7× `@repo/tlc` unresolved + 4× implicit `any` downstream). No other
      tlc refs; stores still old idiom (Step 3).
- [x] **Step 2 — infra:** verified tlc-free + type-clean (errors only in 4
      `*Controls.tsx`); glaze API compatible (no break); `folded-space` clean.
      Zero file changes (format done Step 1).
- [ ] **Step 3 — controls + stores:** migrate `*Controls.tsx` module by module
      (spirale → seed → atlas → manual; folded-space has none) using `AUDIT.md` § 6/§ 7;
      convert every module store to the repo pattern; then wire the mode switcher +
      module mounting in `App.tsx`.
- [ ] **Step 4 — docs & finishing:** package `README.md`; showcase `ErrorBoundary`
      in `apps/dev`; remove `_TMP/art-canvas-to-migrate` once committed;
      `vp check` + `vp run -r build` + dev smoke-test; commit.

**Next action:** Step 3 — controls + stores (spirale → seed → atlas → manual)
per `AUDIT.md` § 6/§ 7, then mode switcher + module mounting in `App.tsx`.

## Read-when

| Touching                                | Also read                                  |
| --------------------------------------- | ------------------------------------------ |
| any `*Controls.tsx` or `@repo/ui` usage | `AUDIT.md` § 6 (mapping) + § 7             |
| any store / zustand                     | `AUDIT.md` § 7, `DECISIONS.md` D1          |
| `assembly/`, `shaders/`, `palettes/`    | `AUDIT.md` § 4 (infra)                     |
| `App.tsx`, shell wiring                 | `AUDIT.md` § 8.3                           |
| New decision or doubt                   | `DECISIONS.md`                             |
| End of session                          | update this file + 1 line in `SESSIONS.md` |

## Session-end protocol

1. Update _Current state_ checklist and _Next action_ (top of this file).
2. Append one line to `SESSIONS.md`.
3. Record any new decision in `DECISIONS.md` (append-only).
4. Keep this file short: push detail to `AUDIT.md`/`DECISIONS.md`, never back here.
