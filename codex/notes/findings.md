# Findings (inbox)

Rewritten 2026-10-23, superseding the 2026-10-22 revision. That revision described the
core / lab / bench / dataset package split, which was reverted the same day: randomart is one
package again (`packages/randomart/src/{core,bench,dataset,components,stores}`), the renderer
subdirectories were flattened, and colour/config registries moved. Items below are verified
against `5bcea98`; resolved items are listed at the bottom so they are not re-investigated.

## Dedicated passes (not tracked here)

Two workstreams are large enough to get their own session; this inbox does not cover them.

1. **Tests for the stores and the shell.** The biggest coverage gap: 29 test files, all under
   `core/`, `bench/` and `dataset/`. Nothing in `stores/` (whose `labStore` owns history
   coalescing) and nothing in `components/` (whose `RandomArtCanvas` owns the WebGL lifecycle).
   Start with the pure parts: `historyStore.pushHistoryEntry` (coalescing, cap, current id),
   then `modeStore`. `labStore.commit` can follow through its public API. The canvas needs a
   WebGL mock and should come last.
2. **Fate of the dataset pipeline.** `features.json` and `pca.json` are written by
   `dataset/node/cli.ts` but read by nothing (the report is printed, not consumed); the
   pipeline needs a Chromium at `/usr/bin/chromium` (`dataset/node/writeDataset.ts:46`) and CI
   never runs it. Either wire a smoke test or state that it is a local tool only.

## Where to start next

The open findings below, smallest first.

## Open

1. **Loop bounds ownership.** `CONFIG.app.minLoopMs` / `maxLoopMs` (`core/config/config.ts:75`)
   are read in three roles: UI slider range (`components/lab/SessionSection.tsx:87`), file
   validation bound (`core/artwork/create.ts:21`, throws) and input clamp
   (`stores/lab/labStore.ts:312`). They are not a safety guard. Decide whether the accepted
   range belongs to the artwork render contract (and `app` merely renders it) or whether UI
   range and accepted range are two different values.
2. **ms ↔ s conversion duplicated.** The `/ 1000` lives in `labStore.ts:312` and again in
   `SessionSection.tsx:87-88`. `DEFAULT_LOOP_DURATION` is derived once in
   `core/config/derived.ts`; the bounds deserve the same treatment (derived duration constants)
   so a fourth copy cannot appear.
3. **Stale cross-package reference.** `dataset/page.ts:10` still cites
   `@repo/randomart-core/renderer/batchRenderer`, a package that no longer exists.
4. **Test run hangs on close.** `vp test` in randomart finishes in ~0.6 s, then waits 10 s on
   "close timed out … something prevents 2 Vite servers from exiting". Cause unidentified; worth
   a look because it taxes every local run and any CI job that runs the package tests.

## Resolved since the 2026-10-22 revision

Layout:

- The core / lab / bench / dataset packages were collapsed back into `@repo/randomart`. Items
  about package boundaries, the `/domain` vs `/renderer` subpath, and "core keeps the renderer"
  no longer apply.
- `core/renderer/contract/contract.ts` is gone: `createPhase` is in `renderer/phase.ts`,
  `Phase`/`RenderKey` in `renderer/types.ts`, `DEFAULT_CONTEXT_OPTIONS` in `renderer/constants.ts`.

Types:

- `GrammarData` moved to `core/grammar/types.ts` (was `artwork/serialize.ts`).
- `LotView` moved to `bench/lot/types.ts` (was a component module).
- Runtime values left the `types.ts` files: `defineOperator` (`catalog/operators/`), notebook
  constants (`bench/notebook/constants.ts`), rating validator (`bench/notebook/rating.ts`).
- `Seed` lives in `core/random/types.ts`, `Phase` in `core/renderer/types.ts`; the brands stay
  colocated with their factories (deliberate).

Components:

- `HANDWRITTEN_TEST_SHADER` is deleted, with the two tautological tests that only asserted its
  own substrings (`phase.test.ts`). `RandomArtCanvas.fragmentShader` is now required, so a
  shader-less mount is a type error instead of a silent test pattern. `components/test/` is
  gone. The default dated from MP1·S3 (`bf076c8`), when the canvas predated the compiler; the
  compiler landed twenty minutes later (`de84014`) and the default was simply never removed.

Config:

- `CONFIG.color` is deleted, with its pin and the doc line that announced it: the section had
  no reader and its `{}` type accepted anything. The config no longer turns into GLSL text.
- `ColorSpace.chroma` is deleted too. It was never read — the chroma scale is hardcoded in each
  space's GLSL (`0.4` in `ra_oklch`/`ra_oklab`) — so the field was a second source of truth that
  could only drift. The literal stays inside the GLSL, next to its one use.
- `core/config/config.test.ts` is deleted. It compared `CONFIG` to a literal copy of itself,
  enforced none of the consequences it announced, and duplicated coverage that
  `generator.test.ts` already provides honestly through its snapshots. `CONFIG`'s doc now names
  the real tripwire and adds `sizeProfiles` to the bump list — `constraintsOf` reads it at
  generation time, so editing it already changes stored grammars.
- `GENERATOR_VERSION` stays in `core/generator/generator.ts` — it versions `generate()`, not
  `CONFIG` (PRNG, draw order and rounding are code) — but the reproducibility snapshot in
  `generator.test.ts` now carries it in its payload. A bump without regenerating the snapshot
  fails, and a draw-affecting `CONFIG` change without a bump leaves the stale version in the
  diff. Verified by temporarily changing `terminals.amp`: the snapshot fails.
- `DEFAULT_KEEP`, `randomize.ts`, `STRUCTURE_RECIPE` and the family vocabulary are gone.
- `defaultGrammar` is no longer the app's initial grammar: `labStore.ts:48` draws one.
  `grammarRegistry.default` is a preset and a test fixture.
- `core/grammar/grammar.ts` imports are extensionless like the rest of the package.

Lint seam: still `no-restricted-globals` for browser globals, now targeting
`packages/randomart/src/core/**` with `core/renderer/batchRenderer.ts` as the single allowed DOM
edge (`vite.config.ts:54-77`). The README no longer restates the seam.

Docs: the living randomart docs (`randomart-config-knobs.md`, `randomart-coherence-plan.md`) and
the dated session notes no longer exist; `codex/docs` holds the conventions only.

## Verified during this rewrite

- `vp -C packages/randomart test`: 275 passed / 1 skipped, 28 files (plus the close timeout
  above). `config.test.ts` is gone; the 2026-10-22 revision's 328 also counted the shader
  tautologies deleted since.
- `vp check` clean.
