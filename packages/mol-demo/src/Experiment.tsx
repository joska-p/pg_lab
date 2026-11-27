import { ControlPanel } from '@repo/ui/components/ControlPanel';
import { ExperimentLayout } from '@repo/ui/components/ExperimentLayout';
import type { StageProps } from '@repo/ui/components/ExperimentLayout';

import { Controls } from './components/Controls';
import { Scene } from './components/Scene';
import { applyDroppedText } from './stores/moleculeStore';

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

export function Experiment() {
    return (
        <ExperimentLayout
            stageLabel="mol-demo"
            stageProps={stageProps}
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
