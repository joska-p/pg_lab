import { Button } from '@repo/ui/components/Button';
import { ControlSection } from '@repo/ui/components/ControlSection';
import { Slider } from '@repo/ui/components/Slider';
import * as stylex from '@stylexjs/stylex';

import { SPEED_MAX_MS, SPEED_MIN_MS, SPEED_STEP_MS } from '../../lib/constants';
import { setSpeed, stepOnce, toggleRunning } from '../../stores/automa/actions';
import { useRunning, useSpeedMs } from '../../stores/automa/selectors';

const styles = stylex.create({
    actions: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 8,
    },
});

export function PlaybackSection() {
    const running = useRunning();
    const speedMs = useSpeedMs();

    return (
        <ControlSection title="Playback">
            <div {...stylex.props(styles.actions)}>
                <Button family="aurora" onClick={toggleRunning}>
                    {running ? 'Pause' : 'Play'}
                </Button>
                <Button onClick={stepOnce} disabled={running}>
                    Step
                </Button>
            </div>
            <Slider
                label="Speed"
                value={speedMs}
                onValueChange={setSpeed}
                min={SPEED_MIN_MS}
                max={SPEED_MAX_MS}
                step={SPEED_STEP_MS}
            />
        </ControlSection>
    );
}
