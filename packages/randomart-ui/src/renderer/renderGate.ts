export interface RenderKey {
    readonly phase: number;
    readonly width: number;
    readonly height: number;
    readonly dpr: number;
    readonly animated: boolean;
    readonly postProcess?: string;
}

export function createPhase(progress: number): number {
    if (!Number.isFinite(progress)) {
        return 0;
    }
    return ((progress % 1) + 1) % 1;
}

export function needsRender(previous: RenderKey | null, next: RenderKey): boolean {
    if (previous === null) {
        return true;
    }

    if (
        previous.width !== next.width ||
        previous.height !== next.height ||
        previous.dpr !== next.dpr ||
        previous.postProcess !== next.postProcess
    ) {
        return true;
    }

    return next.animated && previous.phase !== next.phase;
}
