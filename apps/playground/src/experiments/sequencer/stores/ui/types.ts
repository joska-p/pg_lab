import type { CanvasViewport, LayerConfigEntry } from '../../core/types';

interface UiState {
    layers: LayerConfigEntry[];
    viewport: CanvasViewport;
}

export type { UiState };
