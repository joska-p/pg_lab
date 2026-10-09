import { createNullClockStore } from '@repo/glaze/react/clockStore';
import { GpuCanvas } from '@repo/glaze/react/GpuCanvas';
import type { ClockStore } from '@repo/glaze/react/types';
import * as stylex from '@stylexjs/stylex';
import { useCallback, useEffect, useMemo, useRef } from 'react';

import { compileToShader, getBehavior } from '../core';
import {
    useActiveBehaviorIds,
    useAnimationSpeed,
    useChannelTrees,
    useColorSpace,
    useRunning,
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
    const running = useRunning();
    const animationSpeed = useAnimationSpeed();

    const behaviors = useMemo(
        () => activeBehaviorIds.map((id) => getBehavior(id)),
        [activeBehaviorIds],
    );

    const fragmentShader = useMemo(
        () => compileToShader({ seedText, trees, behaviors, colorSpace }),
        [seedText, trees, behaviors, colorSpace],
    );

    // The clock is a live object owned by the surface; Glaze reaches it to us
    // once. `running` stays the store's value — the clock only mirrors it, so
    // pausing freezes `u_clockTime` without losing the accumulated time.
    const clockStoreRef = useRef<ClockStore>(createNullClockStore());
    const runningRef = useRef(running);

    useEffect(() => {
        runningRef.current = running;

        const clockStore = clockStoreRef.current;

        if (running) {
            clockStore.play();
        } else {
            clockStore.pause();
        }
    }, [running]);

    const handleClockStore = useCallback((clockStore: ClockStore) => {
        clockStoreRef.current = clockStore;

        if (runningRef.current) {
            clockStore.play();
        } else {
            clockStore.pause();
        }
    }, []);

    return (
        <div {...stylex.props(styles.frame)}>
            <GpuCanvas
                fragmentShader={fragmentShader}
                uniforms={() => ({ u_animSpeed: animationSpeed })}
                onClockStore={handleClockStore}
                canvasInteractions={{ pan: false, zoom: false }}
            />
        </div>
    );
}
