import type { Label } from './core/types';

/** CSS custom properties mirror the StyleX palette used by the original experiment. */
export const labelToColorMap: Record<Label, string> = {
    car: 'var(--pg-brightRed)',
    fish: 'var(--pg-brightBlue)',
    house: 'var(--pg-brightBlue)',
    tree: 'var(--pg-brightGreen)',
    bicycle: 'var(--pg-brightYellow)',
    guitar: 'var(--pg-brightPurple)',
    pencil: 'var(--pg-brightAqua)',
    clock: 'var(--pg-brightOrange)',
};

export const CURRENT_DRAWING_COLOR = 'var(--pg-brightRed)';
