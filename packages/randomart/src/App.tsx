import { ErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { ExperimentShell } from '@repo/ui/components/ExperimentShell';
import { ShellWrapper } from '@repo/ui/components/ShellWrapper';
import { Stage } from '@repo/ui/components/Stage';

import { Controls } from './components/Controls';
import { GalleryStage } from './components/gallery/GalleryStage';
import { Scene } from './components/Scene';
import { useMode } from './stores/appStore';

export function App() {
    const mode = useMode();

    return (
        <ShellWrapper>
            <ErrorBoundary showStack={import.meta.env.DEV}>
                <ExperimentShell panel={<Controls />}>
                    <Stage label="randomart">
                        {mode === 'gallery' ? <GalleryStage /> : <Scene />}
                    </Stage>
                </ExperimentShell>
            </ErrorBoundary>
        </ShellWrapper>
    );
}
