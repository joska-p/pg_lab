import type { CpuSurface } from '@repo/surface/cpu/CpuSurface';
import { CpuCanvas } from '@repo/surface/react/CpuCanvas';
import { useMemo } from 'react';

import { getModule } from '../core/registry';

export function NaturalsDemo() {
    const module = getModule('naturals');
    // Stable signal across React renders: not recreated on re-render (e.g. theme changes)
    const signal = useMemo(() => module.createSignal({ maxTerms: 1000 }), [module]);

    return (
        <CpuCanvas
            style={{ width: '100%', height: '100%', background: 'black' }}
            // Explicit render policy: accumulation (no clear per frame)
            onFrame={(surface: CpuSurface) => {
                const next = signal.next();

                if (next.done) {
                    return;
                }

                const x = next.value;
                const y = x;

                const { ctx } = surface;
                ctx.save();
                ctx.strokeStyle = 'red';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(x, y, 5, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
            }}
        />
    );
}
