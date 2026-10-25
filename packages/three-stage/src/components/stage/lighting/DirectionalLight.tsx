import { Helper } from '@react-three/drei';
import { folder, useControls } from 'leva';
import { DirectionalLightHelper } from 'three';

export function DirectionalLight() {
    const { intensity, color, x, y, z } = useControls('Lighting', {
        Directional: folder({
            intensity: {
                value: 0.5,
                label: 'Intensity',
                min: 0,
                max: 1,
                step: 0.1,
            },
            color: { value: '#ffffff', label: 'color' },
            x: {
                value: -5,
                label: 'Position X',
                min: -20,
                max: 20,
                step: 1,
            },
            y: {
                value: 8,
                label: 'Position Y',
                min: -20,
                max: 20,
                step: 1,
            },
            z: {
                value: 0,
                label: 'Position Z',
                min: -20,
                max: 20,
                step: 1,
            },
        }),
    });

    return (
        <directionalLight position={[x, y, z]} color={color} intensity={intensity} castShadow>
            <Helper type={DirectionalLightHelper} args={[2, 'crimson']} />
        </directionalLight>
    );
}
