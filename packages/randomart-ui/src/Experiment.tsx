import { globalPlaybackStore } from '@repo/surface/react/usePlayback';
import { ExperimentLayout } from '@repo/ui/components/ExperimentLayout';

import { Controls } from './components/Controls';
import { Scene } from './components/Scene';

// randomart starts paused: animation only runs when the user explicitly presses Play.
globalPlaybackStore.pause();

export function Experiment() {
    return (
        <ExperimentLayout stageLabel="randomart" panel={<Controls />}>
            <Scene />
        </ExperimentLayout>
    );
}
