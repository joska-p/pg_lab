import { Helper } from '@react-three/drei';
import { folder, useControls } from 'leva';
import { PointLightHelper } from 'three';

export function PointLight() {
    const { intensity, color, decay, x, y, z } = useControls('Lighting', {
        Point: folder({
            intensity: {
                value: 1,
                label: 'Intensity',
                min: 0,
                max: 5,
                step: 0.1,
            },
            color: { value: '#ffffff', label: 'color' },
            decay: {
                value: 0,
                label: 'Decay',
                min: 0,
                max: 5,
                step: 0.1,
            },
            x: {
                value: 10,
                label: 'Position X',
                min: -20,
                max: 20,
                step: 1,
            },
            y: {
                value: 10,
                label: 'Position Y',
                min: -20,
                max: 20,
                step: 1,
            },
            z: {
                value: 10,
                label: 'Position Z',
                min: -20,
                max: 20,
                step: 1,
            },
        }),
    });

    return (
        <pointLight
            castShadow
            position={[x, y, z]}
            decay={decay}
            intensity={intensity}
            color={color}
        >
            <Helper type={PointLightHelper} args={[1]} />
        </pointLight>
    );
}
