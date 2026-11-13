# glaze refactor — session handoff

**Plan:** `packages/glaze/REFACTOR.md`  
**State:** P0, P1, and P2 complete; P3 (Consumer migration) remaining (2026-11-13)  
**Last verified:** `vp check` passes across entire monorepo (807 files); `vp -C packages/glaze test` passes (105 tests).

---

## 1. Goal (short version)

Turn `GpuSurface` into a small GPU primitive layer: render to the default framebuffer or an
offscreen target, chain passes through ping-pong targets, survive context loss, and expose one
custom-draw seam to React. Application policy (effects, ordering, UI, export) stays in consumers.

Read `REFACTOR.md` §3–§6 before continuing. This file records what is done and what comes next.

---

## 2. What was done in this session (P2 completion)

| Area                       | Change                                                                                                                                                                                                                                                                                                                                                     |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Consumer cleanup (P2.6)    | Removed manual `canvas.addEventListener('webglcontextrestored')` in `fracture` (`Perturbation.tsx` and `demandRender.ts`) in favor of `surface.onContextRestored`. Migrated `randomart-ui` (`RandomArtCanvas.tsx`) to `<GpuCanvas onContextRestored={...}>`. Re-seeded `automa` (`Scene.tsx`) on context restore via `onContextRestored={initSimulation}`. |
| DPR & resize review (P2.2) | Documented fixed-DPR contract at surface creation and dynamic frame-loop device resolution sizing. Target resize policy remains consumer-owned.                                                                                                                                                                                                            |
| README alignment (P2.7)    | Updated `packages/glaze/README.md` with `RenderPassOptions` (`clear`, `blend`), context loss error isolation guarantees, resource lifecycle & ownership, and DPR/resize contracts.                                                                                                                                                                         |

---

## 3. Current State & Gotchas

- **All tests pass:** 105/105 tests in `glaze`, 37/37 tests in `randomart-ui`.
- **Full monorepo check passes:** `vp check` clean across all 807 files.
- **Consumer status:** Consumers no longer register direct DOM WebGL event listeners on `canvas`; they use `surface.onContextRestored(...)` or `<GpuCanvas onContextRestored={...}>`.
- **GpuCanvas draw guarantee:** `renderedProgramRef` is reset to `null` on restore, ensuring static/paused programs render immediately after context recovery even when `shouldRender` is gated.

---

## 4. Next action (for next session)

Proceed to **P3 — Consumer migration**:

1. **`randomart-ui` post-processing pipeline:**
   Implement offscreen pass chaining using `createRenderTargetPair` and `renderFrame` as specified in `packages/randomart-ui/POST-PROCESSING.md`.
2. Ensure effect registry, UI controls, export pipeline, and post-process dirty flagging remain in `randomart-ui`.

---

## 5. Useful commands

```bash
vp -C packages/glaze test
vp -C packages/glaze check --fix
vp -C packages/randomart-ui test
vp -C packages/randomart-ui check
vp check
```
