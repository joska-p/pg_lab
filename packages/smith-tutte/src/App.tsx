import { createCssColor } from '@repo/glaze/core/render';
import type { DrawStyle } from '@repo/glaze/core/shapes';
import { createDurationSeconds } from '@repo/glaze/core/time';
import type { CpuSurface } from '@repo/glaze/cpu/CpuSurface';
import { CpuCanvas } from '@repo/glaze/react/CpuCanvas';

import netlistSource from '../public/netlists/simple-edge.json?raw';
import type { EdgeExtremity } from './engine/adapter/adapter';
import type { Netlist } from './engine/core/netlist';
import { easeInOutQuad } from './engine/interpolator/interpolator';
import { createSquareScene, placeSquares } from './render/squareScene';

/*
 * Slice 1 : une arête unique résolue à deux courants différents. L'animation interpole entre les
 * deux états géométriques ; aucune coordonnée n'est écrite à la main.
 */
const SLICE1_NETLIST: Netlist = JSON.parse(netlistSource);
const SLICE1_FROM_CURRENT = 4;
const SLICE1_TO_CURRENT = 8;

const ANIMATION_DURATION = createDurationSeconds(4);
const BACKGROUND = createCssColor('#0b0e14');
const SQUARE_STYLE_BY_EXTREMITY = {
    high: { fill: createCssColor('#4cc9f0') },
    low: { fill: createCssColor('#f72585') },
} satisfies Record<EdgeExtremity, DrawStyle>;

const SLICE1_SCENE = createSquareScene(SLICE1_NETLIST, SLICE1_FROM_CURRENT, SLICE1_TO_CURRENT);

function drawFrame(surface: CpuSurface): void {
    // La progression vient de la Clock de glaze, mise à jour par CpuSurface avant chaque frame.
    const squares = placeSquares(SLICE1_SCENE, surface.clock.progress, easeInOutQuad);

    surface.clear(BACKGROUND);

    for (const square of squares) {
        surface.rectangle(
            {
                x: square.x,
                y: square.y,
                width: square.size,
                height: square.size,
            },
            SQUARE_STYLE_BY_EXTREMITY[square.extremity],
        );
    }
}

function App() {
    return (
        <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
            <CpuCanvas
                clockOptions={{
                    mode: 'timed',
                    duration: ANIMATION_DURATION,
                    pingPong: true,
                }}
                initialCamera={{ pan: { x: 48, y: 48 }, zoom: 24 }}
                onFrame={drawFrame}
            />
        </div>
    );
}

export { App };
