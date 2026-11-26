# Knip cleanup — handoff

## State at handoff

After the cleanup recorded below, the regenerated Knip report has:

| Category                              | Count | Status                                                      |
| :------------------------------------ | ----: | :---------------------------------------------------------- |
| Unused files                          |     8 | All belong to `packages/three-stage` and are **user-owned** |
| Unused exports                        |    10 | Only `fracture` `DEFAULT_PARAMS` / `MAX_ZOOM` — declined    |
| Unused exported types                 |     0 | Cleared                                                     |
| Unused dependencies / devDependencies |     0 | Cleared                                                     |
| Duplicate exports                     |     0 | Cleared                                                     |
| Unused catalog entries                |     0 | Cleared                                                     |

Progression for this cleanup: unused exports 52 → 10, unused exported types 31 → 0.

`reports/knip.json` and `reports/knip.md` are generated and gitignored (`/reports/`). `vp run knip` exits 1 while findings remain; that is expected, not a failure. Markdown tables in this file are formatter-managed: `vp check --fix` aligns them.

## Working agreement (do not skip)

1. Pick **one coherent lot** (same cause, package, or repeated pattern). Present the finding and one recommended solution plus alternatives. Completion criterion: the user has chosen an option.
2. Investigate with `rg` before proposing. Completion criterion: every file in the lot is confirmed unused, or its real consumer is named.
3. Apply **only** the chosen option. Completion criterion: the diff contains no unapproved changes.
4. Verify with `pnpm install --lockfile-only --ignore-scripts` when `package.json` / `pnpm-workspace.yaml` changed, then `vp check --fix`, then `vp run knip` and report the new category counts. Completion criterion: all applicable commands ran and the counts moved as predicted.
5. Return to step 1. Completion criterion: the user says to stop.

An "unused export" is not always dead code: it may be used in its own file. Check with `rg` first; if it is file-local, dropping the `export` keyword is the fix, not deleting the value.

**Standing approval:** for a purely file-local symbol (no consumer outside its file), removing the `export` keyword needs no question. Deletions and mixed lots still need an explicit choice from the user.

## Done — do not redo

| Lot                                                                  | Decision                                                                                                                                                                |
| :------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `zustand` in `apps/playground`, `apps/brouillon`, `packages/squared` | Dependency removed; unused `apps/playground/src/stores/appStore.tsx` deleted                                                                                            |
| `@stylexjs/stylex` in 8 packages                                     | devDependency removed; catalog entry kept for real consumers                                                                                                            |
| `@types/react-dom` + `jsdom` in `packages/ui`                        | Both removed; the single test stubs `localStorage` via `vi.stubGlobal`                                                                                                  |
| 6 unused catalog entries                                             | Removed from `pnpm-workspace.yaml`; `@repo/randomart-core` is consumed via `workspace:*` directly                                                                       |
| Duplicate export in `apps/playground/src/experiments.ts`             | `interactiveExperiments` alias removed; `RandomJumpButton` uses `EXPERIMENTS`                                                                                           |
| 3 unused files in `packages/pixel-manipulator`                       | `ManipulationSelector.tsx`, `PresetSelector.tsx`, `stores/appStore.tsx` deleted; `zustand` still needed by `stores/manipulator/store.ts`                                |
| 4 unused barrels                                                     | `mol-demo/src/lib/index.ts`, `mol-demo/src/lib/pattern/index.ts`, `surface/src/cpu/index.ts`, `surface/src/gpu/index.ts` deleted; none were in `package.json` `exports` |
| `art-canvas/.../effects/surfaceLighting.ts`                          | Deleted; it was absent from `assembly/registries.ts` and had no `.glsl` twin                                                                                            |
| `worker-pool/mock-worker-pool.ts`                                    | **Exported** as `./mock-worker-pool` (deliberate test API); no code change. README already describes it as the second implementation                                    |
| `mol-demo` config constants                                          | 9 mesh constants, 2 pattern constants and `XRAY_LUT_GAMMA` made file-private (52 → 40 exports)                                                                          |
| `radu-machine-learning` stores + constants                           | 2 store objects made file-private; `useBaseUrl`, `setBaseUrl`, `clearScrollTarget` and `CHART_SAMPLE_LIMIT` deleted (with the orphan `baseUrl` field)                   |
| `radu-machine-learning` sample types                                 | `Sample`, `Student`, `FeatureSample` made file-private; `RawSample` deleted (31 → 27 types)                                                                             |
| `randomart-ui` stores + post-processing                              | `EXPORT_SIZE` and `PostProcessEffectDefinition` made file-private; `postProcessEffectsById`, `useIsEffectActive`, `useIsPlaying` deleted                                |
| `palette` / `oeis-signal` registries                                 | `colorPickerSpacesById` and `RulesById` made file-private; `ruleOptions` and `getAllModules` deleted                                                                    |
| Experiment registries + `fracture` camera                            | 5 `EXPERIMENTS` / `experimentsById` registries and 3 types made file-private; `ZOOM_WHEEL_SPEED` deleted                                                                |
| Small utility exports                                                | `mulberry32` (atlas) and `hexCorners` made file-private; `checkBounds`, `checkUnitNormals`, `useSource` deleted                                                         |
| `art-canvas` atlas + `automa` actions                                | 3 atlas setters deleted; `destroySimulation` and `creatures` made file-private                                                                                          |
| Exported type families                                               | 6 `pixel-manipulator`, 3 `mol-demo`, 4 `sequencer`, 3 `pixel` and 7 remaining file-local types made private or deleted; category cleared                                |

## Deferred — user-owned

`packages/three-stage/src/components/stage/` (6 files) and `packages/three-stage/src/utils/` (2 files) form one orphan cluster: `Scene.tsx` imports the four lighting components and `Sample.tsx`, which imports both utils; `App.tsx` renders `GetStarted` instead. The user declined the deletion and will handle this cluster separately. Leave it untouched and do not re-propose it unprompted.

## Declined proposal

Making the 10 `DEFAULT_PARAMS` / `MAX_ZOOM` constants in the five `packages/fracture/src/modules/*/store.ts` file-private was proposed and declined. They are each used only in their own file, so that option remains technically valid, but ask before revisiting it.

## Remaining

Only the 10 declined `fracture` constants and the 8 user-owned `three-stage` files remain. There is no other actionable lot. If asked to continue, ask first about the `fracture` constants; do not touch the `three-stage` cluster.
