# `three-stage` — decision record (Session 7)

## Decision

`three-stage` is **not ported** to the single-source lab in this migration. No
`experiments/three-stage/` page is created, no navigation entry is added to the index, and no new
runtime dependency is introduced. The experiment stays in the old `packages/three-stage/` tree until
that tree is removed in Session 8; it is not part of the published `dist`.

This is a deliberate deferral, not an oversight. The user confirmed on 2026-11-17 that the
experiment is left aside for now.

## Why

The source experiment is a React Three Fiber playground, not a canvas experiment like the other
Tier B pages:

- Its stage is `@react-three/fiber`'s `<Canvas>`, driven by `@react-three/drei` (`OrbitControls`,
  `GizmoHelper`/`GizmoViewport`, `Helper`, `Instances`/`Instance`) and `leva`.
- Its scene is built from `three` objects (`ShaderMaterial`, `BoxGeometry`, `Vector3`, `Quaternion`,
  `Euler`) spread over `src/components/GetStarted/**`, `src/components/stage/**`,
  `src/utils/geometry.ts` and `src/utils/material.ts`.
- Its only state is a theme setting held in a state library; the visual complexity lives in the R3F tree,
  which has no equivalent in `ui/` or `lib/`.

`lib/surface/gpu` in the lab is intentionally small: one WebGL2 context, one program at a time,
targeted uniforms and a frame subscription. Porting `three-stage` honestly would mean rebuilding a
scene graph, camera/orbit controls, instanced meshes, lighting rigs and debug gizmos on top of that
thin layer — effectively writing a small Three.js from scratch. That work is unrelated to the goal
of removing React from the existing experiments, and it would add a large, brittle surface with no
reuse in any other page.

The reverse option — keeping `three`, R3F and drei as dependencies — is excluded by the migration
decision: no React, no react-dom, no router, no state library, and no new package dependency
in the single source.

## Non-goals

- No WebGL scene-graph replacement built on `lib/surface/gpu`.
- No raw-WebGL port of the sample scene, its branches/leaves shaders, lighting helpers or gizmos.
- No camera controls, instancing layer or material abstraction added to `ui/` for this experiment.
- No `three`, `@react-three/*`, `leva`, React or state-library dependency in `apps/lab/`.
- No placeholder page: the index advertises only experiments that actually run.

## Revisit criteria

A port can be reconsidered after Session 8 only if a concrete consumer needs it and a small,
DOM-first subset is enough — for example a single static scene with orbit-free camera and no
gizmos, reusing `GpuSurface` plus `TargetPair` the way `automa` and `fracture` do. Until then the
cost/benefit ratio stays clearly negative.
