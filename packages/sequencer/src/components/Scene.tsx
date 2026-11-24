import { useRef } from 'react';

import { useCanvasInteraction } from '../hooks/useCanvasInteraction';
import { useCanvasRenderer } from '../hooks/useCanvasRenderer';
import { useSequenceSequence } from '../stores/sequence/selectors';
import { useLayersConfig, useViewport } from '../stores/ui/selectors';

export function Scene() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const sequence = useSequenceSequence();
    const layers = useLayersConfig();
    const viewport = useViewport();

    useCanvasRenderer(canvasRef, sequence, layers, viewport);
    useCanvasInteraction(canvasRef);

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: 0 }}>
            <canvas
                ref={canvasRef}
                style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    cursor: 'grab',
                }}
            />
        </div>
    );
}
