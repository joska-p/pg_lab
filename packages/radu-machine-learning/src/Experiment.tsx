import { ExperimentLayout } from '@repo/ui/components/ExperimentLayout';

import { Controls } from './components/Controls';
import { Scene } from './components/Scene';

export function Experiment() {
    return (
        <ExperimentLayout stageLabel="Radu machine learning" panel={<Controls />}>
            <Scene />
        </ExperimentLayout>
    );
}
