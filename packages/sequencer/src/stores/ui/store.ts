import { create } from 'zustand';

import type { LayerConfigEntry } from '../../core/types';
import type { UiState } from './types';

const DEFAULT_LAYERS: LayerConfigEntry[] = [
    { id: 'baseline', enabled: true, params: {} },
    { id: 'plotted-numbers', enabled: true, params: {} },
    { id: 'recaman-arcs', enabled: true, params: {} },
];

const uiStore = create<UiState>(() => {
    return {
        layers: DEFAULT_LAYERS.map((l) => ({ ...l, params: { ...l.params } })),
        viewport: {
            enabled: false,
            zoom: 1,
            panX: 0,
            panY: 0,
        },
    };
});

export { uiStore };
