import { uiStore } from './store';

export function useLayersConfig() {
    return uiStore((s) => s.layers);
}

export function useViewport() {
    return uiStore((s) => s.viewport);
}
