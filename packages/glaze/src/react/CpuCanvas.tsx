import { useEffect, useRef } from "react";
import { createInteractionAdapter } from "./interactions";
import { createCpuStack } from "./surfaceStack";
import { useNodeResource } from "./useNodeResource";
import type { CpuCanvasProps } from "./types";
import type { CpuSurface } from "../cpu/types";

export function CpuCanvas({
  onFrame,
  onMount,
  canvasInteractions,
  className,
  style,
  ...surfaceOptions
}: CpuCanvasProps) {
  const gestures = createInteractionAdapter(canvasInteractions);
  const gesturesRef = useRef(gestures);

  const { ref: canvasRef, resource: stack } = useNodeResource((canvas: HTMLCanvasElement) =>
    createCpuStack(canvas, surfaceOptions, () => gesturesRef.current),
  );

  // ── Mount Effect ──
  const mountedSurfaceRef = useRef<CpuSurface | null>(null);

  useEffect(() => {
    if (!stack || mountedSurfaceRef.current === stack.surface) return;

    mountedSurfaceRef.current = stack.surface;
    onMount?.(stack.surface);
  }, [onMount, stack]);

  // ── Frame Loop Effect ──
  useEffect(() => {
    if (!stack || !onFrame) return;

    return stack.surface.onFrame(onFrame);
  }, [onFrame, stack]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        width: "100%",
        height: "100%",
        display: "block",
        touchAction: "none",
        ...style,
      }}
    />
  );
}
