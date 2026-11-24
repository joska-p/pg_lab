# Playground: Recreational Coding Ecosystem

High-performance Monorepo powered by **Vite+** and **React 19**.

- `vp ready` : Canonical full gate (`vp check && vp test && vp run -r build`).
- `vp check --fix` : Format, lint, and type-check. Docs are local at `node_modules/vite-plus/docs`.
- `vp -C <path> <command>` : Run task in a specific package. (ex: `vp -C packages/randomart check`).

## Guidelines & Flow

- **Before starting any task**: Make sure to have a well define scope and that you understand the underlying goal.
- **Coding conventions**: codex/docs/conventions/README.md.
- **Vocabulary**: when clarifying or renaming a project concept, use the `domain-modeling` skill; the glossary is `codex/docs/GLOSSARY.md` (§2.1.8, §2.1.9).
- **Tooling**: `uv`, `rg`, `fd` `jq`.
- **Language**: French for discussions, English for code, docs, and specs.
- **SSOT**: Ecosystem conventions and docs live in `./codex/`. Propose updates when patterns evolve.
- **UI SDK**: Before using `ui-sdk`, follow the `ui-sdk` skill if it's installed, and read `packages/ui/node_modules/@ui-sdk/react/docs/llms.txt`.
    - To build a new component, also search `node_modules/@ui-sdk/react/docs/core.md` by heading, and read `rendering.md` next to it.
