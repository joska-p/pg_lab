import { createCssColor } from '@repo/glaze/core/render';
import type { UniformValue } from '@repo/glaze/gpu/shader/types';
import { parseColor } from '@repo/glaze/gpu/shapes/color';
import { GpuCanvas } from '@repo/glaze/react/GpuCanvas';

import cellMeshShader from '../../engine/gpu/shaders/cell-mesh.frag?raw';
import { useCellPainting } from '../../hooks/useCellPainting';
import { buildStateColorArray } from '../../lib/colors';
import { TRAIL_COLOR, TRAIL_STRENGTH } from '../../lib/constants';
import { computeGridRect } from '../../lib/gridPlacement';
import { initSimulation, tickSimulation } from '../../stores/automa/actions';
import { automaStore } from '../../stores/automa/store';

function CellMesh() {
    const interactions = useCellPainting();

    return (
        <GpuCanvas
            // No `pan` option here: providing onStart/onMove disables glaze's
            // built-in pan, so useCellPainting handles middle-drag pan itself.
            canvasInteractions={interactions}
            initialCamera={{ minZoom: 1, maxZoom: 64 }}
            fragmentShader={cellMeshShader}
            onMount={initSimulation}
            onFrame={(surface) => {
                tickSimulation(surface.deltaTime);
            }}
            uniforms={(surface): Record<string, UniformValue> => {
                const { engine, stateColors, cols, rows } = automaStore.getState();

                if (!engine) {
                    return {};
                }

                // Same placement math as eventToGridPoint: the display and the
                // picking share computeGridRect, so cells stay under the cursor
                // at every zoom level.
                const rect = computeGridRect(surface.width, surface.height, cols, rows);
                const dead = parseColor(stateColors[0] ?? createCssColor('#000000'));

                return {
                    u_grid: engine.getDisplayTexture(),
                    u_stateColors: buildStateColorArray(stateColors),
                    u_background: [dead.r, dead.g, dead.b],
                    u_trailColor: TRAIL_COLOR,
                    u_trailStrength: TRAIL_STRENGTH,
                    u_gridOrigin: [rect.originX, rect.originY],
                    u_gridScale: rect.scale,
                    u_gridSize: [cols, rows],
                };
            }}
        />
    );
}

export { CellMesh };
