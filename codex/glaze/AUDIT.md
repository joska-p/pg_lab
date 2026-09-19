# Glaze — Audit Archive (static analysis)

> **Reference only. Do not re-read by default.**
> Dated 2026-09-19 (full tree read, before reorg). Facts may be stale after
> refactors — **spot-check every `file:line` before trusting it**.
> Known-stale items are tagged **[STALE]**.

## §1 Source tree (27 files, as read on 2026-09-19)

```text
core/
  Camera.ts, CameraControls.ts, Clock.ts, FrameLoop.ts, InputStore.ts, gestures.ts, types.ts
cpu/
  CpuSurface.ts, types.ts, shapes/types.ts
gpu/
  GpuSurface.ts, StateBuffer.ts, types.ts
  shader/compileProgram.ts, Program.ts, setUniforms.ts, types.ts
  shapes/TextRasterizer.ts, color.ts, types.ts
  batch/ShapeBatcher.ts, geometry.ts, types.ts
react/
  CpuCanvas.tsx, GpuCanvas.tsx, clockStore.ts, interactions.ts,
  observable.ts, surfaceStack.ts, types.ts, useNodeResource.ts
```

## §2 Types inventory (8 × `types.ts`, no barrel)

| File                           | Exports                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/core/types.ts:1-451`      | God-file. Brands (`Brand`, `ZoomFactor`, `Seconds`, `CssColor`, …), factories `create*`, asserts, `Point2D`/`ScreenPoint`/`WorldPoint`, `CameraPatch`/`CameraControls`, `ClockOptions`/`ClockState`, `FrameToken`/`FrameStep`/`FrameLoopOptions`, `InputStoreOptions`/`EventSource`/`InputHandlers`/`Rect{left,top,width,height}`, `Gesture`/`InteractionEvent`/`InputRouterOptions`, constants `DEFAULT_ZOOM_BOUNDS`, `DEFAULT_WHEEL_SPEED` |
| `src/cpu/types.ts:1-12`        | `CpuSurfaceConfig{canvas,camera,dpr}`, `CpuDraw`                                                                                                                                                                                                                                                                                                                                                                                             |
| `src/cpu/shapes/types.ts:1-32` | `Color (= CssColor)`, `Rect{x,y,w,h}`, `DrawStyle`, `TextStyle`, `PathOptions`                                                                                                                                                                                                                                                                                                                                                               |
| `src/gpu/types.ts:1-15`        | `GpuSurfaceConfig{canvas,camera,clock,dpr,clockOptions}`, `GpuDraw`                                                                                                                                                                                                                                                                                                                                                                          |
| `src/gpu/shader/types.ts:1-13` | `UniformEntry{location: WebGLUniformLocation}`, `UniformValue (... \| WebGLTexture)`, `CompiledShaderProgram{program: WebGLProgram}`                                                                                                                                                                                                                                                                                                         |
| `src/gpu/shapes/types.ts:1-12` | `RGBA{r,g,b,a}`, `TextRaster{texture: WebGLTexture,…}`                                                                                                                                                                                                                                                                                                                                                                                       |
| `src/gpu/batch/types.ts:1-20`  | `Mat3`, `ShapeBatcherOptions{gl: WebGL2RenderingContext,…}`                                                                                                                                                                                                                                                                                                                                                                                  |
| `src/react/types.ts:1-168`     | `Notify/Unsubscribe`, `Observable`, `ClockStore`, `LiveInteractionEvent`, `CanvasInteractions`, `StackDisposable`, `InitialCamera`, `CpuSurfaceOptions`, `GpuSurfaceOptions`, `CpuStack`, `GpuStack`, `RoutableSurface`, `CpuCanvasProps`, `GpuCanvasProps`                                                                                                                                                                                  |

## §3 Disorder findings (why "bordel")

1. **GPU depends on CPU.** `src/gpu/GpuSurface.ts:34`, `src/gpu/batch/ShapeBatcher.ts:17`,
   `src/gpu/shapes/TextRasterizer.ts:4`, `src/gpu/shapes/color.ts:2` all import
   from `../../cpu/shapes/types` or `../cpu/shapes/types`. Shared shape types
   (`Rect`, `DrawStyle`, `TextStyle`, `Color`) belong in `core/` or `shared/`, not under `cpu/`.
2. **Duplicate `Rect`.** `cpu/shapes/types.ts:5` = `{x,y,w,h}` (world shape) vs
   `core/types.ts:377` = `{left,top,width,height}` (DOM bounds). Same name, opposite semantics.
3. **Three color models.** `CssColor` brand (`core/types.ts:99`), alias `Color`
   (`cpu/shapes/types.ts:3`), struct `RGBA` (`gpu/shapes/types.ts:1`) + implicit
   conversion via `parseColor`/`colorArray` (`gpu/shapes/color.ts:154-188`).
4. **Four surface configs.** `CpuSurfaceConfig`, `GpuSurfaceConfig`, `CpuSurfaceOptions`,
   `GpuSurfaceOptions` (`react/types.ts:98-108`) overlap without a shared base.
5. **`react/types.ts` mixes layers.** Internal infra (`StackDisposable`, `RoutableSurface`,
   `CpuStack`, `GpuStack`) sits next to public props (`CpuCanvasProps`, `GpuCanvasProps`).
6. **`core/types.ts` is a god-file (451 lines).** Time brands, camera, clock, frameloop,
   input, gestures, factories, asserts, constants all in one file.
7. **Everything is exported, nothing is `@internal`.** Only 2 `@internal` markers
   (`gpu/shapes/TextRasterizer.ts:7,13`). Helpers like `FULLSCREEN_TRIANGLE`,
   `compileProgram`, `setUniforms`, `projectionFor`, `textUniforms` are indistinguishable
   from public API. **[STALE]** — with monorepo-only scope this is hygiene, not API damage.

## §4 API leakage (reframed 2026-09-19: internal hygiene, NOT public API)

### 4a. Native WebGL types in cross-module signatures

- Definition site: `src/gpu/shader/types.ts:2,8,11`.
- Propagation:
  - `src/gpu/shader/Program.ts:27,31` — `get program(): WebGLProgram`,
    `get uniforms(): Map<string, UniformEntry>`;
  - `src/react/types.ts:154` — `GpuCanvasProps.uniforms?: (surface) => Record<string, UniformValue>`;
  - `src/gpu/StateBuffer.ts:42,50,261` — `getReadTexture()/getWriteTexture()/getTexture(): WebGLTexture`;
  - `src/gpu/shapes/types.ts:9` — `TextRaster.texture: WebGLTexture`;
  - `src/gpu/shapes/TextRasterizer.ts:143` — `textUniforms(..., texture: WebGLTexture, ...)`.
- Raw context handles: `src/gpu/GpuSurface.ts:57` `readonly gl: WebGL2RenderingContext`,
  `src/gpu/batch/types.ts:17` `ShapeBatcherOptions.gl`. Consumers can bypass batcher/program
  and corrupt GL state.
- Internal allocator detail in signatures: `src/gpu/shader/setUniforms.ts:80-84`
  `nextTextureUnit?: () => number`.

### 4b. DOM / Canvas handles in signatures

- `src/cpu/CpuSurface.ts:42-43` — `readonly canvas: HTMLCanvasElement`,
  `readonly context: CanvasRenderingContext2D` (mutable outside `applyCamera()`).
- `src/gpu/GpuSurface.ts:56` — `readonly canvas: HTMLCanvasElement` (same remark for `gl`).
- Configs require raw canvas: `src/cpu/types.ts:7`, `src/gpu/types.ts:8`.
- Hard globals (no injection, unlike `InputStore`'s `EventSource` at
  `src/core/InputStore.ts:29-45`):
  - `src/react/surfaceStack.ts:104,130` — `window.devicePixelRatio`;
  - `src/core/FrameLoop.ts:11,14` — `performance.now()`, `requestAnimationFrame`;
  - `src/gpu/shapes/TextRasterizer.ts:53`, `src/gpu/shapes/color.ts:140` —
    `document.createElement("canvas")`.
  - Consequence: not testable under SSR / Node without DOM shims.

### 4c. Mutability / double-facade leaks

- `src/core/Camera.ts:13-15` — `x, y, zoom` public mutable; `src/core/CameraControls.ts:85-89`
  `commit` mutates in place.
- `src/cpu/CpuSurface.ts:34-40`, `src/gpu/GpuSurface.ts:48-54` —
  `time, deltaTime, width, height, frameCount` public mutable.
- `src/core/InputStore.ts:54-58` — `pointer, pointerDelta, wheelPosition, wheelDelta` mutable,
  and `src/core/types.ts:422-427` `InteractionEvent{input: InputStore}` hands every gesture
  full mutable access.
- `src/gpu/StateBuffer.ts:206-208` — `get targets(): StateBufferTargets` exposes
  `bindWrite/unbind/swap/init/resize` while `StateBuffer` is already the facade.

### 4d. Suspected runtime defects (UNVERIFIED — confirm before fixing)

- **A. `CpuSurface.applyCamera` transform order** (`src/cpu/CpuSurface.ts:108-118`):
  `transform(zoom,0,0,zoom,x,y)` then `scale(dpr,dpr)` leaves translation `x,y`
  unscaled by `dpr`. Suspected hidpi offset bug; expected
  `setTransform(zoom*dpr,0,0,zoom*dpr,x*dpr,y*dpr)`. Needs visual test at `dpr=2`.
- **B. `StateBuffer` context-restore no-op** (`src/gpu/StateBuffer.ts:99-107`,
  `src/gpu/GpuSurface.ts:386-396`): on restore, `buffer.resize(w,h)` with identical
  dims early-returns, so dead GL textures are never recreated. Check
  `batch.reinitialize()` / `program.reinitialize()` coverage too.
- **C. Brands bypassable at draw boundary** (`src/gpu/GpuSurface.ts:170-171`,
  `src/cpu/CpuSurface.ts:141`): `rect(..., w=0, h=0)` defaults + `as PositiveNumber`
  casts defeat `PositiveNumber`/`FontSize` guarantees. Decide: validate or drop brand.
- **D. `FrameToken` proof is weak** (`src/core/InputStore.ts:119-124`): `endFrame`
  checks only `if (!token)` — any truthy object passes. Compile-time only.
- **E. `resolveCameraLayer` drops bounds** (`src/react/surfaceStack.ts:58-69`,
  `45-51`): explicit `camera` + `initialCamera.minZoom/maxZoom` ignores the bounds;
  `createCameraFromInitial` bypasses `createZoomClamp`. Decide precedence.
- **F. `parseHsl` / color contract** (`src/gpu/shapes/color.ts:82-110,153-181`):
  `s/l` reuse `parseChannel` (÷255 path), negative hue `%` stays negative,
  docstring says "resolve to magenta" but code throws. Needs unit tests.

## §5 Known-stale points [STALE]

- **Tests deleted 2026-09-19**: `src/gpu/shapes/color.test.ts`, `src/gpu/shapes/uniforms.test.ts`
  removed (were old files). Any test references in §2/§4d (e.g. "needs unit tests" in F)
  now imply _reintroducing_ a test, not extending an existing one.
- **"Every deep import is de-facto public API"** no longer a risk: monorepo-only,
  no external consumers. Leakage above is internal hygiene (readability, testability),
  not API protection.
- **§2 line/range numbers** will drift as the reorg (Step 3) moves files — re-read
  cited ranges before acting.
