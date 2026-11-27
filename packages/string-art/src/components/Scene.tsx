import type { CpuSurface } from '@repo/surface/cpu/CpuSurface';
import { CpuCanvas } from '@repo/surface/react/CpuCanvas';

import { computeFit, toPixelAligned } from '../core/fit';
import { blit, toBlittableImage } from '../core/render';
import { useOutput } from '../stores/store';

const BACKGROUND = '#000000';

export function Scene() {
    const output = useOutput();
    const blittableOutput = output ? toBlittableImage(output) : null;

    function handleOnFrame(surface: CpuSurface): void {
        if (!blittableOutput) {
            return;
        }

        // Lecture de l'état moteur DANS la frame → dimensions fraîches au resize
        const placement = toPixelAligned(computeFit(blittableOutput, surface));

        surface.clear(BACKGROUND);
        blit(surface, blittableOutput, placement);
    }

    return <CpuCanvas style={{ width: '100%', height: '100%' }} onFrame={handleOnFrame} />;
}
