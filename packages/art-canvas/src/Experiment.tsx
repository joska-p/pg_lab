import { ExperimentLayout } from '@repo/ui/components/ExperimentLayout';

import { Controls } from './components/Controls';
import { Scene } from './components/Scene';
import { ExperimentProvider } from './stores/ExperimentProvider';

export function Experiment() {
    return (
        <ExperimentProvider>
            <ExperimentLayout stageLabel="art-canvas" panel={<Controls />}>
                <Scene />
            </ExperimentLayout>
        </ExperimentProvider>
    );
}
