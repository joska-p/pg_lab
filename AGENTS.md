# Playground: Recreational Coding Ecosystem

High-performance Monorepo powered by **Vite+** and **React 19** (React Compiler enabled: no manual `useMemo`/`useCallback`). State uses `useSyncExternalStore` and `useEffectEvent`. Python environment is managed by `uv`.

## Core Commands (Vite+)

Docs are local at `node_modules/vite-plus/docs` or online at https://viteplus.dev/guide/.

- `vp install` : Install dependencies.
- `vp check` : Format, lint, and type-check.
- `vp test` : Run tests.
- `vp run <script>` : Run package scripts or `vite.config.ts` tasks.

## Guidelines & Flow

- **Navigation**: Fast code search via `rg` (ripgrep) and `fd`.
- **Language**: French for discussions, English for code, docs, and specs.
- **SSOT**: Ecosystem conventions and docs live in `./codex/docs/`. Propose updates when patterns evolve.
