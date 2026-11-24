import { folder, useControls } from 'leva';

export function AmbientLight() {
    const { intensity, color } = useControls('Lighting', {
        Ambient: folder({
            intensity: {
                value: 0.5,
                label: 'Intensity',
                min: 0,
                max: 5,
                step: 0.1,
            },
            color: { value: '#ababab', label: 'color' },
        }),
    });

    return <ambientLight intensity={intensity} color={color} />;
}
