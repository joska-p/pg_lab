import type { CpuSurface } from '@repo/glaze/cpu/types';

import type { Signal } from '../core/types';

export interface Viz {
    readonly id: string;
    readonly name: string;

    /** Called every frame — the viz pulls from the signal as it needs. */
    render(
        signal: Signal,
        surface: CpuSurface, // Surface | GpuRuntime – we keep it loose for now
    ): void;
}
