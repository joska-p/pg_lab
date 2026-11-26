# Knip cleanup — handoff

## State at handoff

After the commit that introduces this file, the regenerated Knip report has:

| Category | Count | Status |
| :-- | --: | :-- |
| Unused files | 8 | All belong to `packages/three-stage` and are **user-owned** |
| Unused exports | 52 | Not addressed |
| Unused exported types | 31 | Not addressed |
| Unused dependencies / devDependencies | 0 | Cleared |
| Duplicate exports | 0 | Cleared |
| Unused catalog entries | 0 | Cleared |

`reports/knip.json` and `reports/knip.md` are generated and gitignored (`/reports/`). `vp run knip` exits 1 while findings remain; that is expected, not a failure.

## Working agreement (do not skip)

1. Pick **one coherent lot** (same cause, package, or repeated pattern). Present the finding and one recommended solution plus alternatives. Completion criterion: the user has chosen an option.
2. Investigate with `rg` before proposing. Completion criterion: every file in the lot is confirmed unused, or its real consumer is named.
3. Apply **only** the chosen option. Completion criterion: the diff contains no unapproved changes.
4. Verify with `pnpm install --lockfile-only --ignore-scripts` when `package.json` / `pnpm-workspace.yaml` changed, then `vp check --fix`, then `vp run knip` and report the new category counts. Completion criterion: all three commands ran and the counts moved as predicted.
5. Return to step 1. Completion criterion: the user says to stop.

An "unused export" is not always dead code: it may be used in its own file. Check with `rg` first; if it is file-local, dropping the `export` keyword is the fix, not deleting the value. Verify before proposing either.

## Done — do not redo

| Lot | Decision |
| :-- | :-- |
| `zustand` in `apps/playground`, `apps/brouillon`, `packages/squared` | Dependency removed; unused `apps/playground/src/stores/appStore.tsx` deleted |
| `@stylexjs/stylex` in 8 packages | devDependency removed; catalog entry kept for real consumers |
| `@types/react-dom` + `jsdom` in `packages/ui` | Both removed; the single test stubs `localStorage` via `vi.stubGlobal` |
| 6 unused catalog entries | Removed from `pnpm-workspace.yaml`; `@repo/randomart-core` is consumed via `workspace:*` directly |
| Duplicate export in `apps/playground/src/experiments.ts` | `interactiveExperiments` alias removed; `RandomJumpButton` uses `EXPERIMENTS` |
| 3 unused files in `packages/pixel-manipulator` | `ManipulationSelector.tsx`, `PresetSelector.tsx`, `stores/appStore.tsx` deleted; `zustand` still needed by `stores/manipulator/store.ts` |
| 4 unused barrels | `mol-demo/src/lib/index.ts`, `mol-demo/src/lib/pattern/index.ts`, `surface/src/cpu/index.ts`, `surface/src/gpu/index.ts` deleted; none were in `package.json` `exports` |
| `art-canvas/.../effects/surfaceLighting.ts` | Deleted; it was absent from `assembly/registries.ts` and had no `.glsl` twin |
| `worker-pool/mock-worker-pool.ts` | **Exported** as `./mock-worker-pool` (deliberate test API); no code change. README already describes it as the second implementation |

## Deferred — user-owned

`packages/three-stage/src/components/stage/` (6 files) and `packages/three-stage/src/utils/` (2 files) form one orphan cluster: `Scene.tsx` imports the four lighting components and `Sample.tsx`, which imports both utils; `App.tsx` renders `GetStarted` instead. The user declined the deletion and will handle this cluster separately. Leave it untouched and do not re-propose it unprompted.

## Declined proposal

Making the 10 `DEFAULT_PARAMS` / `MAX_ZOOM` constants in the five `packages/fracture/src/modules/*/store.ts` file-private was proposed and declined. They are each used only in their own file, so that option remains technically valid, but ask before revisiting it.

## Next candidates

Group the remaining 52 exports + 31 types by family rather than one symbol at a time:

- `mol-demo` config constants (`ATOM_*`, `BOND_*`, `PATTERN_*`, `XRAY_LUT_GAMMA`)
- `radu-machine-learning` stores (`selection.ts`, `sketchpad.ts`, `constants.ts`) and its sample types
- `randomart-ui` stores and post-processing (`useIsEffectActive`, `useIsPlaying`, `postProcessEffectsById`, `EXPORT_SIZE`)
- registry exports (`EXPERIMENTS`, `experimentsById`, `rulesById`, `colorPickerSpacesById`, `getAllModules`)
- `fracture` camera/export helpers (`ZOOM_WHEEL_SPEED`, `experimentsById`)
- small utility exports (`mulberry32`, `hexCorners`, `checkBounds`, `checkUnitNormals`, `useSource`)

Confirm consumers with `rg` for each family before proposing a change; barrel files and registries may be referenced from `package.json` `exports` or explicit registries.
