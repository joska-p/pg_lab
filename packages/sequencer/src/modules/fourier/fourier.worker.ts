import type { Epicycle } from './types';

self.onmessage = (event: MessageEvent<Float32Array>) => {
    const sequence = event.data;
    const N = sequence.length / 2;
    const epicycles: Epicycle[] = [];

    for (let k = 0; k < N; k++) {
        let re = 0;
        let im = 0;

        for (let n = 0; n < N; n++) {
            const x = sequence[2 * n];
            const y = sequence[2 * n + 1];

            const phi = (Math.PI * 2 * k * n) / N;

            re += x * Math.cos(phi) + y * Math.sin(phi);
            im += -x * Math.sin(phi) + y * Math.cos(phi);
        }

        re = re / N;
        im = im / N;

        epicycles.push({
            frequency: k,
            amplitude: Math.sqrt(re * re + im * im),
            phase: Math.atan2(im, re),
        });
    }

    // Sort descending by amplitude.
    // This builds the drawing arm from the largest "shoulder" joints
    // down to the smallest, fastest-spinning "fingers".
    epicycles.sort((a, b) => b.amplitude - a.amplitude);

    self.postMessage({ ok: true, value: epicycles });
};
