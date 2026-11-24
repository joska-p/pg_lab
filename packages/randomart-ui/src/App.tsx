import { globalPlaybackStore } from '@repo/surface/react/usePlayback';
import { ExperimentShell } from '@repo/ui/components/ExperimentShell';
import { ShellWrapper } from '@repo/ui/components/ShellWrapper';

import { AppErrorBoundary } from './components/AppErrorBoundary';
import { Controls } from './components/Controls';
import { Scene } from './components/Scene';

// randomart starts paused: animation only runs when the user explicitly presses Play.
globalPlaybackStore.pause();

export function App() {
    return (
        <ShellWrapper>
            <AppErrorBoundary>
                <ExperimentShell
                    stageLabel="randomart"
                    panel={
                        <AppErrorBoundary>
                            <Controls />
                        </AppErrorBoundary>
                    }
                >
                    <AppErrorBoundary>
                        <Scene />
                    </AppErrorBoundary>
                </ExperimentShell>
            </AppErrorBoundary>
        </ShellWrapper>
    );
}
