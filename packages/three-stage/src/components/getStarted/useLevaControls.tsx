import { useControls } from 'leva';

import { isPresetName, PRESET_NAMES } from './getSpawnPoints';

function useLevaControls() {
    const {
        preset: presetValue,
        radius,
        offset,
        circleSegments,
        fsphereFaces,
        visible,
        autoRotation,
    } = useControls('Branches', {
        preset: {
            label: 'Spawn',
            value: 'icosahedron',
            options: [...PRESET_NAMES],
        },
        circleSegments: {
            label: 'Segments',
            value: 12,
            min: 3,
            max: 32,
            step: 1,
            render: (get) => get('Branches.preset') === 'circle',
        },
        fsphereFaces: {
            label: 'Faces',
            value: 12,
            min: 3,
            max: 32,
            step: 1,
            render: (get) => get('Branches.preset') === 'fsphere',
        },
        radius: { label: 'Radius', value: 1.5, min: 0.5, max: 5, step: 0.1 },
        offset: {
            label: 'Offset',
            value: 0.0,
            min: -2,
            max: 2,
            step: 0.05,
        },
        visible: { label: 'Visible', value: true },
        autoRotation: { label: 'Rotation auto', value: false },
    });

    if (!isPresetName(presetValue)) {
        throw new Error(`Invalid preset: ${presetValue}`);
    }

    return {
        preset: presetValue,
        radius,
        offset,
        circleSegments,
        fsphereFaces,
        visible,
        autoRotation,
    };
}

export { useLevaControls };
