import { ControlPanel } from '@repo/ui/components/ControlPanel';
import { ExperimentLayout } from '@repo/ui/components/ExperimentLayout';

import { Controls } from './components/layout/Controls';
import { Scene } from './components/layout/Scene';

export function Experiment() {
    return (
        <ExperimentLayout
            stageLabel="Pixel manipulator"
            panel={
                <ControlPanel title="Pixel Manipulator">
                    <Controls />
                </ControlPanel>
            }
        >
            <Scene />
        </ExperimentLayout>
    );
}
