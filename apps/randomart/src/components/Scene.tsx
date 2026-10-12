import { GpuCanvas } from '@repo/glaze/react/GpuCanvas';
import * as stylex from '@stylexjs/stylex';
import { useEffect } from 'react';

import { compileToShader, getBehavior } from '../core';
import { setClockStore, setGpuSurface } from '../stores/randomart/actions';
import {
    useActiveBehaviorIds,
    useAnimationSpeed,
    useChannelTrees,
    useColorSpace,
    useMode,
    useSeedText,
} from '../stores/randomart/selectors';
import { FloatingInspector } from './inspector/FloatingInspector';
import { TestMode } from './testMode/TestMode';

const styles = stylex.create({
    frame: {
        aspectRatio: 1,
        marginInline: 'auto',
        height: '100%',
    },
});

function PlayScene() {
    const seedText = useSeedText();
    const trees = useChannelTrees();
    const activeBehaviorIds = useActiveBehaviorIds();
    const colorSpace = useColorSpace();
    const animationSpeed = useAnimationSpeed();

    const behaviors = activeBehaviorIds.map((id) => getBehavior(id));
    const fragmentShader = compileToShader({ seedText, trees, behaviors, colorSpace });

    // The surface has its own lifecycle (owned by `GpuCanvas`); clear the
    // published reference when this scene unmounts so a reload reads pixels
    // from a live surface, not a destroyed one.
    useEffect(() => {
        return () => {
            setGpuSurface(null);
        };
    }, []);

    return (
        <>
            <div {...stylex.props(styles.frame)}>
                <GpuCanvas
                    fragmentShader={fragmentShader}
                    uniforms={() => ({ u_animSpeed: animationSpeed })}
                    onClockStore={setClockStore}
                    onMount={setGpuSurface}
                    clockOptions={{ autoStart: false }}
                    canvasInteractions={{ pan: false, zoom: false }}
                />
            </div>
            <FloatingInspector />
        </>
    );
}

// Play mode renders the generated shader; test mode owns the stage with the
// per-operator CPU/GPU gallery (the play canvas is unmounted, so its published
// surface is cleared and PNG export disables).
export function Scene() {
    const mode = useMode();

    return mode === 'test' ? <TestMode /> : <PlayScene />;
}
