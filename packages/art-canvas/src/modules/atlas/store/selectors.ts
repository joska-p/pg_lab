import { atlasStore } from './store';

export function useSeed() {
    return atlasStore((state) => state.seed);
}

export function useComplexity() {
    return atlasStore((state) => state.complexity);
}

export function useModulo() {
    return atlasStore((state) => state.modulo);
}

export function usePalette() {
    return atlasStore((state) => state.palette);
}

export function useGlitch() {
    return atlasStore((state) => state.glitch);
}

export function useSymbolType() {
    return atlasStore((state) => state.symbolType);
}
