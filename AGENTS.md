# Playground: Recreational Coding Ecosystem

High-performance Monorepo powered by **Vite+** and **React 19**.
Python environment is managed by `uv`.

## Core Commands (Vite+)

Docs are local at `node_modules/vite-plus/docs` or online at https://viteplus.dev/guide/.

- `vp install` : Install dependencies.
- `vp check --fix` : Format, lint, and type-check.
- `vp test` : Run tests.
- `vp run <script>` : Run package scripts or `vite.config.ts` tasks.
- `vp run ready` (root `ready` script) : Full validation — `vp check && vp test && vp run -r --concurrency-limit 1 build`.

## Workspace Model

- **Package manager SSOT** is `pnpm-workspace.yaml` (catalog + `vite@*`/`vitest@*` overrides). Root `package.json` keeps only the `workspaces` list (Bun compat) — no duplicated catalog/overrides.
- **Strict TS baseline** is `tsconfig.base.json`, extended by every package. Apps use the split `tsconfig.app.json` (bundler) + `tsconfig.node.json` (nodenext) pattern; pack-libs use a single typecheck-only config (`vp pack` owns emit/dts via tsgo).
- **Dual source/dist libs** (`ui`, `glaze`, `glaze3d`, `worker-pool`): each export maps `source` → `./src`, `types`/`import` → `./dist`. Internal runs resolve sources via the `source` condition (`customConditions` in `tsconfig.base.json`, `resolve.conditions` in app configs); external consumers fall through to dist. Required because apps compile workspace sources with the shared StyleX preset.
- **Caveats**: TS 7 (tsgo) drops `customConditions`, so `tsc -b` typechecks apps against packed `dist` types — always build libs first (`vp run -r` orders this via workspace deps). If parallel builds get SIGKILLed (exit 137), rerun with `--concurrency-limit 1`.
- **`vp pack` entries** are explicit file lists per package (never globs over `src/`, which would bundle `*.test.ts`). Keep `pack.entry` and the `exports` map in sync when adding public files.

## Guidelines & Flow

- **Coding conventions**: codex/docs/coding-conventions.md.
- **Navigation**: Fast code search via `rg` (ripgrep) and `fd`.
- **Language**: French for discussions, English for code, docs, and specs.
- **SSOT**: Ecosystem conventions and docs live in `./codex/`. Propose updates when patterns evolve.
