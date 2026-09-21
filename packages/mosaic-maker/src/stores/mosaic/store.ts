import { create } from 'zustand';

import { initialPalette, initialTileSet } from '../../core/constants';
import type { TileNames, Palette, TileSet } from '../../core/constants';

export interface TileInstance {
    id: string;
    name: TileNames;
    colors: [string, string, string, string, string];
    rotation: string;
}

export interface MosaicState {
    mosaicRef: React.RefObject<HTMLDivElement | null>;
    paletteStock: Palette[];
    currentPalettesIndex: number;
    currentPalette: Palette;
    currentPalettes: Palette[];
    tileSet: TileSet;
    tiles: TileInstance[];
    isPalettesLoading: boolean;
}

const mosaicStore = create<MosaicState>(() => ({
    mosaicRef: { current: null },
    paletteStock: [initialPalette],
    currentPalettesIndex: 0,
    currentPalette: initialPalette,
    currentPalettes: [initialPalette],
    tileSet: [...initialTileSet],
    tiles: [],
    isPalettesLoading: true,
}));

export { mosaicStore };
