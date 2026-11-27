import { ControlPanel } from '@repo/ui/components/ControlPanel';
import { ExperimentLayout } from '@repo/ui/components/ExperimentLayout';
import type { StageProps } from '@repo/ui/components/ExperimentLayout';

import { Controls } from './components/Controls';
import { Scene } from './components/Scene';
import { applyDroppedText } from './stores/moleculeStore';

export interface ExperimentProps {
    collapsed?: boolean;
    onCollapsedChange?: (collapsed: boolean) => void;
}

const stageProps = {
    title: 'Drop a .mol/.sdf file here to load it',
    onDragOver: (e) => {
        e.preventDefault();
    },
    onDrop: (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (!file) {
            return;
        }
        const reader = new FileReader();
        reader.onload = (evt) => {
            const text = evt.target?.result;
            if (typeof text !== 'string') {
                console.error('mol-demo: failed to read .mol file: empty result');
                return;
            }
            try {
                applyDroppedText(text, file.name);
            } catch (err) {
                console.error('mol-demo: failed to parse .mol file:', err);
            }
        };
        reader.readAsText(file);
    },
} satisfies StageProps;

export function Experiment({ collapsed, onCollapsedChange }: ExperimentProps) {
    return (
        <ExperimentLayout
            stageLabel="mol-demo"
            stageProps={stageProps}
            collapsed={collapsed}
            onCollapsedChange={onCollapsedChange}
            panel={
                <ControlPanel title="Mol Demo">
                    <Controls />
                </ControlPanel>
            }
        >
            <Scene />
        </ExperimentLayout>
    );
}
