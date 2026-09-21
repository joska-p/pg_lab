import { createCssColor, type CssColor } from '@repo/glaze/core/render';

export const SPEED_MIN_MS = 50;
export const SPEED_MAX_MS = 1000;
export const SPEED_STEP_MS = 10;
export const SPEED_DEFAULT_MS = 100;

export const AGE_GROWTH_RATE = 0.02;
export const AGE_DECAY_RATE = 0.015;
export const TRAIL_COLOR: [number, number, number] = [0.0, 0.5, 0.8];
export const TRAIL_STRENGTH = 0.6;

export const MAX_STATE_COUNT = 8;

export const DEFAULT_STATE_COLORS: CssColor[] = [
    createCssColor('#070a14'),
    createCssColor('#d97706'),
];
