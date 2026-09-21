# @repo/glaze

> p5-style drawing immediacy and three.js-style shader freedom, in one package.

---

## 🎯 Intention & Concept

`@repo/glaze` is built on a unifying premise: **a shape on the canvas and a shader on the canvas are the same mechanism.**

Drawing primitives (`surface.circle`, `surface.rect`, `surface.line`, `surface.text`) offer immediate-mode immediacy akin to p5.js, while custom programs (fragment shaders with uniforms rendered via fullscreen triangles) provide full three.js-style freedom when procedural rendering is required. Under the hood on WebGL2, both share a single pipeline: vector shapes are CPU-tessellated and batched into draw calls, while custom programs execute full-screen render passes.

The toolkit provides two sibling runtimes over a shared foundation:

- **`CpuSurface`**: Immediate-mode Canvas2D wrapper with chainable fluent draw methods.
- **`GpuSurface`**: WebGL2 surface supporting shape drawing, custom shader programs, and `StateBuffer` for GPGPU simulations on ping-pong texture pairs.

Both share a common architecture including a frame loop, camera controller, and input store. Drawing operates entirely in **world space**, where the camera transformation matrix is automatically applied so pan, zoom, and pointer mapping are solved once globally rather than per sketch. React integration is provided through declarative wrappers (`<CpuCanvas>`, `<GpuCanvas>`) and headless hooks (`useCpuSurface`, `useGpuSurface`), cleanly decoupling lifecycle management from rendering loops.

## 🥷 Brainstorming, Inspirations & Credits

- **Visual Inspo:** p5.js immediate-mode sketching, Three.js shader material workflows, and modern web-based generative art frameworks.
- **Math / Papers:** 2D affine transformation matrices, camera projection spaces, and cellular automata GPGPU state transition algorithms.
- **Borrowed Code & Algorithms:** WebGL2 vertex array batching and ping-pong framebuffer texture swapping.

## ⚠️ Patterns & Gotchas

- **Batched GPU Shapes:** GPU shapes are tessellated on the CPU into a dynamic vertex buffer and rendered in a single draw call per frame to minimize state changes.
- **World-Space Coordinate Mapping:** Drawing methods operate in world space. Camera pans and zooms are applied automatically, ensuring consistent pointer math and anti-aliased MSAA rendering.
- **Dynamic Interaction Bridge:** Gestures defined through `canvasInteractions` update seamlessly in React without forcing DOM event listener teardown or re-binding.
- **Context Loss Recovery:** The GPU runtime intercepts `webglcontextlost` and automatically re-initializes shaders, textures, and GPU resources upon restoration.
- **Classes over Factories:** Core modules (`CpuSurface`, `GpuSurface`, `Camera`, `FrameLoop`, `InputStore`, `StateBuffer`, `Program`) are pure imperative classes; `createX` functions act as thin instantiator wrappers.

## 📚 References

- [raylib](https://www.raylib.com/)
- [p5.js](https://p5js.org/)
- [Three.js](https://threejs.org/)
- [React Three Fiber](https://r3f.docs.pmnd.rs/)

---

_Part of the [Creative Playground](https://joska-p.github.io/playground). Technical API reference generated at `/docs/api/glaze/`._
