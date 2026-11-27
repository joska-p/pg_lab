import { ControlPanel } from '@repo/ui/components/ControlPanel';
import { ExperimentLayout } from '@repo/ui/components/ExperimentLayout';

import { Controls } from './components/layout/Controls';
import { Scene } from './components/layout/Scene';

export interface ExperimentProps {
    collapsed?: boolean;
    onCollapsedChange?: (collapsed: boolean) => void;
}

export function Experiment({ collapsed, onCollapsedChange }: ExperimentProps) {
    return (
        <ExperimentLayout
            stageLabel="Pixel manipulator"
            collapsed={collapsed}
            onCollapsedChange={onCollapsedChange}
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
