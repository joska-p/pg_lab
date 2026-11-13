# glaze refactor — session handoff

**Plan:** `packages/glaze/REFACTOR.md`
**State:** P0 complete, P1 not started (2026-11-13)
**Last verified:** `vp -C packages/glaze check` and `vp -C packages/glaze test` pass (71 tests).

---

## 1. Goal (short version)

Turn `GpuSurface` into a small GPU primitive layer: render to the default framebuffer or an
offscreen target, chain passes through ping-pong targets, survive context loss, and expose one
custom-draw seam to React. Application policy (effects, ordering, UI, export) stays in consumers.

Read `REFACTOR.md` §3–§6 before continuing. This file only records what is done and what comes
next.

---

## 2. What was done in this session (P0)

| Area          | Change                                                                                                                                                                                                                                                                         |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Program`     | `setUniforms()` resets the texture-unit cursor to `0` on every call; `render()` no longer resets it; `reinitialize()` resets it.                                                                                                                                               |
| `StateBuffer` | `reinitialize()` recreates the pair **and** recompiles every program. `destroy()` is idempotent and calls `StateBufferDestroyHook` once. `setUniforms()` stages values; `step(uniforms?)` merges staged + per-step + `u_state` and calls `Program.setUniforms()` exactly once. |
| `GpuSurface`  | `createStateBuffer()` passes a forget-hook. `destroy()` iterates snapshots. Added `isLost` and `onContextRestored(listener)`; listeners run after resources are reinitialized.                                                                                                 |
| `GpuCanvas`   | Added `onContextRestored` prop and subscription. On restore it clears `renderedProgramRef` **before** invoking the consumer callback, so a `shouldRender={() => false}` canvas still redraws once.                                                                             |
| Tests         | `Program.test.ts` (texture-unit reset), `StateBuffer.test.ts` (restore, destroy hook, staged uniforms, swap), new `GpuSurface.test.ts` (fake canvas + fake GL, restore signal, ownership).                                                                                     |

No public import path was removed. `StateBuffer.targets` and `StateBufferTargets` still exist; they
become `StateBuffer.pair` / `RenderTargetPair` in P1 and are the next breaking change.

### Deliberate deviations / notes

- `StateBuffer.step()` still hardcodes `u_state`. Configurable `inputUniform` is P1.5.
- `GpuSurface.onContextRestored` currently notifies after programs and buffers only because render
  targets and pairs do not exist yet. Revisit the loop when P1 lands.
- Snapshot loops use `Array.from(set)` rather than `[...set]`: the repo lint flags the spread as
  useless. Semantics are identical (snapshot before iteration).
- No React-level test for `GpuCanvas`: tests run in Node (no jsdom). The reset itself is covered by
  the `GpuSurface` restore test plus a manual check in the app.
- `vp check` sorts imports; run `vp -C packages/glaze check --fix` after edits.

---

## 3. Next action

Start with **P1.1 + P1.2** (they are hard to separate in practice):

1. Extract `RenderTarget` (texture + private FBO, `resize`, `reinitialize`, `clear`, idempotent
   `destroy` with owner hook) and `RenderTargetPair` (`read`/`write`, `swap`, `resize`,
   `reinitialize`, `clear`, idempotent `destroy`) from `StateBufferTargets`.
2. Preserve current defaults: RGBA8, NEAREST, CLAMP_TO_EDGE, and FBO-failure cleanup that deletes
   both texture and framebuffer.
3. `RenderTargetOptions.filter: 'linear' | 'nearest'` (default `'nearest'`).
4. Add `GpuSurface.createRenderTarget()` / `createRenderTargetPair()`, track them, recreate them on
   restore, destroy them with the surface, and pass forget-hooks.
5. `StateBuffer` constructs its own pair **without** a surface hook so the pair is not tracked
   twice; keep its destroy path owning the pair.

Then P1.3 → P1.7 in the order listed in `REFACTOR.md` §6. Do not pull consumer migration (P3) into
this refactor.

### Concrete gotchas for P1

- `Program.render()` is called from `GpuSurface.renderProgram`, `GpuSurface.#drawText` and (soon)
  `renderProgramTo`. When you add `render(viewport)`, update all three and `StateBuffer.step`
  (which draws manually today).
- `ShapeBatcher.flush(viewport)` must receive physical device pixels; its projection keeps using
  CSS dimensions. `GpuSurface.#flushBatch()` is the single call site.
- Standard uniforms: `u_resolution` becomes target physical size; pointer normalization must stay on
  canvas CSS size. The options-object helper replaces the positional
  `createStandardUniformValues(width, height, dpr, …)`; update `GpuSurface.renderProgram` and the
  text draw path.
- New files need entries in `packages/glaze/package.json` exports
  (`./gpu/RenderTarget`, `./gpu/RenderTargetPair`).
- `GpuCanvas.renderFrame` is P1.6. Keep the default path identical:
  `surface.renderProgram(program, uniforms)`. `GpuCanvas` already subscribes to
  `onContextRestored`; do not subscribe twice.
- `README.md` still claims generic context-loss recovery and does not mention targets. Update it in
  P1.7 (and make the restore claim precise: glaze resources only, app data must be re-seeded).

### Tests to add with P1

Follow the plan's §8: `RenderTarget.test.ts`, `RenderTargetPair.test.ts`, plus `GpuSurface`
cases for `renderProgramTo` (bind target, viewport, restore default framebuffer/viewport) and
`StateBuffer` cases for configured input uniform and `pair.swap()`.

Node test environment notes:

- There is no DOM. `GpuSurface.test.ts` stubs `globalThis.window` and builds a fake canvas.
- Program texture detection needs a `WebGLTexture` global in Node; see
  `withFakeWebGLTexture()` in `Program.test.ts`. P2.3 will remove this fragility.

---

## 4. Useful commands

```bash
vp -C packages/glaze test
vp -C packages/glaze check --fix
vp -C packages/automa check   # StateBuffer consumer, currently green
```

Manual context-loss check (browser): `WEBGL_lose_context` on a canvas, then verify a static
`shouldRender={() => false}` program redraws and a `StateBuffer` consumer can step again after its
`onContextRestored` re-seed.
