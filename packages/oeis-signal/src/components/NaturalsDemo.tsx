import { createPositiveNumber, createCssColor } from '@repo/glaze/core/render';
import type { DrawStyle } from '@repo/glaze/core/shapes';
import { circleFrom } from '@repo/glaze/core/shapes';
import type { CpuSurface } from '@repo/glaze/cpu/CpuSurface';
import { CpuCanvas } from '@repo/glaze/react/CpuCanvas';

import { getModule } from '../core/registry';

export function NaturalsDemo() {
    const module = getModule('naturals');
    const signal = module.createSignal({ maxTerms: 1000 });

    return (
        <CpuCanvas
            style={{ width: '100%', height: '100%', background: 'black' }}
            onFrame={(surface: CpuSurface) => {
                const next = signal.next();

                if (next.done) {
                    return;
                }

                const x = next.value;
                const y = x;

                const circle = circleFrom({ x, y }, createPositiveNumber(5));
                const style = { stroke: createCssColor('red') } as DrawStyle;

                surface.circle(circle, style);
            }}
        />
    );
}
