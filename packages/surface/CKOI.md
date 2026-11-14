# @repo/surface — Architecture & Reference

> High-performance, minimalist WebGL2 fullscreen canvas and GPGPU engine for creative coding, procedural graphics, and simulations.

---

## 1. Philosophy & Design Principles

`@repo/surface` replaces heavy, monolithic canvas abstractions (such as `@repo/glaze`) with a focused, composable foundation:

1. **Shadertoy-style Simplicity**: A single full-screen triangle (`gl_VertexID`) driven by standard fragment shaders (`mainImage` or `main`), with automatic injection of Shadertoy uniforms (`iResolution`, `iTime`, `iTimeDelta`, `iFrame`, `iMouse`).
2. **Separation of Concerns**:
    - `SurfaceCanvas` is strictly a reactive WebGL2 canvas viewport.
    - Camera state and interaction handling are decoupled from rendering into standalone modules (`Camera2D`, `useCameraControls`).
3. **No Over-Engineering**: Clean TypeScript primitives without branded wrappers (`createPositiveNumber`, `CssColor`, etc.) or unnecessary observable hierarchies.
4. **Resilient GPU Lifecycle**: Seamless context loss and restoration (`webglcontextrestored`), zero-flicker shader hot-reloading (maintains previous valid program on compile error), and resource ownership tracking.

---

## 2. Size & Unit Contract

| Property                               | Space / Units                                          | Description                                                  |
| -------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------ |
| `surface.width` / `height`             | CSS pixels                                             | Logical canvas size on page                                  |
| `surface.deviceWidth` / `deviceHeight` | Physical device pixels                                 | Actual framebuffer backing store dimensions (`width * dpr`)  |
| `surface.dpr`                          | Ratio (`devicePixelRatio`)                             | Device pixel ratio (clamped to 1–2 by default)               |
| `iResolution`                          | Device pixels (`vec3(deviceWidth, deviceHeight, 1.0)`) | Matches Shadertoy convention for fragment grid alignment     |
| `iMouse`                               | Device pixels (`vec4(x, y, clickX, clickY)`)           | Normalized to device coordinates to align with `iResolution` |
| `Camera2D` / controls                  | CSS pixels                                             | Panning, focal points, and zoom math operate in CSS space    |

---

## 3. Package Structure & Exports

```
packages/surface/
├── core/
│   ├── Camera2D.ts         # Reactive 2D camera with zoom bounds and focal zoom
│   ├── Clock.ts            # Animation clock with play/pause and delta time
│   └── FrameLoop.ts        # RAF management synchronized with playback
├── gpu/
│   ├── Surface.ts          # WebGL2 lifecycle, full-screen quad, context restore
│   ├── Program.ts          # Shader compilation and active program caching
│   ├── setUniforms.ts      # Uniform setters with texture binding & TypedArray support
│   ├── RenderTarget.ts     # Offscreen FBO + texture wrapper
│   ├── TargetPair.ts       # Ping-pong double-buffer for GPGPU simulation
│   └── ShaderError.ts      # Structured shader compile error reporting
└── react/
    ├── SurfaceCanvas.tsx   # React canvas component with render gating & DPR
    ├── renderSurfaceFrame.ts# Frame rendering step with renderFrame interception
    ├── useCamera2D.ts      # useSyncExternalStore hook for Camera2D
    ├── useCameraControls.ts# Pointer / wheel canvas event handlers for pan & zoom
    └── usePlayback.ts      # Synchronization hook for playback stores (play/pause/reset)
```

---

## 4. Key APIs

### `Surface` (`@repo/surface/gpu/Surface`)

Main engine managing the WebGL2 context, program swapping, resource tracking, and drawing:

```ts
const surface = new Surface(canvas, { dpr: window.devicePixelRatio });
surface.setProgram(fragmentSource);
surface.createRenderTarget({ width: 512, height: 512 });
surface.createTargetPair({ width: 512, height: 512 });
surface.render({ u_param: 1.0 });
surface.destroy();
```

- **Resource Ownership**: Render targets and target pairs created via `surface.createRenderTarget` / `surface.createTargetPair` are automatically owned, reinitialized on context restoration, and destroyed when the surface is destroyed.

### `SurfaceCanvas` (`@repo/surface/react/SurfaceCanvas`)

Declarative React component wrapping `Surface`:

```tsx
<SurfaceCanvas
    fragmentShader={glslSource}
    uniforms={(surface) => ({ u_color: [1, 0, 0] })}
    shouldRender={(surface) => isDirty} // Render gate: skips idle redraws
    renderFrame={({ surface, program, uniforms }) => {
        // Custom multi-pass pipeline: post-processing, FBO ping-pong, etc.
        surface.renderProgram(program, uniforms);
    }}
    onFrame={(surface) => {
        /* step simulation */
    }}
    onContextRestored={(gl) => {
        /* re-upload custom data textures */
    }}
    {...canvasProps} // Passes standard HTML canvas attributes & handlers
/>
```

- **Render Gate (`shouldRender`)**: Prevents unnecessary continuous redraws for static or demand-rendered scenes (e.g. fractal deep zooms), while guaranteeing one-shot redraws on shader change or context restore.
- **Custom Render Pass (`renderFrame`)**: Intercepts the default `surface.renderProgram(program, extraUniforms)` call, allowing consumers to route rendering through offscreen `TargetPair` / `RenderTarget` passes before blitting to screen.
- **Playback Synchronization**: Subscribes to `globalPlaybackStore` play/pause state and reset events (calling `surface.clock.reset()` and scheduling a redraw).

### `usePlayback` (`@repo/surface/react/usePlayback`)

Shared playback controls across all `SurfaceCanvas` instances:

```tsx
const { isPlaying, togglePlay, play, pause, reset } = usePlayback();

<button onClick={togglePlay}>{isPlaying ? 'Pause' : 'Play'}</button>
<button onClick={reset}>Reset</button>
```

- `globalPlaybackStore` provides global synchronization: `play()`, `pause()`, `togglePlay()`, `reset()`, and `onReset(listener)`.

### `Camera2D` & `useCameraControls` (`@repo/surface/core/Camera2D`, `@repo/surface/react/useCameraControls`)

Decoupled reactive 2D navigation:

```ts
const camera = new Camera2D({ minZoom: 0.1, maxZoom: 1e15 });
camera.subscribe(() => console.log('Camera moved:', camera.x, camera.y, camera.zoom));
camera.zoomBy(1.5, { x: 400, y: 300 }); // Cursor-anchored zoom
```

```tsx
function InteractiveCanvas({ camera }: { camera: Camera2D }) {
    const cameraVersion = useCamera2D(camera);
    const controls = useCameraControls(camera, {
        pan: { button: 0 }, // Left-click pan
        zoom: { speed: 1 / 250 }, // Smooth cursor-anchored wheel zoom
    });

    return (
        <SurfaceCanvas
            fragmentShader={fractalShader}
            uniforms={{
                u_camera: [camera.x, camera.y, camera.zoom],
                u_aspect: camera.aspect,
            }}
            shouldRender={() => isMoving}
            {...controls}
        />
    );
}
```

### Offscreen GPGPU (`@repo/surface/gpu/TargetPair`)

Lightweight ping-pong buffers for iterative compute simulations (used by `@repo/automa`):

```ts
const pair = surface.createTargetPair({ width: 512, height: 512, type: gl.FLOAT });
pair.bindWrite();
// Draw simulation step into write buffer
pair.swap();
// pair.readTexture is now the updated state
```

---

## 5. Ecosystem Adoption

`@repo/surface` powers the interactive GPU workspaces in the monorepo:

- **`@repo/art-canvas`**: Generative art workbench with live shader editing and hot reload.
- **`@repo/automa`**: GPGPU cellular automata using `TargetPair` ping-pong passes and `useCameraControls`.
- **`@repo/fracture`**: High-precision fractal explorer (Mandelbrot & Julia naive, double-split ~48-bit precision, and orbit perturbation) with demand rendering and deep-zoom camera navigation.
