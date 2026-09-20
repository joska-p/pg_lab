# Art Canvas — Decisions Log (append-only)

> Format: `D#` — date — status (decided / delegated / open / closed) — decision —
> rationale. Append at the bottom; never rewrite history.

## Recorded 2026-09-19 (Session 1 — foundation)

- **D1 — decided** — Store idiom = repo pattern (zustand `create<T>(() => …)` +
  plain `actions.ts`/`selectors.ts` functions), not the source's `createStore` +
  `useStore` hooks. Rationale: owner-confirmed; coherence with `mosaic-maker`.
- **D2 — decided** — `ErrorBoundary` adapted from `_TMP/error-boundary.tsx` into
  `@repo/ui` (StyleX; props `fallback`/`onError`/`showStack`/`style`), used by
  art-canvas. Rationale: owner-confirmed; shared widget, no local app copy.
- **D3 — decided** — Migration is **behavior-preserving**: shader/assembly/palette
  logic copied as-is, formatting only; only UI imports, store idioms, and packaging
  change. No redesign of the rendering. Rationale: port, not rewrite.
- **D4 — decided** — Keep the source layout for shared infra:
  `src/assembly`, `src/shaders`, `src/palettes`, `src/modules/<name>/` (self-contained
  modules). Rationale: source README rule; smallest useful change (coding-conventions § 2.5).
- **D5 — decided** — Tailwind + `@repo/tlc` dropped; keep minimal `src/style.css`
  (box-sizing, color-scheme dark, body reset). Rationale: `@repo/ui` (ShellWrapper)
  owns theming/environment.
- **D6 — decided** — Small stores (seed/manual/spirale) keep a single readable
  `store.ts`; atlas keeps its existing `store/{store,actions,selectors,types}.ts`
  split. Rationale: file-split only when readability demands (coding-conventions § 2.5).
- **D7 — decided** — Workflow reorg: the single working doc
  `docs/art-canvas-migration.md` is retired; per-package memory moves to
  `codex/art-canvas/` (STATUS/AUDIT/DECISIONS/SESSIONS), mirroring the glaze
  workflow (`codex/glaze/`). Rationale: owner requested the same workflow as glaze
  (which retired its own single working doc the same way).
- **D8 — open** — Remove `src/stores/appStore.tsx` (skeleton `theme` store, unused
  after migration). Recommendation: remove — dead code.
- **D9 — open** — Mode switcher widget in `App.tsx`: `Select<InputMode>` (source
  idiom) vs `Segmented<InputMode>` (used by pg_lab shell). Both exist in `@repo/ui`.
- **D10 — open** — `guilloche` module out of scope (contains only `refs.md`, no code).
  Keep the file, revisit when the module is actually built.
- **D11 — open** — Showcase the new `ErrorBoundary` in `apps/dev` (component-authoring
  § 2 requires a demo). Deferred to Step 4.

## Open questions

- D8 (appStore removal), D9 (mode switcher), D10 (guilloche), D11 (showcase) — all open.

## Resolved 2026-09-20 (Steps 3–4 verification)

- **D8 — closed** — `src/stores/appStore.tsx` removed (dead skeleton `theme` store, unused after migration).
- **D9 — decided** — Mode switcher = `Select<InputMode>` (source idiom) in `App.tsx`, options derived from the `EXPERIMENTS` record.
- **D11 — closed** — `ErrorBoundary` showcased in `apps/dev` showcase § 05 “resilience” (default fallback + custom `fallback` demos with throw/reset).
