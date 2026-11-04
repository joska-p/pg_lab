import { ControlSection } from '@repo/ui/components/ControlSection';
import { NumberField } from '@repo/ui/components/NumberField';

import {
    MAX_LOOP_DURATION,
    MIN_LOOP_DURATION,
    parseDurationInput,
    setDuration,
    useDuration,
} from '../../stores/randomartStore';

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
                onValueChange={(val) => {
                    setDuration(parseDurationInput(String(val)));
                }}
            />
        </ControlSection>
    );
}
