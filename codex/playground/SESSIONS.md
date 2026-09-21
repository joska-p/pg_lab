# Playground Integration — Sessions (append-only)

> One dated line per session. What was verified, not what was intended.

- 2026-09-21 — S0-plan: created `STATUS.md` + `ANALYSIS.md` + `DECISIONS.md` + `SESSIONS.md` from repo evidence (no code changed). Next: S1 reproduce.
- 2026-09-21 — S1: reproduce done. Static: `setPageName` only in `apps/playground/src/App.tsx:62` (no return path); `loadMolecule` defaults `baseUrl="/molecules/"` (`molecules.ts:75`), called bare in `moleculeStore.tsx:46`; playground `dist/` has no `molecules/` vs mol-demo `dist/` has 6 SDFs. Runtime (owner): `GET /molecules/cid-702.sdf → 404` on playground dev `:5173`. No code changed.
- 2026-09-21 — S2: navigation spike done. `App.tsx` now renders fixed "← Menu" when `pageName !== "menu"` + neutral loading fallback. `vp -C apps/playground check` + `build` green. Visual check on dev server left to owner.
- 2026-09-21 — S3: asset spike implemented. `public/molecules/*.sdf` → `src/assets/molecules/*.sdf`; `molecules.ts` uses lazy `import.meta.glob` `?url` map, `baseUrl` param removed (no fallback); `molecules.test.ts` imports from new path. Verified: `vp -C packages/mol-demo check` + `test` (47 passed) green; `vp -C apps/playground check` + `build` green with base-aware asset URLs. Pattern documented in `codex/docs/coding-conventions.md` §12.3. Next: S4 RFC.
- 2026-09-21 — S4: RFC frozen (D6). D1 minimal navigation stands, routing deferred; D2 asset pattern stands, owner-verified on playground dev (no 404). Track closed.
