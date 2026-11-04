import { ControlSection } from '@repo/ui/components/ControlSection';
import { NumberField } from '@repo/ui/components/NumberField';

import { MAX_LOOP_DURATION, MIN_LOOP_DURATION } from '../../constants';
import { clampDuration } from '../../parse/duration';
import { setDuration, useDuration } from '../../stores/playbackStore';

export function PlaybackSection() {
    const duration = useDuration();

    return (
        <ControlSection title="playback">
            <NumberField
                direction="horizontal"
                label="loop (s)"
                min={MIN_LOOP_DURATION}
                max={MAX_LOOP_DURATION}
                step={0.5}
                value={duration}
                onValueChange={(value) => {
                    setDuration(clampDuration(value));
                }}
            />
        </ControlSection>
    );
}
