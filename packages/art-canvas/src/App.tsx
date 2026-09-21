import { ControlPanel } from '@repo/ui/components/ControlPanel';
import { ControlSection } from '@repo/ui/components/ControlSection';
import { ErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { ExperimentShell } from '@repo/ui/components/ExperimentShell';
import { Select } from '@repo/ui/components/Select';
import { ShellWrapper } from '@repo/ui/components/ShellWrapper';
import { Stage } from '@repo/ui/components/Stage';
import { lazy, Suspense, type ComponentType } from 'react';

import { setInputMode, useInputMode } from './stores/ui/store';
import type { InputMode } from './stores/ui/store';

const EXPERIMENTS: Record<
    InputMode,
    {
        label: string;
        Canvas: ComponentType;
        Controls?: ComponentType;
    }
> = {
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

const MODE_OPTIONS = Object.entries(EXPERIMENTS).map(([value, { label }]) => ({
    value: value as InputMode,
    label,
}));

export function App() {
    const mode = useInputMode();
    const { Canvas, Controls, label } = EXPERIMENTS[mode];

    return (
        <ShellWrapper>
            <ErrorBoundary showStack={import.meta.env.DEV}>
                <ExperimentShell
                    panel={
                        <ControlPanel title="art-canvas">
                            <Select<InputMode>
                                label="Mode"
                                value={mode}
                                onValueChange={setInputMode}
                                options={MODE_OPTIONS}
                            />
                            {Controls && (
                                <ControlSection title={label}>
                                    <Suspense fallback={null}>
                                        <Controls />
                                    </Suspense>
                                </ControlSection>
                            )}
                        </ControlPanel>
                    }
                >
                    <Stage label="art-canvas">
                        <Suspense fallback={null}>
                            <Canvas />
                        </Suspense>
                    </Stage>
                </ExperimentShell>
            </ErrorBoundary>
        </ShellWrapper>
    );
}
