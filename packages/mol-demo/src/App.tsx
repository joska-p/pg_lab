import { ControlPanel } from '@repo/ui/components/ControlPanel';
import { ControlSection } from '@repo/ui/components/ControlSection';
import { ErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { ExperimentShell } from '@repo/ui/components/ExperimentShell';
import { Segmented } from '@repo/ui/components/Segmented';
import { ShellWrapper } from '@repo/ui/components/ShellWrapper';
import { Stage } from '@repo/ui/components/Stage';
import { useEffect, useRef } from 'react';

import { MolCanvas } from './components/MolCanvas';
import { MoleculeList } from './components/MoleculeList';
import { PatternCanvas } from './components/PatternCanvas';
import { PerfHud } from './components/PerfHud';
import type { ViewerHandle } from './lib/pattern/viewer';
import { useTheme, setTheme } from './stores/appStore';
import { applyDroppedText } from './stores/moleculeStore';

export function App() {
    const theme = useTheme();
    const viewerRef = useRef<ViewerHandle>({
        camera: null,
        controls: null,
        requestPatternDraw: null,
    });

    useEffect(() => {
        document.documentElement.style.colorScheme = theme === 'system' ? 'light dark' : theme;
    }, [theme]);

    return (
        <ShellWrapper>
            <ErrorBoundary showStack={import.meta.env.DEV}>
                <ExperimentShell
                    panel={
                        <ControlPanel title="mol-demo">
                            <MoleculeList />
                            <ControlSection title="Theme">
                                <Segmented<'light' | 'dark' | 'system'>
                                    options={['light', 'dark', 'system']}
                                    value={theme}
                                    onValueChange={setTheme}
                                />
                            </ControlSection>
                            <PerfHud />
                        </ControlPanel>
                    }
                >
                    <Stage
                        label="mol-demo"
                        title="Drop a .mol/.sdf file here to load it"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                            e.preventDefault();
                            const file = e.dataTransfer.files[0];
                            if (!file) {
                                return;
                            }
                            const reader = new FileReader();
                            reader.onload = (evt) => {
                                const text = evt.target?.result;
                                if (typeof text !== 'string') {
                                    console.error(
                                        'mol-demo: failed to read .mol file: empty result',
                                    );
                                    return;
                                }
                                try {
                                    applyDroppedText(text, file.name);
                                } catch (err) {
                                    console.error('mol-demo: failed to parse .mol file:', err);
                                }
                            };
                            reader.readAsText(file);
                        }}
                    >
                        <PatternCanvas viewerRef={viewerRef} />
                        <MolCanvas viewerRef={viewerRef} />
                    </Stage>
                </ExperimentShell>
            </ErrorBoundary>
        </ShellWrapper>
    );
}
