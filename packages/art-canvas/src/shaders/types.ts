import type { SeededRandom } from '../assembly/seeded-random';
import type { PalettePreset } from '../palettes/registry';

export type ParamDefinition =
    | { type: 'global'; value: string } // e.g. 'u_time', 'u_mouse'
    | { type: 'range'; min: number; max: number; precision?: number } // e.g. rng scale between 2.0 and 7.0
    | { type: 'literal'; value: string | number }; // Fixed values

export interface ShaderModule {
    name: string;
    category: 'space' | 'shapes' | 'effects';
    code: string;
    weight?: number;
    params?: Record<string, ParamDefinition>;
    getCall: (args: Record<string, string>) => string;
    deps?: string[];
}

export interface ShaderTemplate {
    name: string;
    weight: number;
    deps?: string[];
    generate: (args: {
        complexity: number;
        rng: SeededRandom;
        spaceBlock: string;
        shapeBlock: string;
        effectBlock: string;
        palette: PalettePreset;
        uniqueInjectedCode: string;
    }) => string;
}
