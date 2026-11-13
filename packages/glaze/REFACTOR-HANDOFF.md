# glaze refactor — session handoff

**Plan:** `packages/glaze/REFACTOR.md`
**State:** P0 and P1 complete, P2 not started (2026-11-13)
**Last verified:** `vp -C packages/glaze check` and `vp -C packages/glaze test` pass (97 tests). All consumer packages (`automa`, `randomart-ui`, `fracture`, `art-canvas`) pass `vp check`.

---

## 1. Goal (short version)

Turn `GpuSurface` into a small GPU primitive layer: render to the default framebuffer or an
offscreen target, chain passes through ping-pong targets, survive context loss, and expose one
custom-draw seam to React. Application policy (effects, ordering, UI, export) stays in consumers.

Read `REFACTOR.md` §3–§6 before continuing. This file records what is done and what comes next.

---

## 2. What was done in this session (P1)

| Area               | Change                                                                                                                                                                                                                                                                                                                                                     |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `RenderTarget`     | **New module** (`src/gpu/RenderTarget.ts`). Texture + private FBO, `resize(w, h)`, `reinitialize()`, `clear(r, g, b, a)`, idempotent `destroy()` with owner hook, and `filter: 'nearest' \| 'linear'` support.                                                                                                                                             |
| `RenderTargetPair` | **New module** (`src/gpu/RenderTargetPair.ts`). Ping-pong pair exposing `.read` and `.write`, `swap()`, `resize()`, `reinitialize()`, `clear()`, idempotent `destroy()`.                                                                                                                                                                                   |
| `Viewport` & types | Added `Viewport`, `RenderTargetOptions`, `UniformValues` to `src/gpu/types.ts`.                                                                                                                                                                                                                                                                            |
| `Program`          | `render(viewport: Viewport)` now requires an explicit viewport (decoupling from drawing buffer size).                                                                                                                                                                                                                                                      |
| `ShapeBatcher`     | `flush(viewport: Viewport)` accepts physical device pixels; projection stays CSS-dimensioned.                                                                                                                                                                                                                                                              |
| `GpuSurface`       | Added `deviceWidth` / `deviceHeight`. Added `createRenderTarget()`, `createRenderTargetPair()`, tracking sets, snapshot iteration on `destroy()`, and recreation on `webglcontextrestored`. Added `renderProgramTo(program, target, uniforms?)` which handles FBO binding, target viewport, standard uniforms, and restoring default framebuffer/viewport. |
| `setUniforms`      | Replaced positional `createStandardUniformValues(w, h, dpr, ...)` with options-object `StandardUniformInput` (`resolution` physical target, `pointerResolution` CSS canvas).                                                                                                                                                                               |
| `StateBuffer`      | Replaced internal `StateBufferTargets` with `RenderTargetPair` (`buffer.pair`). Added configurable `inputUniform` option in `addProgram(name, src, { inputUniform })` (defaults to `'u_state'`). Deprecated alias `StateBufferTargets` preserved for backward safety.                                                                                      |
| `GpuCanvas`        | Added `renderFrame?: (context: FrameRenderContext) => void` prop. Delegates drawing while keeping shader swapping, render gate, and clock store intact. Computes `uniforms` once and passes them in context.                                                                                                                                               |
| Exports & README   | Added exports `./gpu/RenderTarget` and `./gpu/RenderTargetPair` in `package.json`. Updated README with targets, passes, and context loss rules.                                                                                                                                                                                                            |
| Tests              | Added `RenderTarget.test.ts` (12 tests), `RenderTargetPair.test.ts` (10 tests). Added `GpuSurface.test.ts` cases for `renderProgramTo` and target forget hooks. Added `StateBuffer.test.ts` cases for configured `inputUniform` and `pair.read.texture`. Total tests: 97 passing.                                                                          |

---

## 3. Current State & Gotchas

- **Breaking change landed:** `Program.render(viewport)` and `ShapeBatcher.flush(viewport)` take a viewport. Internal calls within `glaze` are updated.
- **`StateBuffer.pair`:** `buffer.pair` is the primary way to access ping-pong targets (`buffer.pair.read`, `buffer.pair.write`). `buffer.targets` remains as a deprecated alias.
- **Snapshot loops:** The linter prefers `new Set(this.#set)` over `[...this.#set]` or `Array.from(this.#set)` for snapshot iterations in `GpuSurface`.
- **Consumer status:** All 4 existing consumers (`automa`, `randomart-ui`, `fracture`, `art-canvas`) pass formatting, linting, and type-checking without regressions.

---

## 4. Next action (for next session)

Start with **P2 (Polish and hardening)** as described in `REFACTOR.md` §6:

1. **P2.1 — Clear and blend policy:** Decide whether `renderProgramTo` accepts `{ clear?: CssColor | null; blend?: 'alpha' | 'none' }`.
2. **P2.2 — DPR and resize:** Review dynamic DPR changes and static surface resize observation (e.g. `ResizeObserver`).
3. **P2.3 — GPU limits:** Validate target dimensions against `MAX_TEXTURE_SIZE` / `MAX_RENDERBUFFER_SIZE` before allocating.
4. **P2.4 — Robust texture detection:** Replace `instanceof WebGLTexture` with a realm-safe check in `setUniforms.ts`.
5. **P2.5 — Restore error isolation:** Wrap listener and resource `reinitialize()` calls in try/catch to avoid one failure breaking the chain.
6. **P2.6 — Consumer cleanup:** Clean up manual `webglcontextrestored` listeners in `fracture` and `randomart-ui`; re-seed `automa` on context restore.
7. **P2.7 — README alignment:** Align docs with final guarantees.

Followed by **P3 (Consumer migration)**, particularly implementing the post-processing pipeline in `randomart-ui` via `createRenderTargetPair` and `renderFrame`.

---

## 5. Useful commands

```bash
vp -C packages/glaze test
vp -C packages/glaze check --fix
vp -C packages/automa check
vp -C packages/randomart-ui check
vp -C packages/fracture check
vp -C packages/art-canvas check
```
