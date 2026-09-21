# Playground Integration — Decisions (append-only)

> Record only decided facts. Never rewrite lines — append corrections as new
> entries with date. Format: `D#: date — statement (evidence / session)`.

- D1 (OPEN): navigation model — pending S2 spike (options A/B/C in
  `ANALYSIS.md` §2). Owner leans single "return" button to menu.
- D2 (OPEN): package asset pattern — pending S3 spike (options 1–5 in
  `ANALYSIS.md` §3). Hypothesis: `?url` + `import.meta.glob`, to confirm.
- D3 2026-09-21 — scope: this track decides, does not implement. Implementation
  becomes a follow-up multisession project after S4 RFC (owner request).
- D4 2026-09-21 — S2 navigation: host-owned fixed "← Menu" button
  (`apps/playground/src/App.tsx`, `setPageName("menu")`, rendered outside
  `Suspense` so it stays visible during lazy load); `Suspense` fallback is a
  neutral loading stage, no longer `MenuPage`; guests stay host-agnostic
  (no playground import in packages). Hash/history routing deferred to S4.
  Verified: `vp -C apps/playground check` + `build` green.
- D5 2026-09-21 — S3 assets decided + implemented (closes D2 OPEN): single pattern
  `src/assets/` + lazy `import.meta.glob(..., { query: "?url", import: "default" })`
  keyed by filename, no `baseUrl` fallback (`packages/mol-demo/src/lib/molecules.ts`,
  `src/assets/molecules/*.sdf`); tests import `?raw` from new path. Verified:
  mol-demo `check` + 47 tests green, playground `check` + `build` green with
  base-aware URLs (`data:` inline for small SDFs, `/pg_lab/assets/*.sdf` for large).
  Convention frozen in `codex/docs/coding-conventions.md` §12.3 for all future mini-apps.
- D6 2026-09-21 — S4 RFC final (closes track): D1 CLOSED on option A minimal
  (D4 stands: host-owned fixed "← Menu" in `apps/playground/src/App.tsx`, neutral
  `LoadingFallback`, guests host-agnostic). Hash (B) / history (C) routing explicitly
  deferred until a real deep-link need appears (§1.5, no abstraction before problem);
  unmount-on-return + per-guest theme ownership accepted as-is. D2 CLOSED (D5 stands,
  owner runtime-verified on playground dev 2026-09-21: no 404, molecules load).
  Option 5 (shared `@repo/assets`) deferred until a second package needs it.
  Note: D3 said "decides, does not implement" but owner ordered implementation
  of S2/S3 spikes in-session; both landed + verified, so track closes as decided+done.
