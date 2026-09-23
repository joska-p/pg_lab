import { lazy, type ComponentType } from 'react';

export interface Experiment {
    readonly label: string;
    readonly Scene: ComponentType;
    readonly Controls: ComponentType;
}

export const EXPERIMENTS = {
    spirale: {
        label: 'Spirale',
        Scene: lazy(() =>
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
        Scene: lazy(() =>
            import('./modules/seed/SeedCanvas').then((m) => ({ default: m.SeedCanvas })),
        ),
        Controls: lazy(() =>
            import('./modules/seed/SeedControls').then((m) => ({ default: m.SeedControls })),
        ),
    },
    'folded-space': {
        label: 'Folded space',
        Scene: lazy(() =>
            import('./modules/folded-space/FoldedSpace').then((m) => ({
                default: m.FoldedSpace,
            })),
        ),
        Controls: () => null,
    },
    atlas: {
        label: 'Atlas',
        Scene: lazy(() => import('./modules/atlas/Atlas').then((m) => ({ default: m.Atlas }))),
        Controls: lazy(() =>
            import('./modules/atlas/AtlasControls').then((m) => ({
                default: m.AtlasControls,
            })),
        ),
    },
    manual: {
        label: 'Manual',
        Scene: lazy(() => import('./modules/manual/Manual').then((m) => ({ default: m.Manual }))),
        Controls: lazy(() =>
            import('./modules/manual/ManualControls').then((m) => ({
                default: m.ManualControls,
            })),
        ),
    },
} as const satisfies Record<string, Experiment>;

export type ExperimentKey = keyof typeof EXPERIMENTS;
export const experimentKeys = Object.keys(EXPERIMENTS) as ExperimentKey[];
