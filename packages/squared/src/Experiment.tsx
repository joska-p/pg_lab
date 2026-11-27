import { ControlPanel } from '@repo/ui/components/ControlPanel';
import { ExperimentLayout } from '@repo/ui/components/ExperimentLayout';

import { Controls } from './components/Controls';
import { Scene } from './components/Scene';

export function Experiment() {
    return (
        <ExperimentLayout
            stageLabel="smith-tutte"
            panel={
                <ControlPanel title="Squared">
                    <Controls />
                </ControlPanel>
            }
        >
            <Scene />
        </ExperimentLayout>
    );
}
