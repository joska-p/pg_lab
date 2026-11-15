import { Camera2D } from '@repo/surface/core/Camera2D';
import type { UniformValue } from '@repo/surface/gpu/types';
import { GpuCanvas } from '@repo/surface/react/GpuCanvas';
import { useMemo } from 'react';

import cellMeshShader from '../engine/gpu/shaders/cell-mesh.frag?raw';
import { useCellPainting } from '../hooks/useCellPainting';
import { buildStateColorArray, parseColor } from '../lib/colors';
import { TRAIL_COLOR, TRAIL_STRENGTH } from '../lib/constants';
import { computeGridRect } from '../lib/gridPlacement';
import { initSimulation, tickSimulation } from '../stores/automa/actions';
import { automaStore } from '../stores/automa/store';

export function Scene() {
    const camera = useMemo(() => new Camera2D({ minZoom: 1, maxZoom: 64 }), []);
    const handlers = useCellPainting(camera);

    return (
        <GpuCanvas
            {...handlers}
            fragmentShader={cellMeshShader}
            onMount={initSimulation}
            onContextRestored={initSimulation}
            onFrame={(surface) => {
                tickSimulation(surface.deltaTime);
            }}
            uniforms={(surface): Record<string, UniformValue> => {
                const { engine, stateColors, cols, rows } = automaStore.getState();

                if (!engine) {
                    return {};
                }

                // Layout, pointer picking and the display shader all share the CSS-pixel world.
                const rect = computeGridRect(surface.width, surface.height, cols, rows);
                const dead = parseColor(stateColors[0] ?? '#000000');

                return {
                    u_grid: engine.getDisplayTexture(),
                    u_stateColors: buildStateColorArray(stateColors),
                    u_background: [dead.r, dead.g, dead.b],
                    u_trailColor: TRAIL_COLOR,
                    u_trailStrength: TRAIL_STRENGTH,
                    u_gridOrigin: [rect.originX, rect.originY],
                    u_gridScale: rect.scale,
                    u_gridSize: [cols, rows],
                    u_viewSize: [surface.width, surface.height],
                    u_camera: [camera.x, camera.y, camera.zoom],
                };
            }}
        />
    );
}
