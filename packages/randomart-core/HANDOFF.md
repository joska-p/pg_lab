# Handoff — randomart-core v2

## Goal

Replace `randomart-vm` with `randomart-core` (v2), then migrate `randomart-ui` and delete the old
package. There is no external consumer and no artwork to preserve.

## Current state

- `randomart-core` is implemented and self-contained: `ops`, `tree`, `rng`, `grammar`, `generate`,
  `evaluate`, `lower`, `emit`, `colors`, `glsl`.
- Verified with `vp -C packages/randomart-core check`, temporary determinism/round-trip tests, and
  `glslangValidator` on 80 generated shaders. Those temporary tests were removed.
- No test suite yet. No `index.ts`: consumers import explicit subpaths by decision.
- `randomart-vm` and `randomart-ui` are untouched and still use the v1 API.

## Decisions worth keeping

- One operator table holds `glsl` and `eval` side by side; `arity === 0` means terminal.
- Terminals must return a GLSL primary expression; `emit` wraps every other inline.
- Parameters are named in the IR; `deserialize` validates arity and parameter ranges.
- `compile(expression, { space })` requires the color space.
- `createGrammar` throws on inconsistent input (`shareDepth > maxDepth`): the UI must clamp when the
  size profile changes.
- `randomSeed()` is deliberately absent from the core (no ambient randomness in pure logic).
- `sqr` goes through `ra_sqr` so it reads its input once and DAG usage counts stay exact.

## Next action

Add the Vitest suite in `packages/randomart-core`:

1. determinism snapshot of `formatFormula(generate(grammar, seed))` for fixed seeds;
2. `serialize → deserialize → compile` round-trip;
3. property check over N seeds × sizes × spaces: compile does not throw, no `undefined`/`NaN`,
   `evaluate` stays within [-1, 1];
4. GLSL vs `evaluate` on a few pixels (headless GL), and/or `glslangValidator` in CI.

Then migrate `randomart-ui`: the compiler now takes `compile(expr, { space })`, `vm`/`Vm` are gone,
`randomSeed` and seed creation move to the UI, and weight sliders must clamp `shareDepth` on size
changes. Finally delete `randomart-vm` and this handoff file.

## Notes

- `vite.config.ts` already lists `packages/randomart-core/**` in `nodePackages`.
- `packages/randomart-core/README.md` documents the architecture, invariants and GLSL contract.
- `randomart-vm/README.md` still contains factual errors; it disappears with the package.
