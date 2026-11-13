# @repo/glaze — Refactor: render targets, passes, lifecycle

**Status:** P0 complete (2026-11-13); P1 not started
**Scope:** `@repo/glaze` only
**Related:** `packages/randomart-ui/POST-PROCESSING.md`, `PHASE1.md`, `REVISION.md` (paused)

---

## 1. Why this refactor

### 1.1 Goal

Make `glaze` a clean GPU primitive layer for:

- rendering a program to the default framebuffer;
- rendering a program to an offscreen texture;
- chaining several passes through ping-pong render targets;
- resizing and restoring those resources after WebGL context loss;
- giving React a single, documented insertion point for custom frame rendering.

The immediate motivation is post-processing in `randomart-ui`, but the refactor is deliberately
**not** a post-processing feature. `glaze` must stay useful for any multi-pass experiment.

### 1.2 Constraints

- All `@repo/glaze` consumers live in this monorepo.
- There is one developer; this is a recreational project.
- Public API breaks are acceptable. Document them, repair consumers later.
- `glaze` is frequently remodeled. Prefer a small, explicit core over a speculative framework.
- App policy stays out of `glaze`: no effect registry, no pass ordering, no UI, no export policy.

### 1.3 Decision boundary

| Concern                                   | `@repo/glaze`               | Consumer                                           |
| ----------------------------------------- | --------------------------- | -------------------------------------------------- |
| WebGL context, framebuffer, viewport      | owns                        | never touches directly                             |
| Render target / render target pair        | owns lifecycle              | creates through the surface, samples `.texture`    |
| Pass execution                            | `renderProgramTo` primitive | chooses passes, order, inputs, uniforms            |
| Effect registry, order, active state      | no                          | yes                                                |
| Resize / context restore of GPU resources | owns                        | re-seeds application data when notified            |
| UI, export, post-processing policy        | no                          | yes                                                |
| Shape batching                            | owns                        | draws through `surface.rectangle/circle/line/text` |

`glaze` provides **GPU primitives**. A consumer provides **a rendering policy**.

---

## 2. Current state

### 2.1 What already works

- `GpuSurface` owns the WebGL2 context, frame loop, camera, input, shape batcher and text rasterizer.
- `Program` compiles a fullscreen-triangle shader and supports uniform assignment.
- `StateBufferTargets` already implements a correct ping-pong texture/framebuffer pair.
- `Program` and `StateBuffer` both have a `reinitialize()` path for context restore.
- `GpuCanvas` handles shader swapping, `shouldRender`, `onFrame`, and surface lifecycle.
- The shape batcher and text renderer share the default framebuffer.

### 2.2 Confirmed defects and design gaps

| Ref  | Defect                                                                 | Where                              | Consequence                                                           | Phase |
| ---- | ---------------------------------------------------------------------- | ---------------------------------- | --------------------------------------------------------------------- | ----- |
| P0-1 | `StateBuffer.reinitialize()` recreates targets but not its programs    | `StateBuffer.ts`                   | GPGPU programs are dead after `webglcontextrestored`                  | P0    |
| P0-2 | `StateBuffer.destroy()` does not notify its owner                      | `StateBuffer.ts`, `GpuSurface.ts`  | Surface keeps a stale buffer; later destroy happens twice             | P0    |
| P0-3 | `GpuCanvas` never resets `renderedProgramRef` on context restore       | `GpuCanvas.tsx`                    | A static `shouldRender` gate can keep the canvas blank after restore  | P0    |
| P0-4 | `Program.#nextTextureUnit` drifts across `StateBuffer.step()` calls    | `Program.ts`, `StateBuffer.ts`     | Later texture uniforms can bind to the wrong unit or exceed the limit | P0    |
| P0-5 | `StateBuffer.step()` hardcodes `u_state` and texture unit `0`          | `StateBuffer.ts`                   | No custom input sampler; fragile with additional textures             | P1    |
| P1-1 | `Program.render()` forces the drawing-buffer viewport                  | `Program.ts`                       | Cannot draw a program into an FBO of another size                     | P1    |
| P1-2 | `ShapeBatcher.flush()` forces the drawing-buffer viewport              | `ShapeBatcher.ts`                  | Same viewport lock for batched shapes                                 | P1    |
| P1-3 | `GpuSurface.renderProgram()` always targets the default framebuffer    | `GpuSurface.ts`                    | No supported multi-pass path                                          | P1    |
| P2-1 | No clear/blend policy per target or pass                               | `GpuSurface.ts`, render targets    | Effects must manipulate GL state themselves                           | P2    |
| P2-2 | DPR is fixed at construction; resize is only checked in the frame step | `GpuSurface.ts`, `surfaceStack.ts` | Moving to another DPR or resizing an idle surface can miss updates    | P2    |
| P2-3 | Texture detection relies on `value instanceof WebGLTexture`            | `setUniforms.ts`                   | Fragile across realms/headless environments                           | P2    |
| P2-4 | No max-size or FBO-capability check beyond throwing on creation        | `StateBufferTargets`               | Late, opaque failure on large or unsupported targets                  | P2    |
| P2-5 | README claims full context-loss recovery                               | `README.md`                        | The claim is currently only partly true                               | P2    |

---

## 3. Target architecture

### 3.1 Resource model

Introduce two public GPU resources and keep `StateBuffer` as a GPGPU consumer of the pair.

```text
GpuSurface
├── Program[]                       (existing, surface-owned)
├── RenderTarget[]                  (new, surface-owned)
├── RenderTargetPair[]              (new, surface-owned)
├── StateBuffer[]                   (existing, surface-owned)
│   ├── RenderTargetPair            (internal, owned by the StateBuffer)
│   └── Program[]                   (internal, owned by the StateBuffer)
└── ShapeBatcher / TextRasterizer   (existing)
```

Only the surface creates GPU resources. Consumers create through the surface so ownership,
context restore and cleanup stay in one place.

### 3.2 Render target primitives

```ts
// gpu/types.ts
export interface Viewport {
    /** Physical pixels of the draw target, not CSS pixels. */
    readonly width: number;
    readonly height: number;
}

export interface RenderTargetOptions {
    /** Default: 'nearest'. Post-processing usually wants 'linear'. */
    readonly filter?: 'nearest' | 'linear';
}
```

```ts
// gpu/RenderTarget.ts
export class RenderTarget {
    readonly width: number;
    readonly height: number;
    /** Sample this from a shader. The framebuffer stays private to glaze. */
    readonly texture: WebGLTexture;

    resize(width: number, height: number): void;
    reinitialize(): void;
    clear(color?: CssColor): void;
    /** Idempotent; notifies the owning surface exactly once. */
    destroy(): void;
}

export class RenderTargetPair {
    get read(): RenderTarget;
    get write(): RenderTarget;
    get width(): number;
    get height(): number;

    swap(): void;
    resize(width: number, height: number): void;
    reinitialize(): void;
    clear(color?: CssColor): void;
    /** Idempotent; destroys both targets and notifies the owning surface once. */
    destroy(): void;
}
```

Notes:

- `read` / `write` replace `ping` / `pong`: the intent is clearer at call sites.
- The framebuffer is deliberately not exposed. Sampling `.texture` is the supported use case;
  drawing is done through `surface.renderProgramTo`.
- `filter: 'linear'` is needed for image-space effects such as grain, blur or vignette.
  `'nearest'` remains the default and is what `StateBuffer` uses.
- Formats are intentionally limited to RGBA8 for now. Float/half-float targets are a later concern.

### 3.3 Surface API additions

```ts
// gpu/GpuSurface.ts
export class GpuSurface {
    /** Physical size of the default framebuffer. */
    readonly deviceWidth: number;
    readonly deviceHeight: number;

    get isLost(): boolean;

    createRenderTarget(width: number, height: number, options?: RenderTargetOptions): RenderTarget;

    createRenderTargetPair(
        width: number,
        height: number,
        options?: RenderTargetOptions,
    ): RenderTargetPair;

    /** Draw to the default framebuffer (existing behavior, now explicit). */
    renderProgram(program: Program, uniforms?: UniformValues): this;

    /** Draw to an offscreen target; `null` means the default framebuffer. */
    renderProgramTo(program: Program, target: RenderTarget | null, uniforms?: UniformValues): this;

    /** Called after every resource has been recreated. */
    onContextRestored(listener: (surface: GpuSurface) => void): () => void;
}
```

`renderProgram(program, uniforms)` is equivalent to
`renderProgramTo(program, null, uniforms)`.

`renderProgramTo` is responsible for:

1. flushing queued shapes first (so shapes always go to the default framebuffer for now);
2. binding the target framebuffer;
3. setting the viewport from the target size;
4. applying standard uniforms plus the caller's uniforms;
5. drawing the program;
6. restoring the default framebuffer and default viewport.

The caller is responsible for the pass order, the input textures and any effect-specific uniforms.

### 3.4 Program and shape batcher

```ts
// gpu/shader/Program.ts
render(viewport: Viewport): void;
```

- `Program.render()` no longer reads `gl.drawingBufferWidth/Height`. The caller owns the viewport.
- `Program.setUniforms()` starts texture units at `0` on every call. A single call is self-contained.
- `Program.reinitialize()` also resets the texture-unit counter.

```ts
// gpu/batch/ShapeBatcher.ts
flush(viewport: Viewport): void;
```

- `GpuSurface.#flushBatch()` passes the default framebuffer's physical size.
- The projection itself still uses CSS dimensions; only the GL viewport is physical.
- Rendering batched shapes into an offscreen target is **not** in scope for P1. Shapes remain a
  default-framebuffer feature.

### 3.5 GpuCanvas insertion point

```ts
// react/types.ts
export interface FrameRenderContext {
    readonly surface: GpuSurface;
    readonly program: Program;
    readonly uniforms: UniformValues;
}

export interface GpuCanvasProps extends GpuSurfaceOptions {
    // ...
    /**
     * Replaces the default `surface.renderProgram(program, uniforms)` call. Runs only when the
     * render gate allows a draw.
     */
    renderFrame?: (context: FrameRenderContext) => void;
    /** Runs after the surface recreated its resources. */
    onContextRestored?: (surface: GpuSurface) => void;
}
```

`GpuCanvas` computes `uniforms` once, then either:

- calls `context.surface.renderProgram(context.program, context.uniforms)` by default; or
- delegates to `renderFrame` for a custom pass pipeline.

This is the minimal seam needed by `randomart-ui`: shader compilation, `shouldRender`, clock and
surface lifecycle stay in `GpuCanvas`; the multi-pass policy stays in the consumer.

`GpuCanvas` must also reset `renderedProgramRef` on context restore **before** calling the user
callback, so a program that has never been drawn since restore is always drawn once, even when
`shouldRender` returns `false`.

`renderFrame` is expected not to throw. If it throws, `GpuCanvas` does not update
`renderedProgramRef`; a consumer-owned render gate should still be written defensively (the
existing randomart/fracture gates record their key before the draw).

### 3.6 StateBuffer API

`StateBuffer` becomes a small GPGPU helper built on `RenderTargetPair`.

```ts
export interface StateBufferProgramOptions {
    /** Sampler that receives the read texture on each step. Default: 'u_state'. */
    readonly inputUniform?: string;
}

export class StateBuffer {
    readonly pair: RenderTargetPair;

    addProgram(name: string, fragmentSource: string, options?: StateBufferProgramOptions): void;

    useProgram(name: string): void;
    setUniforms(values: UniformValues): void;
    step(uniforms?: UniformValues): void;

    init(data: Uint8Array): void;
    resize(width: number, height: number): void;
    reinitialize(): void;
    destroy(): void;
}
```

Semantics:

- `setUniforms()` stages values used by the next and subsequent steps.
- `step(uniforms)` merges staged values, per-step values, and the read texture, then calls
  `program.setUniforms()` exactly once with the input sampler last.
- The input sampler is configurable per program; `u_state` is only the default.
- `step()` renders into `pair.write`, unbinds, then `pair.swap()`.
- `reinitialize()` recreates the pair **and** recompiles every program.
- `destroy()` is idempotent, destroys programs and pair, and notifies the surface.

This keeps the existing automa flow almost intact:

```ts
buffer.useProgram('default');
buffer.setUniforms({ u_gridSize, u_birth, u_survive /* ... */ });
buffer.step();
```

but allows:

```ts
buffer.addProgram('custom', source, { inputUniform: 'u_previous' });
buffer.useProgram('custom');
buffer.step({ u_previous: otherTexture }); // `u_previous` is overridden by pair.read.texture
```

### 3.7 Standard uniforms for offscreen passes

`u_resolution` must describe the **draw target**, in physical pixels, not always the canvas.
Pointer normalization must keep using the canvas CSS size, otherwise `u_mouse` shifts by `dpr`.

The refactor should replace the positional `createStandardUniformValues(width, height, dpr, ...)`
helper with an options object, for example:

```ts
interface StandardUniformInput {
    readonly resolution: Viewport; // physical target size
    readonly pointerResolution: Viewport; // CSS canvas size
    readonly dpr: number;
    readonly mouse?: Point2D;
    readonly camera?: Camera;
    readonly time?: number;
    readonly clockTime?: number;
}
```

For the default framebuffer, `resolution = surface.deviceWidth/Height` and
`pointerResolution = surface.width/height`. For a target, `resolution = target.width/height` and
`pointerResolution` stays the canvas CSS size.

---

## 4. Lifecycle contracts

### 4.1 Ownership and destruction

- `Program`: surface-owned when created through `GpuSurface.createProgram`; state-buffer-owned when
  created through `StateBuffer.addProgram`.
- `RenderTarget`: surface-owned when created through `GpuSurface.createRenderTarget`.
- `RenderTargetPair`: surface-owned when created through `GpuSurface.createRenderTargetPair`;
  state-buffer-owned when created by `StateBuffer`.
- `StateBuffer`: surface-owned when created through `GpuSurface.createStateBuffer`, but a consumer
  may destroy it early (automa does this when re-initializing).

Every destroyable GPU resource obeys the same rules:

1. `destroy()` is idempotent.
2. `destroy()` notifies its owner exactly once.
3. The owner removes the resource from its tracking set in the hook.
4. `GpuSurface.destroy()` iterates snapshots (`[...set]`), never a live set that hooks mutate.

### 4.2 Context restore sequence

```text
webglcontextlost
  └─ preventDefault(); lost = true

webglcontextrestored
  ├─ lost = false
  ├─ configureState()                    // depth, blend
  ├─ resize()                            // canvas + default viewport + device size
  ├─ textRasterizer.clear()
  ├─ batch.reinitialize()
  ├─ for each Program       → reinitialize()
  ├─ for each RenderTarget  → reinitialize()
  ├─ for each RenderTargetPair → reinitialize()
  ├─ for each StateBuffer   → reinitialize()  // pair + programs
  └─ notify onContextRestored listeners
```

GPU resources are recreated empty. **Application data is not restored by `glaze`.**

A simulation must re-seed explicitly:

```ts
// automa, for example
surface.onContextRestored(() => {
    initSimulation(surface); // or engine.reseed()
});
```

The notification runs after the surface's resources are ready, so listeners can safely create or
destroy resources.

### 4.3 Resize contract

- `GpuSurface` computes `deviceWidth/deviceHeight` on every frame-step resize check.
- A `RenderTarget` does **not** automatically follow the canvas in P1. Consumers compare
  `target.width/height` with `surface.deviceWidth/deviceHeight` when they need a screen-sized target.
- P2 may add an explicit `createScreenRenderTarget()` or an `autoResize` option once the
  primitive API has proven itself.

---

## 5. Breaking changes

| Before                                        | After                                              | Migration                                                 |
| --------------------------------------------- | -------------------------------------------------- | --------------------------------------------------------- |
| `Program.render()`                            | `Program.render(viewport: Viewport)`               | Internal only; surface and `StateBuffer` pass a viewport. |
| `ShapeBatcher.flush()`                        | `ShapeBatcher.flush(viewport: Viewport)`           | Internal only; `GpuSurface` passes the default viewport.  |
| `StateBufferTargets`                          | `RenderTargetPair`                                 | No current consumer imports it; replace the type.         |
| `StateBuffer.targets`                         | `StateBuffer.pair`                                 | Use `pair.read` / `pair.write`.                           |
| `StateBuffer.step()` after `setUniforms()`    | `step(uniforms?)`; staged uniforms are merged once | Existing `setUniforms` + `step` still works.              |
| Hardcoded `u_state`                           | `addProgram(..., { inputUniform })`                | Default stays `'u_state'`; automa needs no change.        |
| `GpuSurface.renderProgram(program)`           | `renderProgram(program, uniforms?)`                | Existing call sites keep working.                         |
| Default framebuffer only                      | `renderProgramTo(program, target, uniforms?)`      | New capability.                                           |
| `createStandardUniformValues(w, h, dpr, ...)` | options object                                     | Internal; update call sites.                              |
| `GpuSurface` has no lost/restore signal       | `isLost`, `onContextRestored()`                    | Consumers add a listener for data re-seeding.             |
| `GpuCanvas` has no custom draw hook           | `renderFrame` prop                                 | New capability; default path unchanged.                   |

`packages/glaze/package.json` must export the new modules:

```json
"./gpu/RenderTarget": "./src/gpu/RenderTarget.ts"
```

(and `./gpu/RenderTargetPair` if the pair lives in its own file).

---

## 6. Phases

### P0 — Correctness first

Goal: make the current feature set honest before adding multi-pass primitives.

- [x] **P0.1 — Texture-unit ownership**
    - `Program.setUniforms()` resets `#nextTextureUnit` to `0` at the start of each call.
    - `Program.render()` stops resetting the counter.
    - `Program.reinitialize()` resets it too.
    - Test: two sequential `setUniforms()` calls with textures both start at unit `0`.
- [x] **P0.2 — StateBuffer restore**
    - `StateBuffer.reinitialize()` recreates the pair and calls `reinitialize()` on every program.
    - Test: after `reinitialize()`, every program receives a fresh `WebGLProgram`.
- [x] **P0.3 — StateBuffer ownership**
    - Add a `StateBufferDestroyHook`, mirroring `ProgramDestroyHook`.
    - `GpuSurface.createStateBuffer()` passes a hook that removes the buffer from `#buffers`.
    - Make `StateBuffer.destroy()` idempotent.
    - Test: early `destroy()` removes the surface entry, and a later `surface.destroy()` does not
      double-destroy or throw.
- [x] **P0.4 — Surface restore signal**
    - Add `GpuSurface.isLost` and `GpuSurface.onContextRestored(listener)`.
    - Notify listeners after programs and buffers are reinitialized (targets/pairs arrive in P1).
    - Test: `webglcontextrestored` transitions `isLost` and calls each listener once.
- [x] **P0.5 — GpuCanvas restore gate**
    - Reset `renderedProgramRef.current = null` on restore.
    - Add the `onContextRestored` prop, invoked after the internal reset.
    - Test: covered at surface level; a React-level test is deferred (no DOM test environment).
- [x] **P0.6 — Destroy snapshots**
    - `GpuSurface.destroy()` iterates snapshots of its tracking sets.
    - Verify that destroy hooks that delete from the set cannot skip resources.
- [x] **P0.7 — Staged StateBuffer uniforms**
    - `StateBuffer.setUniforms()` stages values.
    - `StateBuffer.step(uniforms?)` merges staged + per-step + input texture and calls
      `Program.setUniforms()` once.
    - The input sampler is still the hardcoded `u_state` here; configurability lands with P1.5.
    - Test: no texture-unit drift across repeated `setUniforms` + `step` cycles.

**P0 acceptance:** a context-loss/restore cycle leaves shaders usable, `StateBuffer` programs alive,
`GpuCanvas` able to redraw a static program, and no double-destroy.

### P1 — Multi-pass primitives

Goal: expose the smallest API that supports arbitrary offscreen passes.

- [ ] **P1.1 — Extract render targets**
    - Move the texture/FBO code out of `StateBufferTargets` into `RenderTarget` and
      `RenderTargetPair`.
    - Preserve NEAREST/CLAMP behavior as the default; add `filter: 'linear'`.
    - Keep FBO creation failure cleanup (delete texture and framebuffer).
- [ ] **P1.2 — Surface factories and tracking**
    - Add `createRenderTarget`, `createRenderTargetPair`.
    - Track both resource kinds; recreate them on restore; destroy them with the surface.
    - `StateBuffer` creates its own pair internally so the pair is not tracked twice.
- [ ] **P1.3 — Viewport correctness**
    - `Program.render(viewport)`.
    - `ShapeBatcher.flush(viewport)`.
    - `GpuSurface` stores and exposes `deviceWidth/deviceHeight`.
- [ ] **P1.4 — Offscreen draw primitive**
    - `GpuSurface.renderProgramTo(program, target, uniforms?)`.
    - Bind target, set viewport, draw, restore default framebuffer and viewport.
    - Update standard uniforms so `u_resolution` follows the target while pointer normalization
      stays on the canvas CSS size.
- [ ] **P1.5 — StateBuffer on RenderTargetPair**
    - Replace `StateBufferTargets` with `RenderTargetPair`.
    - Configurable `inputUniform`.
    - `step()` samples `pair.read.texture` and writes to `pair.write`.
    - `pair.swap()` after the draw.
- [ ] **P1.6 — GpuCanvas `renderFrame`**
    - Add the prop and default to `surface.renderProgram(program, uniforms)`.
    - Add `onContextRestored`.
    - Keep shader swapping, `shouldRender`, `uniforms`, `onFrame` semantics unchanged.
- [ ] **P1.7 — Exports and docs**
    - Update `package.json` exports.
    - Update README with render targets, `renderProgramTo`, `renderFrame` and restore rules.

**P1 acceptance:** a consumer can render a program to a target, chain N passes, and draw the final
pass to the canvas without touching raw GL or canvas event listeners.

### P2 — Polish and hardening

- [ ] **P2.1 — Clear and blend policy**
    - Decide whether `renderProgramTo` accepts `{ clear?: CssColor | null; blend?: 'alpha' | 'none' }`.
    - Keep default behavior identical to today (alpha blend enabled, no automatic clear).
- [ ] **P2.2 — DPR and resize**
    - Resolve DPR per resize instead of only at construction, or document the fixed-DPR contract.
    - Consider a `ResizeObserver` so idle/static surfaces still update size.
    - Add an explicit screen-target helper if repeated resize code appears in consumers.
- [ ] **P2.3 — GPU limits**
    - Validate target size against `MAX_TEXTURE_SIZE` / `MAX_RENDERBUFFER_SIZE`.
    - Surface a clear error before allocating a target that cannot exist.
- [ ] **P2.4 — Robust texture detection**
    - Replace `instanceof WebGLTexture` with a realm-safe check, or introduce a small texture
      wrapper type in `UniformValue`.
- [ ] **P2.5 — Restore error isolation**
    - One failing restore listener must not prevent the others from running.
    - One failing resource `reinitialize()` should be reported with enough context to identify it.
- [ ] **P2.6 — Consumer cleanup**
    - Remove manual `webglcontextrestored` listeners from `fracture` and `randomart-ui`.
    - Re-seed `automa` through `onContextRestored`.
- [ ] **P2.7 — README alignment**
    - Only claim what the restore path actually guarantees.

### P3 — Consumer migration (deferred)

Not part of the `glaze` refactor, but the order to follow afterwards.

- [ ] **randomart-ui:** resume post-processing using `renderFrame` + `createRenderTargetPair`.
    - Add `postProcess` (or equivalent) to `RenderKey` so toggles redraw while paused.
    - Keep the effect registry, ordering, uniforms, UI and export policy in `randomart-ui`.
- [ ] **automa:** re-seed the simulation on context restore.
- [ ] **fracture:** simplify `useDemandRender` once `GpuCanvas` guarantees the post-restore draw.
- [ ] **art-canvas:** no expected change.
- [ ] **string-art / oeis-signal:** CPU-only, no expected change.
- [ ] **mol-demo:** uses `glaze3d`, unrelated.

---

## 7. Consumer impact

| Package        | Uses today                                      | Immediate impact                                 | Later migration                                          |
| -------------- | ----------------------------------------------- | ------------------------------------------------ | -------------------------------------------------------- |
| `automa`       | `GpuCanvas`, `createStateBuffer`, `StateBuffer` | None if `setUniforms` + `step` remains supported | Add `onContextRestored` re-seed                          |
| `randomart-ui` | `GpuCanvas`, `shouldRender`, `onMount`          | None                                             | Use `renderFrame` + targets when post-processing resumes |
| `art-canvas`   | `GpuCanvas`, `clockStore`, shader props         | None                                             | None                                                     |
| `fracture`     | `GpuCanvas`, `shouldRender`, `onMount`          | None                                             | Remove manual context-restore listeners                  |
| `string-art`   | `CpuCanvas`                                     | None                                             | None                                                     |
| `oeis-signal`  | `CpuCanvas`                                     | None                                             | None                                                     |
| `mol-demo`     | `glaze3d`                                       | None                                             | None                                                     |

`randomart-ui/src/components/RandomArtCanvas.tsx` currently resets its render gate through a manual
`webglcontextrestored` listener. Once P0.5 lands, the internal `GpuCanvas` reset is enough for the
visual redraw; the listener can be removed when the gate is next touched.

---

## 8. Test plan

### Unit tests

- `Program.test.ts`
    - `setUniforms` resets texture units on every call.
    - `render(viewport)` sets the supplied viewport, never `drawingBuffer*`.
    - `reinitialize()` resets the texture-unit counter.
- `RenderTarget.test.ts`
    - creates one texture and one framebuffer;
    - `resize` with identical dimensions is a no-op;
    - `reinitialize` always recreates at the current size;
    - incomplete framebuffer cleanup deletes both objects;
    - `destroy` is idempotent and calls the hook once.
- `RenderTargetPair.test.ts`
    - `read` / `write` swap correctly;
    - `resize` and `reinitialize` recreate exactly two targets;
    - `destroy` destroys both targets and notifies once.
- `StateBuffer.test.ts`
    - `reinitialize` recompiles programs and recreates the pair;
    - `destroy` notifies the surface once;
    - `step` binds the configured input uniform to `pair.read.texture`;
    - staged + per-step uniforms are merged into one `setUniforms` call;
    - repeated steps do not drift texture units.
- `GpuSurface.test.ts`
    - `isLost` follows context events;
    - `onContextRestored` listeners run after resource reinitialization;
    - `renderProgramTo` binds the target and restores the default framebuffer/viewport;
    - `destroy` snapshots its tracking sets;
    - `createStateBuffer` forgets an early-destroyed buffer.

### Manual / integration tests

- Lose and restore the context with `WEBGL_lose_context`:
    - a shader-only canvas redraws;
    - a `StateBuffer` consumer can step again after re-seeding;
    - a post-processing chain (once implemented) rebuilds its targets.
- Resize the canvas, change DPR, and verify target sizes and `u_resolution`.
- Verify that a render gate returning `false` still allows one draw after restore.
- Verify that destroying a surface with live targets, pairs and buffers does not throw.

---

## 9. File map

| File                                     | Change                                                                                      |
| ---------------------------------------- | ------------------------------------------------------------------------------------------- |
| `src/gpu/RenderTarget.ts`                | **New.** `RenderTarget` + options, internal FBO helpers.                                    |
| `src/gpu/RenderTargetPair.ts`            | **New.** `RenderTargetPair`.                                                                |
| `src/gpu/GpuSurface.ts`                  | Resource factories, tracking, restore listeners, `isLost`, `renderProgramTo`, device size.  |
| `src/gpu/StateBuffer.ts`                 | Use `RenderTargetPair`, program restore, destroy hook, configurable input, staged uniforms. |
| `src/gpu/shader/Program.ts`              | Explicit viewport, texture-unit reset, restore reset.                                       |
| `src/gpu/shader/setUniforms.ts`          | Options-based standard uniforms; robust texture detection.                                  |
| `src/gpu/batch/ShapeBatcher.ts`          | Explicit viewport in `flush`.                                                               |
| `src/gpu/types.ts`                       | `Viewport`, `RenderTargetOptions`, `UniformValues` aliases.                                 |
| `src/react/GpuCanvas.tsx`                | `renderFrame`, `onContextRestored`, restore gate reset.                                     |
| `src/react/types.ts`                     | `FrameRenderContext`, new props.                                                            |
| `package.json`                           | New exports.                                                                                |
| `README.md`                              | Architecture, multi-pass and restore contracts.                                             |
| `StateBuffer.test.ts` / new target tests | Coverage for the lifecycle above.                                                           |

---

## 10. Non-goals

- No post-processing registry, effect ordering, effect parameters or UI in `glaze`.
- No pass graph or automatic dependency resolution.
- No export pipeline: `randomart-ui` keeps its offscreen renderer.
- No automatic re-seed of `StateBuffer` application data.
- No general-purpose framebuffer API; `RenderTarget` is the supported abstraction.
- No float/half-float targets, MSAA targets or 3D targets in this refactor.
- No shape rendering into offscreen targets in P1.

---

## 11. Open questions

1. **Screen-sized targets:** keep manual `target.resize(...)` in consumers, or add
   `surface.createScreenRenderTarget()`? Recommendation: manual first; add the helper only if the
   same resize code appears in two consumers.
2. **Standard uniforms:** options object, or two helpers (`screenUniforms` / `targetUniforms`)?
   Recommendation: one options-based helper to keep pointer normalization explicit.
3. **`RenderTargetPair` naming:** `read`/`write` is preferred over `ping`/`pong`; confirm during
   implementation.
4. **Blend/clear:** add pass options in P1 or P2? Recommendation: P2, unless the first
   post-processing implementation needs it immediately.
5. **`renderFrame` error handling:** document a no-throw contract (current recommendation) or add
   `onRenderError`. Recommendation: no-throw contract first; add error reporting only if a real
   consumer needs it.

---

## 12. Done criteria

The refactor is done when:

- a consumer can create a target pair, run N offscreen passes, and draw the last pass to the canvas
  using only `GpuSurface` and `Program`;
- context loss/restore recreates every GPU resource and runs consumer re-seed callbacks;
- `StateBuffer` survives restore with live programs and configurable input sampling;
- `GpuCanvas` can delegate the draw without losing shader swapping or the render gate;
- `GpuSurface.destroy()` and every resource `destroy()` are idempotent;
- `vp -C packages/glaze check` and `vp -C packages/glaze test` pass;
- README and package exports match the implemented API.
