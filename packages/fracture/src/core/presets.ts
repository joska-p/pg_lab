/** Curated Mandelbrot deep-zoom spots shared by the three pipelines (zoom clamped per tier). */
export interface CameraPreset {
    id: string;
    label: string;
    centerRe: number;
    centerIm: number;
    zoom: number;
}

export const CURATED_PRESETS: CameraPreset[] = [
    {
        id: 'seahorse-valley',
        label: 'Seahorse Valley',
        centerRe: -0.743643887037,
        centerIm: 0.131825904212,
        zoom: 3000,
    },
    {
        id: 'elephant-ridge',
        label: 'Elephant Ridge',
        centerRe: 0.286931868895,
        centerIm: 0.014285693792,
        zoom: 20000,
    },
    {
        id: 'spiral-bay',
        label: 'Spiral Bay',
        centerRe: -0.761574,
        centerIm: -0.0847596,
        zoom: 30000,
    },
    {
        id: 'abyss',
        label: 'Abyss',
        centerRe: -0.743643887037,
        centerIm: 0.131825904212,
        zoom: 1e9,
    },
];
