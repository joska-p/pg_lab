import { Segmented } from '@repo/ui/components/Segmented';

import { setMode } from '../stores/randomart/actions';
import { useMode } from '../stores/randomart/selectors';
import { ActionControls } from './controls/ActionControls';
import { BehaviorControls } from './controls/BehaviorControls';
import { ConfigControls } from './controls/ConfigControls';
import { DepthControls } from './controls/DepthControls';
import { OperatorControls } from './controls/OperatorControls';
import { PlaybackControls } from './controls/PlaybackControls';

const MODE_OPTIONS = [
    { value: 'play', label: 'Play' },
    { value: 'test', label: 'Test' },
] as const;

export function Controls() {
    const mode = useMode();

    return (
        <>
            <Segmented label="Mode" options={MODE_OPTIONS} value={mode} onValueChange={setMode} />

            {mode === 'play' && (
                <>
                    <ConfigControls />
                    <ActionControls />
                    <PlaybackControls />
                    <DepthControls />
                    <OperatorControls />
                    <BehaviorControls />
                </>
            )}
        </>
    );
}
