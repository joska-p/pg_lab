import { ControlPanel } from '@repo/ui/components/ControlPanel';
import { ExperimentLayout } from '@repo/ui/components/ExperimentLayout';

import { Controls } from './components/controls/Controls';
import { Scene } from './components/Scene';

export function Experiment() {
    return (
        <ExperimentLayout
            stageLabel="automa"
            panel={
                <ControlPanel title="Automa Controls">
                    <Controls />
                </ControlPanel>
            }
        >
            <Scene />
        </ExperimentLayout>
    );
}
