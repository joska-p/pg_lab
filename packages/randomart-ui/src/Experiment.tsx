import { globalPlaybackStore } from '@repo/surface/react/usePlayback';
import { ControlPanel } from '@repo/ui/components/ControlPanel';
import { ExperimentLayout } from '@repo/ui/components/ExperimentLayout';

import { Controls } from './components/Controls';
import { Scene } from './components/Scene';

export interface ExperimentProps {
    collapsed?: boolean;
    onCollapsedChange?: (collapsed: boolean) => void;
}

// randomart starts paused: animation only runs when the user explicitly presses Play.
globalPlaybackStore.pause();

export function Experiment({ collapsed, onCollapsedChange }: ExperimentProps) {
    return (
        <ExperimentLayout
            stageLabel="randomart"
            collapsed={collapsed}
            onCollapsedChange={onCollapsedChange}
            panel={
                <ControlPanel title="Randomart">
                    <Controls />
                </ControlPanel>
            }
        >
            <Scene />
        </ExperimentLayout>
    );
}
