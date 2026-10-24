import type { VisualLayer } from '../../core/types';
import { fetchFourierEpicycles } from './store';

export const drawFourierEpicycles: VisualLayer = {
    id: 'fourier-epicycles',
    name: 'Fourier Epicycles',
    description:
        'Traces high-frequency geometric vector loops utilizing Discrete Fourier Transforms.',
    category: 'drawing',
    params: {
        precision: {
            label: 'Circle Limit',
            type: 'number',
            min: 1,
            max: 200,
            step: 1,
            default: 40,
        },
        orbitOverlays: {
            label: 'Show Orbits',
            type: 'boolean',
            default: true,
        },
    },
    draw: (ctx, data, params, layout) => {
        const { precision = 40, orbitOverlays = true } = params as Record<string, number | boolean>;

        const pairs = new Float32Array(data.length * 2);

        for (let i = 0; i < data.length; i++) {
            pairs[2 * i] = i;
            pairs[2 * i + 1] = data[i] ?? 0;
        }

        const epicycles = fetchFourierEpicycles(pairs, () => {
            ctx.canvas.dispatchEvent(new CustomEvent('sequence-renderer:request-draw'));
        });

        if (!epicycles || epicycles.length === 0) {
            return;
        }

        ctx.save();
        ctx.translate(layout.offsetX, layout.offsetY);

        const activeLimit = Math.min(epicycles.length, precision as number);

        // --- 1. DRAW THE FULL PATH INTENTIOANLLY IN ONE FRAME ---
        // We sample over the full period (0 to 1) to draw the complete shape
        const numSamples = Math.max(data.length, 500);

        ctx.beginPath();

        for (let step = 0; step <= numSamples; step++) {
            const progress = step / numSamples; // normalized time [0, 1]
            let x = 0;
            let y = 0;

            for (let i = 0; i < activeLimit; i++) {
                const epi = epicycles[i];
                const radius = epi.amplitude * layout.valueScale;

                // Evaluate the Fourier series at this specific progress point
                x += radius * Math.cos(2 * Math.PI * epi.frequency * progress + epi.phase);
                y += radius * Math.sin(2 * Math.PI * epi.frequency * progress + epi.phase);
            }

            if (step === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }

        ctx.strokeStyle = getComputedStyle(ctx.canvas).color || '#00ffcc';
        ctx.lineWidth = 2;
        ctx.stroke();

        // --- 2. DRAW THE ORBITS OVERLAY (OPTIONAL ANIMATION ELEMENT) ---
        // If you still want a single moving pointer/orbit overlay, do it here for a single "live" point
        if (orbitOverlays) {
            const liveProgress = (performance.now() / 5000) % 1.0; // Loops smoothly from 0 to 1
            let x = 0;
            let y = 0;

            for (let i = 0; i < activeLimit; i++) {
                const epi = epicycles[i];

                const prevX = x;
                const prevY = y;
                const radius = epi.amplitude * layout.valueScale;

                x += radius * Math.cos(2 * Math.PI * epi.frequency * liveProgress + epi.phase);
                y += radius * Math.sin(2 * Math.PI * epi.frequency * liveProgress + epi.phase);

                if (epi.frequency > 0) {
                    ctx.beginPath();
                    ctx.arc(prevX, prevY, radius, 0, Math.PI * 2);
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
                    ctx.stroke();

                    ctx.beginPath();
                    ctx.moveTo(prevX, prevY);
                    ctx.lineTo(x, y);
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
                    ctx.stroke();
                }
            }

            // Draw the tip/pointer
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
        }

        ctx.restore();

        // REMOVED: requestAnimationFrame event dispatch loop that causes overheating.
    },
};
