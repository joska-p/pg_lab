# Playground: Recreational Coding Ecosystem

High-performance Monorepo powered by **Vite+** and **React 19**.

- `vp check --fix` : Format, lint, and type-check. Docs are local at `node_modules/vite-plus/docs`.
- `vp -C <path> <command>` : Run task in a specific package. (ex: `vp -C packages/randomart check`).

## Guidelines & Flow

- **Before starting any task**: Make sure to have a well define scope and that you understand the underlying goal.
- **Coding conventions**: codex/docs/conventions/README.md.
- **Vocabulary**: when clarifying or renaming a project concept, use the `domain-modeling` skill; the glossary is `codex/docs/GLOSSARY.md` (§2.1.8, §2.1.9).
- **Tooling**: `uv`, `rg`, `jq`; list files with `fd . <dir>` (pattern comes first).
- **Language**: French for discussions, English for code, docs, and specs.
- **SSOT**: Ecosystem conventions and docs live in `./codex/`. Propose updates when patterns evolve.
