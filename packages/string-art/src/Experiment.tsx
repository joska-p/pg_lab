import { ControlPanel } from '@repo/ui/components/ControlPanel';
import { ExperimentLayout } from '@repo/ui/components/ExperimentLayout';

import { Controls } from './components/Controls';
import { Scene } from './components/Scene';

export function Experiment() {
    return (
        <ExperimentLayout
            stageLabel="string-art"
            panel={
                <ControlPanel title="String Art">
                    <Controls />
                </ControlPanel>
            }
        >
            <Scene />
        </ExperimentLayout>
    );
}
