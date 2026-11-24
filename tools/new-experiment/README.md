# new-experiment

Vite+ generator for a new Experiment in the Workbench. It writes only the three files the registry loads: a manifest, a `Scene`, and optional `Controls`.

## Usage

```bash
vp create new-experiment -- --name my-experiment
```

`name` is the Experiment folder id: kebab-case, starting with a letter (for example `my-experiment`).

Vite+ runs local generators from `tools/`. When Bingo asks for the target directory, answer `../` so the files are written at the repository root. From there the generator produces exactly:

```text
apps/playground/src/experiments/my-experiment/
├── manifest.ts   ← export const experiment
├── Scene.tsx     ← export function Scene
└── Controls.tsx  ← export function Controls
```

No package manifest, HTML entry, Vite config, or store is created: Experiments are plain folders discovered by `import.meta.glob`.

After generation, edit the manifest and run `vp dev` from the repository root.
