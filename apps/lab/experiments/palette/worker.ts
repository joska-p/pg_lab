/*
 * Palette worker: the pure color core runs off the main thread.
 * The app tsconfig uses DOM types, so the worker scope is described locally
 * instead of pulling in the WebWorker lib (which would duplicate DOM declarations).
 */

import Color from 'colorjs.io';

import { generatePalette } from './core/generatePalette';
import { getRule } from './core/rules/registry';
import type { GeneratePaletteResponse, GeneratePaletteTask } from './types';

interface WorkerScope {
    onmessage: ((event: MessageEvent<GeneratePaletteTask>) => void) | null;
    postMessage: (message: GeneratePaletteResponse) => void;
}

declare const self: WorkerScope;

function colorToCss(color: Color): string {
    return color.to('lch').toString({ precision: 3 });
}

self.onmessage = (event) => {
    try {
        const { l, c, h, ruleId } = event.data;
        const baseColor = new Color('oklch', [l, c, h]);
        const palette = generatePalette(baseColor, getRule(ruleId));
        const response: GeneratePaletteResponse = {
            ok: true,
            colors: palette.colors.map(colorToCss),
        };

        self.postMessage(response);
    } catch (error) {
        const response: GeneratePaletteResponse = {
            ok: false,
            error: error instanceof Error ? error.message : 'Unknown worker error',
        };

        self.postMessage(response);
    }
};
