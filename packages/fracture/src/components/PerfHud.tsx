import { useEffect, useState } from 'react';

import { isPerfEnabled, perfSnapshot, type PerfSnapshot } from '../lib/perf';

// Dev-only baseline HUD (same recipe as mol-demo PerfHud). Polls the shared
// perf counters at 2 Hz — no per-frame React work, zero cost when disabled.
export function PerfHud() {
    const [snap, setSnap] = useState<PerfSnapshot | null>(null);

    useEffect(() => {
        if (!isPerfEnabled()) {
            return;
        }
        const id = window.setInterval(() => setSnap(perfSnapshot()), 500);
        return () => window.clearInterval(id);
    }, []);

    if (!isPerfEnabled() || snap === null) {
        return null;
    }

    return (
        <div
            style={{
                fontFamily: 'monospace',
                fontSize: 12,
                lineHeight: 1.5,
                background: 'rgba(0,0,0,0.75)',
                color: '#fff',
                padding: '8px 10px',
                borderRadius: 6,
                display: 'flex',
                flexWrap: 'wrap',
                whiteSpace: 'pre-wrap',
            }}
        >
            {`fps ${snap.fps.toFixed(0)} (loops ${snap.loops}) | uniforms ${snap.uniformsMs.toFixed(2)}ms | orbit ${snap.orbitMs.toFixed(2)}ms\niter ${snap.maxIterations} | orbitLen ${snap.orbitLength} | zoom ${snap.zoom.toExponential(1)}\ncanvas ${snap.canvasSize} | ${snap.experiment}`}
        </div>
    );
}
