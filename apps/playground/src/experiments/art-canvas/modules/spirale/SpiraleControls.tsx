import { usePlayback } from '@repo/surface/react/usePlayback';
import { Button } from '@repo/ui/components/Button';
import { Slider } from '@repo/ui/components/Slider';
import { space } from '@repo/ui/tokens/const.stylex';
import * as stylex from '@stylexjs/stylex';

import { setGap, useGap } from './store';

const styles = stylex.create({
    actions: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: space['2'],
    },
});

function SpiraleControls() {
    const gap = useGap();
    const { isPlaying, togglePlay } = usePlayback();

    return (
        <div {...stylex.props(styles.actions)}>
            <Button onClick={togglePlay}>{isPlaying ? 'Pause' : 'Play'}</Button>
            <Slider
                label="Gap"
                value={gap}
                onValueChange={setGap}
                min={0.01}
                max={0.5}
                step={0.01}
            />
        </div>
    );
}

export { SpiraleControls };
