import type { DurationSeconds } from '@repo/glaze/core/time';
import type { ShaderError } from '@repo/glaze/gpu/shader/ShaderError';
import type { GpuSurface } from '@repo/glaze/gpu/types';
import { GpuCanvas } from '@repo/glaze/react/GpuCanvas';

interface VmCanvasProps {
    fragmentShader: string;
    animated?: boolean;
    duration?: DurationSeconds;
    onShaderError?: (error: ShaderError | null) => void;
    onMount?: (surface: GpuSurface) => void;
}

export function VmCanvas({
    fragmentShader,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    animated: _animated = true,
    duration = 4 as DurationSeconds,
    onShaderError,
    onMount,
}: VmCanvasProps) {
    return (
        <GpuCanvas
            fragmentShader={fragmentShader}
            clockOptions={{
                mode: 'timed',
                duration,
                loop: true,
                autoStart: true,
            }}
            uniforms={(surface) => ({
                u_phase: surface.clock.progress,
            })}
            onShaderError={onShaderError}
            onMount={onMount}
            canvasInteractions={{ pan: false, zoom: false }}
            style={{ width: '100%', height: '100%', display: 'block' }}
        />
    );
}
