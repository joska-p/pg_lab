import { ControlPanel } from '@repo/ui/components/ControlPanel';
import { ExperimentShell } from '@repo/ui/components/ExperimentShell';
import { Activity, use } from 'react';

import { loadControls, loadScene } from '../experiments';
import type { ExperimentDefinition } from '../experiments';

interface ExperimentContentProps {
    readonly currentExperiment: ExperimentDefinition;
    readonly panelCollapsed: boolean;
    readonly onCollapsedChange: (collapsed: boolean) => void;
}

export function ExperimentContent({
    currentExperiment,
    panelCollapsed,
    onCollapsedChange,
}: ExperimentContentProps) {
    const sceneModule = use(loadScene(currentExperiment));
    const controlsModule = use(loadControls(currentExperiment));

    const { Scene, stageProps } = sceneModule;
    const Controls = controlsModule?.Controls;
    const panel = Controls ? (
        <Activity>
            <ControlPanel title={currentExperiment.panelTitle}>
                <Controls />
            </ControlPanel>
        </Activity>
    ) : undefined;

    return (
        <ExperimentShell
            stageLabel={currentExperiment.stageLabel}
            stageProps={stageProps}
            collapsed={panelCollapsed}
            onCollapsedChange={onCollapsedChange}
            panel={panel}
        >
            <Activity>
                <Scene />
            </Activity>
        </ExperimentShell>
    );
}
