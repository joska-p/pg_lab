import { ControlPanel } from '@repo/ui/components/ControlPanel';
import { ErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { ExperimentShell } from '@repo/ui/components/ExperimentShell';
import { ShellWrapper } from '@repo/ui/components/ShellWrapper';
import { Stage } from '@repo/ui/components/Stage';
import type { ComponentPropsWithoutRef } from 'react';

import { Controls } from './components/Controls';
import { Scene } from './components/Scene';
import { applyDroppedText } from './stores/moleculeStore';

const stageProps: Omit<ComponentPropsWithoutRef<'section'>, 'children' | 'aria-label'> = {
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
};

export function App() {
    return (
        <ShellWrapper>
            <ErrorBoundary showStack={import.meta.env.DEV}>
                <ExperimentShell
                    panel={
                        <ControlPanel title="mol-demo">
                            <Controls />
                        </ControlPanel>
                    }
                >
                    <Stage label="mol-demo" {...stageProps}>
                        <Scene />
                    </Stage>
                </ExperimentShell>
            </ErrorBoundary>
        </ShellWrapper>
    );
}
