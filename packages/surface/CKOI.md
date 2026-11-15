# @repo/surface — Architecture & Reference

> High-performance, minimalist WebGL2 fullscreen canvas and Canvas2D engine for creative coding, procedural graphics, and simulations.

---

## 1. Philosophy & Design Principles

`@repo/surface` replaces heavy, monolithic canvas abstractions (such as `@repo/glaze`) with a focused, composable foundation:

1. **Shadertoy-style Simplicity**: A single full-screen triangle (`gl_VertexID`) driven by standard fragment shaders (`mainImage` or `main`), with automatic injection of Shadertoy uniforms (`iResolution`, `iTime`, `iTimeDelta`, `iFrame`, `iMouse`).
2. **Explicit Backend Vocabulary**:
    - `GpuSurface` / `CpuSurface` name the backend runtime; the React components mirror it with
      `<GpuCanvas>` / `<CpuCanvas>`. There is no bare `Surface` abstraction.
3. **Separation of Concerns**:
    - `GpuCanvas` and `CpuCanvas` are strictly reactive canvas viewports.
    - Camera state and interaction handling are decoupled from rendering into standalone modules (`Camera2D`, `useCameraControls`).
    - Drawing helpers and styles remain in the application layer; the runtime handles sizing, DPR, frame loops, and context lifecycle.
4. **No Over-Engineering**: Clean TypeScript primitives without branded wrappers (`createPositiveNumber`, `CssColor`, etc.) or unnecessary observable hierarchies.
5. **Resilient GPU Lifecycle**: Seamless context loss and restoration (`webglcontextrestored`), zero-flicker shader hot-reloading (maintains previous valid program on compile error), and resource ownership tracking.

---

## 2. Size & Unit Contract

| Property                               | Space / Units                                          | Description                                                          |
| -------------------------------------- | ------------------------------------------------------ | -------------------------------------------------------------------- |
| `surface.width` / `height`             | CSS pixels                                             | Logical canvas size on page                                          |
| `surface.deviceWidth` / `deviceHeight` | Physical device pixels                                 | Actual framebuffer backing store dimensions (`round(width * dpr)`)   |
| `surface.dpr`                          | Ratio (`devicePixelRatio`)                             | Device pixel ratio (reads `window.devicePixelRatio`, fallback to 1)  |
| `iResolution`                          | Device pixels (`vec3(deviceWidth, deviceHeight, 1.0)`) | Matches Shadertoy convention for fragment grid alignment             |
| `iMouse`                               | Device pixels (`vec4(x, y, clickX, clickY)`)           | Normalized to device coordinates to align with `iResolution`         |
| `Camera2D` / controls                  | CSS pixels                                             | Panning, focal points, and zoom math operate in CSS space            |
| CPU drawing coordinate space           | CSS pixels                                             | Context scaled by `dpr` so drawing calls work directly in CSS pixels |

---

## 3. Package Structure & Exports

```
packages/surface/
├── core/
│   ├── Camera2D.ts         # Reactive 2D camera with zoom bounds and focal zoom
│   ├── Clock.ts            # Animation clock with play/pause and delta time
│   ├── FrameLoop.ts        # RAF management synchronized with playback
│   └── canvasSize.ts       # Shared CSS/device sizing contract & DPR resolution
├── cpu/
│   └── CpuSurface.ts       # Canvas2D lifecycle, frame loop, clear, DPR transform
├── gpu/
│   ├── GpuSurface.ts       # WebGL2 lifecycle, full-screen quad, context restore
│   ├── Program.ts          # Shader compilation and active program caching
│   ├── setUniforms.ts      # Uniform setters with texture binding & TypedArray support
│   ├── RenderTarget.ts     # Offscreen FBO + texture wrapper
│   ├── TargetPair.ts       # Ping-pong double-buffer for GPGPU simulation
│   └── ShaderError.ts      # Structured shader compile error reporting
└── react/
    ├── CpuCanvas.tsx       # React Canvas2D component with frame loop & DPR
    ├── GpuCanvas.tsx       # React WebGL2 component with render gating & DPR
    ├── renderGpuFrame.ts   # Frame rendering step with renderFrame interception
    ├── useCamera2D.ts      # useSyncExternalStore hook for Camera2D
    ├── useCameraControls.ts# Pointer / wheel canvas event handlers for pan & zoom
    └── usePlayback.ts      # Synchronization hook for playback stores (play/pause/reset)
```

---

## 4. Key APIs

### `GpuSurface` (`@repo/surface/gpu/GpuSurface`)

Main engine managing the WebGL2 context, program swapping, resource tracking, and drawing:

```ts
const surface = new GpuSurface(canvas);
surface.setProgram(fragmentSource);
surface.createRenderTarget({ width: 512, height: 512 });
surface.createTargetPair({ width: 512, height: 512 });
surface.render({ u_param: 1.0 });
surface.destroy();
```

- **Resource Ownership**: Render targets and target pairs created via `surface.createRenderTarget` / `surface.createTargetPair` are automatically owned, reinitialized on context restoration, and destroyed when the surface is destroyed.

### `GpuCanvas` (`@repo/surface/react/GpuCanvas`)

Declarative React component wrapping `GpuSurface`:

```tsx
<GpuCanvas
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

### `CpuSurface` (`@repo/surface/cpu/CpuSurface`)

Minimal Canvas2D runtime managing context lifecycle, resize, DPR scaling, frame loop, and clearing:

```ts
const surface = new CpuSurface(canvas, { dpr: 2 });
surface.onFrame((s) => {
    s.clear('#000000');
    s.ctx.fillStyle = '#ffffff';
    s.ctx.fillRect(10, 10, 100, 50); // CSS pixels
});
surface.destroy();
```

- **CSS Coordinate Space**: Context transform is set to `(dpr, 0, 0, dpr, 0, 0)` on each frame and at construction, allowing drawing code to operate directly in CSS pixels.
- **Transform-Preserving Clear**: `surface.clear(color?)` preserves transform and resets `globalAlpha` / `globalCompositeOperation` locally.
- **Zero Auto-Clear**: Clearing policy is owned by the application (enabling persistent trails, accumulators, and partial blits).

### `CpuCanvas` (`@repo/surface/react/CpuCanvas`)

Declarative React component wrapping `CpuSurface`:

```tsx
<CpuCanvas
    onMount={(surface) => {
        /* one-time setup */
    }}
    onFrame={(surface) => {
        surface.clear();
        /* draw with surface.ctx */
    }}
    {...canvasProps}
/>
```

- **Mount & Frame Hooks**: `onMount` fires once when the canvas node mounts; `onFrame` receives the `CpuSurface` instance each frame (the frame loop only runs if `onFrame` is provided).

### `usePlayback` (`@repo/surface/react/usePlayback`)

Shared playback controls across all `GpuCanvas` instances:

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
        <GpuCanvas
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
