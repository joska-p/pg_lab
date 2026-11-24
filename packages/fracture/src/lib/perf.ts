// Fracture baseline instrumentation (dev-only shell).
// Shared mutable counters — written every frame, read by PerfHud at 2 Hz.
// Plain module state (not Zustand): high-frequency values with no need for
// per-frame reactivity; the HUD polls via setInterval.
// Mirrors packages/mol-demo/src/lib/perf.ts.

export interface PerfSnapshot {
    fps: number;
    loops: number;
    uniformsMs: number;
    orbitMs: number;
    orbitLength: number;
    maxIterations: number;
    zoom: number;
    canvasSize: string;
    experiment: string;
}

const state = {
    frames: 0,
    fpsWindowStart: 0,
    fpsWindowFrames: 0,
    fps: 0,
    loops: 0,
    uniformsMsEma: 0,
    orbitMsEma: 0,
    orbitLength: 0,
    maxIterations: 0,
    zoom: 0,
    canvasW: 0,
    canvasH: 0,
    experiment: '',
};

export function isPerfEnabled(): boolean {
    if (typeof window === 'undefined') {
        return false;
    }
    try {
        return true; // entry point to gate behind ?perf=1 like mol-demo if noisy
    } catch {
        return false;
    }
}

function ema(prev: number, next: number, alpha = 0.1): number {
    return prev <= 0 ? next : prev + alpha * (next - prev);
}

/** Call once per uniforms() evaluation (i.e. once per frame per GpuCanvas). */
export function recordFractalFrame(
    uniformsMs: number,
    w: number,
    h: number,
    opts?: { orbitMs?: number; orbitLength?: number; maxIterations?: number; zoom?: number },
): void {
    state.frames++;
    state.uniformsMsEma = ema(state.uniformsMsEma, uniformsMs);
    state.canvasW = w;
    state.canvasH = h;
    if (opts?.orbitMs !== undefined) {
        state.orbitMsEma = ema(state.orbitMsEma, opts.orbitMs);
    }
    if (opts?.orbitLength !== undefined) {
        state.orbitLength = opts.orbitLength;
    }
    if (opts?.maxIterations !== undefined) {
        state.maxIterations = opts.maxIterations;
    }
    if (opts?.zoom !== undefined) {
        state.zoom = opts.zoom;
    }
}

export function setPerfExperiment(id: string): void {
    state.experiment = id;
}

// RAF loop registry: catches double loops (StrictMode, re-subscribe churn when
// the inline `uniforms` callback identity changes). Each Canvas calls enter on
// mount, exit on unmount.
export function perfLoopEnter(): void {
    state.loops++;
}

export function perfLoopExit(): void {
    state.loops = Math.max(0, state.loops - 1);
}

export function perfSnapshot(): PerfSnapshot {
    const now = performance.now();
    if (state.fpsWindowStart <= 0) {
        state.fpsWindowStart = now;
        state.fpsWindowFrames = state.frames;
    } else {
        const dt = now - state.fpsWindowStart;
        if (dt >= 250) {
            // Windowed throughput: true frames/s over the window. Unlike an
            // instantaneous EMA, this cannot read 60 while blocked.
            state.fps = ((state.frames - state.fpsWindowFrames) / dt) * 1000;
            state.fpsWindowStart = now;
            state.fpsWindowFrames = state.frames;
        }
    }
    return {
        fps: state.fps,
        loops: state.loops,
        uniformsMs: state.uniformsMsEma,
        orbitMs: state.orbitMsEma,
        orbitLength: state.orbitLength,
        maxIterations: state.maxIterations,
        zoom: state.zoom,
        canvasSize: state.canvasW > 0 ? `${state.canvasW}x${state.canvasH}` : '-',
        experiment: state.experiment || '-',
    };
}
