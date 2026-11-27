import { ControlPanel } from '@repo/ui/components/ControlPanel';
import { ExperimentLayout } from '@repo/ui/components/ExperimentLayout';

import { Controls } from './components/controls/Controls';
import { Scene } from './components/Scene';

export interface ExperimentProps {
    collapsed?: boolean;
    onCollapsedChange?: (collapsed: boolean) => void;
}

export function Experiment({ collapsed, onCollapsedChange }: ExperimentProps) {
    return (
        <ExperimentLayout
            stageLabel="automa"
            collapsed={collapsed}
            onCollapsedChange={onCollapsedChange}
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
