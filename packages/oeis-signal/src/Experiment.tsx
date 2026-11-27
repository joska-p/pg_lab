import { ControlPanel } from '@repo/ui/components/ControlPanel';
import { ExperimentLayout } from '@repo/ui/components/ExperimentLayout';

import { Controls } from './components/Controls';
import { Scene } from './components/Scene';

export function Experiment() {
    return (
        <ExperimentLayout
            stageLabel="oeis-signal"
            panel={
                <ControlPanel title="OEIS Signal">
                    <Controls />
                </ControlPanel>
            }
        >
            <Scene />
        </ExperimentLayout>
    );
}
