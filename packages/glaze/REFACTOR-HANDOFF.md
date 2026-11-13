# glaze refactor — session handoff

**Plan:** `packages/glaze/REFACTOR.md`
**State:** P0, P1, and core P2 hardening complete (P2.1, P2.3, P2.4, P2.5 done; P2.2, P2.6, P2.7 remaining) (2026-11-13)
**Last verified:** `vp -C packages/glaze check` and `vp -C packages/glaze test` pass (105 tests). All consumer packages (`automa`, `randomart-ui`, `fracture`, `art-canvas`) pass `vp check`.

---

## 1. Goal (short version)

Turn `GpuSurface` into a small GPU primitive layer: render to the default framebuffer or an
offscreen target, chain passes through ping-pong targets, survive context loss, and expose one
custom-draw seam to React. Application policy (effects, ordering, UI, export) stays in consumers.

Read `REFACTOR.md` §3–§6 before continuing. This file records what is done and what comes next.

---

## 2. What was done in this session (P2 core hardening)

| Area                           | Change                                                                                                                                                                                                                                                                |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `RenderPassOptions` (P2.1)     | Added `RenderPassOptions { clear?: CssColor \| null; blend?: 'alpha' \| 'none' }` in `src/gpu/types.ts`. Supported in `GpuSurface.renderProgramTo` and `GpuSurface.renderProgram`. Defaults preserve existing behavior (alpha blend enabled, no clear).               |
| GPU limits check (P2.3)        | Added dimension validation in `RenderTarget.ts` (construction and `resize`): enforces positive finite dimensions and checks against `MAX_TEXTURE_SIZE` via `gl.getParameter`.                                                                                         |
| Realm-safe textures (P2.4)     | Replaced brittle `instanceof WebGLTexture` in `src/gpu/shader/setUniforms.ts` with a realm-safe check (`Symbol.toStringTag`, `instanceof` guard, TypedArray/Array guard, and safe fallback). Does not crash in environments without a global `WebGLTexture`.          |
| Restore error isolation (P2.5) | In `GpuSurface.#onContextRestored`, isolated `#batch.reinitialize()`, each `program`, `target`, `pair`, `buffer` reinitialization, and each listener in independent try/catch blocks with diagnostic logging. Snapshotted `this.#programs` iteration.                 |
| Tests                          | Added unit tests in `RenderTarget.test.ts` (dimensions and `MAX_TEXTURE_SIZE`), `GpuSurface.test.ts` (clear/blend options, restore error isolation for resources and listeners), and `Program.test.ts` (cross-realm texture detection). Total tests: **105 passing**. |

---

## 3. Current State & Gotchas

- **105/105 tests passing** in `glaze`.
- **Consumer status:** All 4 consumer packages (`automa`, `randomart-ui`, `fracture`, `art-canvas`) pass formatting, linting, and type-checking without regressions.
- **Pass options:** `renderProgramTo` and `renderProgram` accept `{ clear?: CssColor | null; blend?: 'alpha' | 'none' }`. `clear` uses `parseColor(color)`. `blend: 'none'` temporarily disables `gl.BLEND` during drawing and restores it.
- **Restore error isolation:** Errors during context restore are logged to `console.error` and do not prevent remaining resources or listeners from running.
- **Linter rules:** Keep using `new Set(this.#set)` for snapshot iterations and avoid unsafe assertions from `any` (e.g. `gl.getParameter` returns `any`, inspect with `typeof`).

---

## 4. Next action (for next session)

Complete the remaining items of **P2 (Polish and hardening)** and proceed to **P3**:

1. **P2.2 — DPR and resize:** Review dynamic DPR changes (e.g. moving windows between screens) and static surface resize observation (e.g. `ResizeObserver` for paused/idle canvases).
2. **P2.6 — Consumer cleanup:**
    - Remove manual `webglcontextrestored` listeners from `packages/fracture` and `packages/randomart-ui` (the internal `GpuCanvas` reset now handles this).
    - Re-seed `automa` simulation through `onContextRestored` / `surface.onContextRestored`.
3. **P2.7 — README alignment:** Align `packages/glaze/README.md` with final guarantees (clear/blend pass options, resource lifecycle, and context restore isolation).
4. **P3 — Consumer migration:** Implement the post-processing pipeline in `randomart-ui` via `createRenderTargetPair` and `renderFrame` as planned in `packages/randomart-ui/POST-PROCESSING.md`.

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
