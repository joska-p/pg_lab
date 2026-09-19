import { useEffect, useRef } from "react";
import { createInteractionAdapter } from "./interactions";
import { createGpuStack } from "./surfaceStack";
import { useNodeResource } from "./useNodeResource";
import type { GpuCanvasProps } from "./types";
import type { Program } from "../gpu/shader/Program";
import type { GpuSurface } from "../gpu/types";

export function GpuCanvas({
  fragmentShader,
  uniforms,
  onFrame,
  onMount,
  onClockStore,
  canvasInteractions,
  className,
  style,
  ...surfaceOptions
}: GpuCanvasProps) {
  const gestures = createInteractionAdapter(canvasInteractions);
  const gesturesRef = useRef(gestures);

  const { ref: canvasRef, resource: stack } = useNodeResource((canvas: HTMLCanvasElement) =>
    createGpuStack(canvas, surfaceOptions, () => gesturesRef.current),
  );
  const programRef = useRef<Program | null>(null);

  // ── Shader Compilation Effect ──
  useEffect(() => {
    if (!stack || !fragmentShader) return;

    const program = stack.surface.createProgram(fragmentShader);

    programRef.current = program;

    return () => {
      program.destroy();
      programRef.current = null;
    };
  }, [fragmentShader, stack]);

  // ── Mount Effect ──
  const mountedSurfaceRef = useRef<GpuSurface | null>(null);

  useEffect(() => {
    if (!stack || mountedSurfaceRef.current === stack.surface) return;

    mountedSurfaceRef.current = stack.surface;
    onMount?.(stack.surface);
    onClockStore?.(stack.clockStore);
  }, [onClockStore, onMount, stack]);

  // ── Frame Loop Effect ──
  useEffect(() => {
    if (!stack) return;

    if (onFrame === undefined && fragmentShader === undefined) return;

    return stack.surface.onFrame((frame) => {
      const program = programRef.current;

      if (program) {
        program.setUniforms(uniforms ? uniforms(frame) : {});
        frame.renderProgram(program);
      }

      onFrame?.(frame);
    });
  }, [onFrame, uniforms, fragmentShader, stack]);

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
