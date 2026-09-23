import { ControlPanel } from '@repo/ui/components/ControlPanel';
import { ControlSection } from '@repo/ui/components/ControlSection';
import { ErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { ExperimentShell } from '@repo/ui/components/ExperimentShell';
import { Select } from '@repo/ui/components/Select';
import { ShellWrapper } from '@repo/ui/components/ShellWrapper';
import { Stage } from '@repo/ui/components/Stage';
import { Suspense, use, useEffect } from 'react';

import { EXPERIMENTS, loadControls, loadScene } from './experiments';
import type { ExperimentKey } from './experiments';
import { useHashRoute } from './hooks/useHashRoute';
import { useExperimentKey } from './stores/appStore';
import { setExperimentKey } from './stores/appStore';

function LoadingFallback() {
    return (
        <ShellWrapper>
            <Stage label="loading">
                <p>Loading…</p>
            </Stage>
        </ShellWrapper>
    );
}

const OPTIONS = Object.entries(EXPERIMENTS).map(([value, { label }]) => ({
    value: value as ExperimentKey,
    label,
}));

export function App() {
    const experimentKey = useExperimentKey();
    const sceneModule = use(loadScene(experimentKey));
    const controlsModule = use(loadControls(experimentKey));
    const { Scene, stageProps } = sceneModule;
    const { Controls } = controlsModule;

    useHashRoute();

    useEffect(() => {
        document.title = `${EXPERIMENTS[experimentKey].label} · PG_LAB`;
    }, [experimentKey]);

    return (
        <Suspense fallback={<LoadingFallback />}>
            <ErrorBoundary showStack={import.meta.env.DEV}>
                <ShellWrapper>
                    <ExperimentShell
                        panel={
                            <ControlPanel title={EXPERIMENTS[experimentKey].panelTitle}>
                                <ControlSection title="Navigation">
                                    <Select
                                        value={experimentKey}
                                        onValueChange={setExperimentKey}
                                        options={OPTIONS}
                                    />
                                </ControlSection>
                                <Controls />
                            </ControlPanel>
                        }
                    >
                        <Stage label={EXPERIMENTS[experimentKey].stageLabel} {...stageProps}>
                            <Scene />
                        </Stage>
                    </ExperimentShell>
                </ShellWrapper>
            </ErrorBoundary>
        </Suspense>
    );
}
