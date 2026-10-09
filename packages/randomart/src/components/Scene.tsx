import { GpuCanvas } from '@repo/glaze/react/GpuCanvas';
import * as stylex from '@stylexjs/stylex';

import { compileToShader, getBehavior } from '../core';
import { setClockStore } from '../stores/randomart/actions';
import {
    useActiveBehaviorIds,
    useAnimationSpeed,
    useChannelTrees,
    useColorSpace,
    useSeedText,
} from '../stores/randomart/selectors';

const styles = stylex.create({
    frame: {
        position: 'relative',
        flex: 1,
        display: 'flex',
        minWidth: 0,
        minHeight: 0,
        overflow: 'hidden',
    },
});

export function Scene() {
    const seedText = useSeedText();
    const trees = useChannelTrees();
    const activeBehaviorIds = useActiveBehaviorIds();
    const colorSpace = useColorSpace();
    const animationSpeed = useAnimationSpeed();

    const behaviors = activeBehaviorIds.map((id) => getBehavior(id));
    const fragmentShader = compileToShader({ seedText, trees, behaviors, colorSpace });

    return (
        <div {...stylex.props(styles.frame)}>
            <GpuCanvas
                fragmentShader={fragmentShader}
                uniforms={() => ({ u_animSpeed: animationSpeed })}
                onClockStore={setClockStore}
                // Parity with the source app, which starts paused. Play/pause is
                // owned by the clock; controls toggle it via the published store.
                clockOptions={{ autoStart: false }}
                canvasInteractions={{ pan: false, zoom: false }}
            />
        </div>
    );
}
