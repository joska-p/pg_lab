import type { TileSet, Palette } from '../../core/constants';
import { mosaicStore, type TileInstance } from './store';

export function useCurrentPalette(): Palette {
    return mosaicStore((s) => s.currentPalette);
}

export function useCurrentPalettes(): Palette[] {
    return mosaicStore((s) => s.currentPalettes);
}

export function useIsPalettesLoading(): boolean {
    return mosaicStore((s) => s.isPalettesLoading);
}

export function useMosaicRef(): React.RefObject<HTMLDivElement | null> {
    return mosaicStore((s) => s.mosaicRef);
}

export function useTiles(): TileInstance[] {
    return mosaicStore((s) => s.tiles);
}

export function useTileSet(): TileSet {
    return mosaicStore((s) => s.tileSet);
}
