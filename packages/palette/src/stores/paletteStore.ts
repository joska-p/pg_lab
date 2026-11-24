import Color from 'colorjs.io';
import { create } from 'zustand';

import type { Palette } from '../core/types';

interface PaletteState {
    palettes: Palette[];
    baseColor: Color;
}

const INITIAL_BASE_COLOR = new Color('oklch', [0.7, 0.1, 196]);

const paletteStore = create<PaletteState>(() => ({
    palettes: [],
    baseColor: INITIAL_BASE_COLOR,
}));

export function usePalettePalettes(): Palette[] {
    return paletteStore((state) => state.palettes);
}

export function usePaletteBaseColor(): Color {
    return paletteStore((state) => state.baseColor);
}

export function setPaletteBaseColor(baseColor: Color): void {
    paletteStore.setState({ baseColor });
}

export function addPalette(palette: Palette): void {
    const { palettes } = paletteStore.getState();

    paletteStore.setState({ palettes: [...palettes, palette] });
}
