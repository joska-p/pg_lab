import { createPlaybackStore, PlaybackProvider } from '@repo/surface/react/usePlayback';
import { ExperimentLayout } from '@repo/ui/components/ExperimentLayout';
import { useState } from 'react';

import { Controls } from './components/Controls';
import { Scene } from './components/Scene';

export function Experiment() {
    // Randomart starts paused by experiment choice, scoped to this experiment instance.
    const [playbackStore] = useState(() => createPlaybackStore(false));

    return (
        <PlaybackProvider store={playbackStore}>
            <ExperimentLayout stageLabel="randomart" panel={<Controls />}>
                <Scene />
            </ExperimentLayout>
        </PlaybackProvider>
    );
}
