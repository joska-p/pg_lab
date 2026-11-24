import { Helper } from '@react-three/drei';
import { folder, useControls } from 'leva';
import { SpotLightHelper } from 'three';

export function SpotLight() {
    const { intensity, color, angle, penumbra, x, y, z } = useControls('Lighting', {
        Spot: folder({
            intensity: {
                value: 10,
                label: 'Intensity',
                min: 0,
                max: 100,
                step: 1,
            },
            color: { value: '#ffffff', label: 'color' },
            penumbra: {
                value: 0.0,
                min: 0.0,
                max: 1.0,
                step: 0.1,
            },
            angle: {
                value: Math.PI / 16,
                label: 'Angle',
                min: 0,
                max: Math.PI / 2,
                step: 0.01,
            },
            x: {
                value: 5,
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
        <spotLight
            intensity={intensity}
            position={[x, y, z]}
            color={color}
            angle={angle}
            penumbra={penumbra}
            castShadow
        >
            <Helper type={SpotLightHelper} args={['orange']} />
        </spotLight>
    );
}
