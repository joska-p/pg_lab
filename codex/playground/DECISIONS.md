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
