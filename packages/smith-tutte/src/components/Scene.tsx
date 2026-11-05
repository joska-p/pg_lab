import { createCssColor } from '@repo/glaze/core/render';
import { createDurationSeconds } from '@repo/glaze/core/time';
import type { CpuSurface } from '@repo/glaze/cpu/CpuSurface';
import { CpuCanvas } from '@repo/glaze/react/CpuCanvas';
import { Suspense, useSyncExternalStore } from 'react';

import { easeInOutQuad } from '../engine/interpolator/interpolator';
import { createSquareScene, placeSquares } from '../render/squareScene';
import { setClockStore, useClockStore, useNetlist } from '../stores/experimentStore';

const ANIMATION_DURATION = createDurationSeconds(4);
const BACKGROUND = createCssColor('#0b0e14');

function SceneContent() {
    const netlist = useNetlist();
    const clockStore = useClockStore();

    // Create the scene once per netlist (stable reference)
    const scene = createSquareScene(netlist, 4, 8);

    const subscribe = (onStoreChange: () => void) =>
        clockStore?.subscribe(onStoreChange) ?? (() => undefined);
    const getSnapshot = () => clockStore?.progress ?? 0;
    const progress = useSyncExternalStore(subscribe, getSnapshot, () => 0);

    const squares = placeSquares(scene, progress, easeInOutQuad);

    function drawFrame(surface: CpuSurface): void {
        surface.clear(BACKGROUND);

        for (const square of squares) {
            surface.rectangle(
                {
                    x: square.x,
                    y: square.y,
                    width: square.size,
                    height: square.size,
                },
                {
                    fill:
                        square.extremity === 'high'
                            ? createCssColor('#4cc9f0')
                            : createCssColor('#f72585'),
                },
            );
        }
    }

    return (
        <CpuCanvas
            clockOptions={{
                mode: 'timed',
                duration: ANIMATION_DURATION,
                pingPong: true,
            }}
            initialCamera={{ pan: { x: 48, y: 48 }, zoom: 24 }}
            onFrame={drawFrame}
            onClockStore={setClockStore}
        />
    );
}

export function Scene() {
    return (
        <Suspense fallback={null}>
            <SceneContent />
        </Suspense>
    );
}
