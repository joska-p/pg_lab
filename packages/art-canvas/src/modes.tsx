import { lazy, type ComponentType } from 'react';

import type { InputMode } from './stores/ui/store';

export interface ArtCanvasMode {
    label: string;
    Canvas: ComponentType;
    Controls?: ComponentType;
}

export const EXPERIMENTS: Record<InputMode, ArtCanvasMode> = {
    spirale: {
        label: 'Spirale',
        Canvas: lazy(() =>
            import('./modules/spirale/Spirale').then((m) => ({ default: m.Spirale })),
        ),
        Controls: lazy(() =>
            import('./modules/spirale/SpiraleControls').then((m) => ({
                default: m.SpiraleControls,
            })),
        ),
    },
    seed: {
        label: 'Seed',
        Canvas: lazy(() =>
            import('./modules/seed/SeedCanvas').then((m) => ({ default: m.SeedCanvas })),
        ),
        Controls: lazy(() =>
            import('./modules/seed/SeedControls').then((m) => ({ default: m.SeedControls })),
        ),
    },
    'folded-space': {
        label: 'Folded space',
        Canvas: lazy(() =>
            import('./modules/folded-space/FoldedSpace').then((m) => ({
                default: m.FoldedSpace,
            })),
        ),
    },
    atlas: {
        label: 'Atlas',
        Canvas: lazy(() => import('./modules/atlas/Atlas').then((m) => ({ default: m.Atlas }))),
        Controls: lazy(() =>
            import('./modules/atlas/controls/AtlasControls').then((m) => ({
                default: m.AtlasControls,
            })),
        ),
    },
    manual: {
        label: 'Manual',
        Canvas: lazy(() => import('./modules/manual/Manual').then((m) => ({ default: m.Manual }))),
        Controls: lazy(() =>
            import('./modules/manual/ManualControls').then((m) => ({
                default: m.ManualControls,
            })),
        ),
    },
};
