import type { NextStepOptions, SequenceRule } from '../../engine/rules/types';
import { SeededRandom } from './SeededRandom';

function generateHarmonics(seed: string) {
    const rng = new SeededRandom(seed);
    const harmonics: { freqX: number; freqY: number; amp: number }[] = [];

    for (let i = 0; i < 4; i++) {
        harmonics.push({
            freqX: 1 + Math.floor(rng.next() * 12),
            freqY: 1 + Math.floor(rng.next() * 12),
            amp: 150 / (i + 1),
        });
    }

    return harmonics;
}

export const harmonicPathRule: SequenceRule = {
    name: 'Harmonic Hash Path',
    id: 'harmonic-path',
    description: 'Generates a multi-harmonic 2D coordinate sequence derived from a seed string.',
    maxSteps: 1000,

    getNext: (options: NextStepOptions): number => {
        const { index, seed = 'default-harmonic-seed' } = options;

        const pairIndex = Math.floor(index / 2);
        const isYCoordinate = index % 2 === 1;

        const harmonics = generateHarmonics(seed);

        const totalPairs = 500;
        const t = pairIndex / totalPairs;

        let value = 0;

        for (const layer of harmonics) {
            if (isYCoordinate) {
                value += Math.cos(t * Math.PI * 2 * layer.freqY) * layer.amp;
            } else {
                value += Math.sin(t * Math.PI * 2 * layer.freqX) * layer.amp;
            }
        }

        return value;
    },
};
