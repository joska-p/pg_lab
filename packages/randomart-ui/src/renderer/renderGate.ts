export interface RenderKey {
    readonly phase: number;
    readonly width: number;
    readonly height: number;
    readonly dpr: number;
    readonly animated: boolean;
}

export function createPhase(progress: number): number {
    if (!Number.isFinite(progress)) {
        return 0;
    }
    const wrapped = ((progress % 1) + 1) % 1;
    return wrapped >= 1 ? 0 : wrapped;
}

export function needsRender(previous: RenderKey | null, next: RenderKey): boolean {
    if (previous === null) {
        return true;
    }

    if (
        previous.width !== next.width ||
        previous.height !== next.height ||
        previous.dpr !== next.dpr
    ) {
        return true;
    }

    return next.animated && previous.phase !== next.phase;
}
