# randomart

A generative-art workshop: random math expressions become abstract images, still or animated.
You explore grammars more than seeds.

    grammar + seed → expression → GLSL → image

This package is the app shell. The project is split into four packages:

| package                                                     | role                                                          |
| ----------------------------------------------------------- | ------------------------------------------------------------- |
| [`@repo/randomart-core`](../randomart-core/README.md)       | pure TypeScript domain: grammar, generator, compiler, formats |
| [`@repo/randomart-lab`](../randomart-lab/README.md)         | one-artwork workspace: live canvas, grammar controls, history |
| [`@repo/randomart-bench`](../randomart-bench/README.md)     | exploration: candidate lots, notebook, ratings                |
| [`@repo/randomart-dataset`](../randomart-dataset/README.md) | offline survey: dataset, features, PCA, contact sheet         |
| `@repo/randomart`                                           | this thin composer                                            |

The four library packages are source-only: consumers import exact module paths, with no build
step.

## Commands

    vp dev       # app
    vp build     # typecheck + production build
    vp check     # format, lint, typecheck

Core tests and the dataset pipeline run from their own packages; see the links above.

## Layout

- `src/App.tsx`: composes the shell
- `src/stores/modeStore.ts`: the active mode (Lab, History, Bench)
- `src/components/Controls.tsx`: mode switch and the Lab/History/Bench panels
- `src/components/Scene.tsx`: renders the Lab canvas or the Bench stage, and registers the
  Bench → Lab handoff
- `src/main.tsx`, `src/style.css`: entry point

`Scene` picks the view from the app's own mode store; Lab and Bench never own the mode. Keeping
that state in the app package lets the playground mount `@repo/randomart/Scene` and
`@repo/randomart/Controls` as two separate modules and still have them agree. The Bench hands a
`(grammar, seed)` pair to the shell through the callback registered by `Scene`, so the two feature
packages stay independent.

See [`@repo/randomart-core`](../randomart-core/README.md) for the domain vocabulary and the rules
of the pipeline.
