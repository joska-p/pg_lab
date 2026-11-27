import { ExperimentLayout } from '@repo/ui/components/ExperimentLayout';

import { Controls } from './components/controls/Controls';
import { Scene } from './components/Scene';

export function Experiment() {
    return (
        <ExperimentLayout stageLabel="Sequencer" panel={<Controls />}>
            <Scene />
        </ExperimentLayout>
    );
}
