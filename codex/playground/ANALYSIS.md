# Playground Integration — Analysis

> Companion to `STATUS.md` (entry point). Durable evidence + options.
> Record only verified facts with `file:line` refs. No fixes here.

## 1. Context

`apps/playground` (`@repo/playground`) is the host shell that lazy-imports
mini-apps as libraries:

- `apps/playground/package.json:12-16` — deps on `art-canvas`,
  `mol-demo`, `mosaic-maker` via `workspace:*`.
- `apps/playground/src/App.tsx:24-36` — `EXPERIMENTS` map, each entry
  `lazy(() => import("@repo/<pkg>/App"))`.
- `apps/playground/vite.config.ts:10` — `base: "/pg_lab"`.
- `apps/playground/public/` — empty (verified 2026-09-21).
- `apps/playground/index.html:4` — favicon `/favicon.svg` (absolute, breaks
  under `/pg_lab` base — same class of bug as §3).

## 2. Issue 1 — navigation

Current mechanism (`apps/playground/src/stores/appStore.tsx:1-30`):

- zustand store `{ theme, pageName }`, `PageName = "menu" | "art-canvas" |
"mosaic-maker" | "mol-demo"`.
- `App.tsx:77-91` — `const { Page } = EXPERIMENTS[pageName]`, wrapped in
  `<Suspense fallback={<MenuPage />}>`.
- `App.tsx:43-74` — `MenuPage` contains the only navigation UI: a
  `Select<PageName>` inside `ControlPanel > ControlSection title="Navigation"`.

Observed gaps:

1. No "return" affordance inside experiments. Once `pageName != "menu"`,
   the experiment's own `App` (e.g. `mol-demo/src/App.tsx:16-75`) renders
   its own `ShellWrapper` + `ControlPanel` with no knowledge of the host.
2. `Suspense fallback={<MenuPage />}` conflates loading state with
   navigation destination — a slow import flashes the menu + its controls.
3. No URL: refresh / deep-link / browser back always lands on `menu`
   (store is in-memory, default `"menu"`). No sharable experiment links.
4. Owner intent (2026-09-21 request): single "return" button to menu page,
   decision deferred — wants a principled model, not a quick patch.

Options to spike in S2 (see §4 for criteria):

- **A. Minimal:** host renders a persistent header/return button above
  `<Page />` (`setPageName("menu")`). Zero routing. Keeps zustand.
- **B. Hash routing:** `#/mol-demo` ↔ `pageName` sync. Sharable, static-host
  friendly, works under `/pg_lab` base without server rewrites.
- **C. History routing:** `react-router` / `wouter` with `basename="/pg_lab"`.
  Clean URLs but needs preview-server fallback config + per-package route
  isolation.
- Cross-cutting: preserve experiment state on return? (unmount vs hide),
  who owns theme (host vs guest both own one today), `Suspense` fallback
  should be a spinner not `MenuPage`.

## 3. Issue 2 — package `public/` assets

Failure chain (verified by reading, to reproduce in S1):

- `packages/mol-demo/public/molecules/*.sdf` — 6 files (e.g. `cid-702.sdf`).
- `packages/mol-demo/src/lib/molecules.ts:72-80` — `loadMolecule(entry,
isMobile, baseUrl = "/molecules/")` does
  `fetch(\`${baseUrl}${entry.file}\`)`.
- `packages/mol-demo/package.json:6-10` — `exports: { "./App": .../src/App.tsx }`.
  Host imports source, **not** the built `dist/`. Vite never merges the
  guest's `public/` into the host's `public/`.
- Hence in playground dev/build, `fetch("/molecules/cid-702.sdf")` 404s
  (and would also ignore `base: "/pg_lab"` → should be `/pg_lab/molecules/`).
- Same latent pattern: `packages/mosaic-maker/public/{favicon.svg,icons.svg}`.

Candidate strategies to spike in S3:

| #   | Strategy                                                       | How                                                                                   | Pros                                                           | Cons                                                                                 |
| --- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| 1   | `src/assets` + `?url` / `?raw` imports                         | Move SDFs under `src/`, `import url from "./assets/x.sdf?url"`; registry holds URLs   | Bundled + hashed, base-aware, works as library, no host config | Touches `mol-demo` source + tests; N files become N imports (use `import.meta.glob`) |
| 2   | Host copies guest `public/`                                    | `cp packages/*/public/* apps/playground/public/` at build or vite plugin              | Zero guest change                                              | Manual sync, collisions (`favicon.svg` × N), breaks package standalone story         |
| 3   | Fetch with `import.meta.env.BASE_URL` + configurable `baseUrl` | `loadMolecule(e, m, \`${import.meta.env.BASE_URL}molecules/\`)` + host provides files | Fixes `/pg_lab` prefix; keeps lazy fetch                       | Still needs files in host `public/` — doesn't solve merge problem alone              |
| 4   | Self-contained JS module                                       | Embed SDF text as `*.ts` string exports                                               | Zero fetch, deterministic, testable                            | Bundle bloat (all 6 always loaded), loses streaming/lazy benefit                     |
| 5   | Shared asset package                                           | `@repo/assets` with `?url` exports consumed by all                                    | One pattern for all future apps                                | New package + convention to document and enforce                                     |

Likely outcome (hypothesis, to confirm in S3): **1 (+3 for base)** —
`?url` via `import.meta.glob` keeps per-molecule lazy fetch, is base-aware,
and survives library import. But S3 must measure before freezing.

## 4. Decision criteria (for S4 RFC)

- Navigation: one obvious return path; no dead-ends; deep-linkable if cheap;
  guest apps stay host-agnostic (no `import playground/store` inside packages);
  `Suspense` fallback never masquerades as a page; follows
  `codex/docs/coding-conventions.md` §1.5 (no abstraction before problem).
- Assets: works in (a) package standalone `dev`, (b) playground `dev`,
  (c) playground `build` under `/pg_lab`; no filename collisions across
  packages; no manual copy step; minimal per-new-app boilerplate.
- Both: document the chosen pattern in `codex/docs/` if it becomes a repo
  convention (SSOT rule in `AGENTS.md`).

## 5. S1 reproduce checklist (next session)

```text
vp -C apps/playground dev
  → click Select to mol-demo → open devtools network → expect 404 /molecules/*.sdf
  → observe no return button; Select only exists on menu page
  → refresh on mol-demo → expect reset to menu (store not persisted)
vp -C apps/playground build && vp -C apps/playground preview
  → repeat; also check /pg_lab/ prefix handling
vp -C packages/mol-demo dev
  → same flow works (control: files served from its own public/)
rg "from \"/molecules" packages/ ; rg "baseUrl" packages/mol-demo/src
rg "setPageName|usePageName" apps/playground packages --glob '!node_modules'
```

Pass = both failures captured as console/network output pasted into SESSIONS log.
Do not fix in S1.
