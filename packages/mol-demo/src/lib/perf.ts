// P0 baseline instrumentation (dev-only, mol-demo shell).
// Shared mutable counters — written every frame, read by PerfHud at 2 Hz.
// Plain module state (not Zustand): high-frequency values with no need for
// per-frame reactivity; the HUD polls via setInterval.

export interface PerfSnapshot {
    fps: number;
    loops: number;
    renderMs: number;
    patternMs: number;
    patternSpans: string;
    patternPath: string;
    patternStale: boolean;
    meshes: number;
    molBuffer: string;
    patBuffer: string;
    molecule: string;
}

const PATTERN_STALE_MS = 750;

const state = {
    molFrames: 0,
    fpsWindowStart: 0,
    fpsWindowFrames: 0,
    fps: 0,
    loops: 0,
    renderMsEma: 0,
    patternMsEma: 0,
    patternProjectEma: 0,
    patternNormEma: 0,
    patternGlEma: 0,
    patternPath: '',
    lastPatternTs: 0,
    meshes: 0,
    molW: 0,
    molH: 0,
    patSize: 0,
    molecule: '',
};

export function isPerfEnabled(): boolean {
    if (typeof window === 'undefined') return false;
    try {
        return (
            import.meta.env.DEV === true && new URLSearchParams(window.location.search).has('perf')
        );
    } catch {
        return false;
    }
}

// P2 discriminating test: `?norotate=1` (dev only) stops autoRotate so the
// pattern early-out should freeze redraws — if fps recovers to ~60, the
// pattern-on-main-thread diagnosis is confirmed.
export function isRotateDisabled(): boolean {
    if (typeof window === 'undefined') return false;
    try {
        return (
            import.meta.env.DEV === true &&
            new URLSearchParams(window.location.search).has('norotate')
        );
    } catch {
        return false;
    }
}

function ema(prev: number, next: number, alpha = 0.1): number {
    return prev <= 0 ? next : prev + alpha * (next - prev);
}

export function recordMolFrame(renderMs: number, meshes: number, w: number, h: number): void {
    state.molFrames++;
    state.renderMsEma = ema(state.renderMsEma, renderMs);
    state.meshes = meshes;
    state.molW = w;
    state.molH = h;
}

// RAF loop registry: catches double loops (StrictMode, bfcache) — each
// owner calls enter on start, exit on dispose. More than 1 in steady
// state is a lifecycle bug.
export function perfLoopEnter(): void {
    state.loops++;
}

export function perfLoopExit(): void {
    state.loops = Math.max(0, state.loops - 1);
}

export function recordPatternFrame(
    patternMs: number,
    size: number,
    molecule: string,
    projectMs = 0,
    normMs = 0,
    glMs = 0,
): void {
    state.patternMsEma = ema(state.patternMsEma, patternMs);
    state.patternProjectEma = ema(state.patternProjectEma, projectMs);
    state.patternNormEma = ema(state.patternNormEma, normMs);
    state.patternGlEma = ema(state.patternGlEma, glMs);
    state.patSize = size;
    state.molecule = molecule;
    state.lastPatternTs = performance.now();
}

// Which pattern backend produced the numbers above ("gpu" | "cpu").
// Set once at PatternCanvas init so the HUD can blame the right path.
export function setPatternPath(path: string): void {
    state.patternPath = path;
}

export function perfSnapshot(): PerfSnapshot {
    const now = performance.now();
    if (state.fpsWindowStart <= 0) {
        state.fpsWindowStart = now;
        state.fpsWindowFrames = state.molFrames;
    } else {
        const dt = now - state.fpsWindowStart;
        if (dt >= 250) {
            // Windowed throughput: true frames/s over the window. Unlike the
            // old instantaneous EMA, this cannot read 60 while blocked.
            state.fps = ((state.molFrames - state.fpsWindowFrames) / dt) * 1000;
            state.fpsWindowStart = now;
            state.fpsWindowFrames = state.molFrames;
        }
    }
    return {
        fps: state.fps,
        loops: state.loops,
        renderMs: state.renderMsEma,
        patternMs: state.patternMsEma,
        patternSpans: `${state.patternProjectEma.toFixed(2)}/${state.patternNormEma.toFixed(2)}/${state.patternGlEma.toFixed(2)}`,
        patternPath: state.patternPath || '?',
        patternStale: state.lastPatternTs <= 0 || now - state.lastPatternTs > PATTERN_STALE_MS,
        meshes: state.meshes,
        molBuffer: state.molW > 0 ? `${state.molW}x${state.molH}` : '-',
        patBuffer: state.patSize > 0 ? `${state.patSize}x${state.patSize}` : '-',
        molecule: state.molecule || '-',
    };
}
