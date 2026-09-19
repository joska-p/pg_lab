import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { createCamera } from "../core/Camera";
import { createDevicePixelRatio, createZoomFactor } from "../core/types";
import { createCpuSurface, type CpuSurface } from "./CpuSurface";

function createMockCanvas(context: CanvasRenderingContext2D): HTMLCanvasElement {
  return {
    width: 0,
    height: 0,
    clientWidth: 640,
    clientHeight: 480,
    getContext: () => context,
    addEventListener: () => {},
    removeEventListener: () => {},
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 640, height: 480 }),
  } as unknown as HTMLCanvasElement;
}

describe("CpuSurface.applyCamera", () => {
  let setTransformMock: ReturnType<typeof vi.fn>;
  let surface: CpuSurface;

  beforeEach(() => {
    setTransformMock = vi.fn();
    const context = { setTransform: setTransformMock } as unknown as CanvasRenderingContext2D;

    // `CpuSurface`'s input store binds global window events on attach — stub the global so the
    // constructor works under Node.
    vi.stubGlobal("window", { addEventListener: () => {}, removeEventListener: () => {} });

    surface = createCpuSurface({
      canvas: createMockCanvas(context),
      camera: createCamera(10, 20, createZoomFactor(2)),
      dpr: createDevicePixelRatio(2),
    });
    // Bypass the frame loop: stamp a non-zero CSS size so the guard in `applyCamera` passes.
    surface.width = 640;
    surface.height = 480;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("scales the camera translation by dpr (hidpi offset fix)", () => {
    surface.applyCamera();

    // setTransform(zoom * dpr, 0, 0, zoom * dpr, x * dpr, y * dpr)
    expect(setTransformMock).toHaveBeenLastCalledWith(4, 0, 0, 4, 20, 40);
  });

  it("composes the whole world→device transform in one setTransform (no intermediate scale)", () => {
    surface.applyCamera();

    // Pre-fix, `setTransform(1,0,0,1,0,0)` was followed by separate transform() + scale() calls,
    // leaving the camera translation unscaled by dpr. The fix is a single composed matrix.
    expect(setTransformMock).toHaveBeenCalledTimes(1);
    expect(setTransformMock).toHaveBeenCalledWith(4, 0, 0, 4, 20, 40);
  });
});
