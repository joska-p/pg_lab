import { useFrame } from '@react-three/fiber';
import { useControls } from 'leva';
import { useRef, useState } from 'react';
import type * as THREE from 'three';
import type { Mesh } from 'three';

import { geometries } from '../../../utils/geometry';
import { materials } from '../../../utils/material';

export function Sample() {
    const sampleRef = useRef<Mesh>(null);
    const { speed, geometry, color, material } = useControls('Object', {
        speed: {
            label: 'Rotation speed',
            value: 0.005,
            min: 0.0,
            max: 0.03,
            step: 0.001,
        },
        geometry: {
            label: 'Geometry',
            options: geometries.reduce<Record<string, THREE.BufferGeometry>>(
                (accumulator, currentValue) => {
                    accumulator[currentValue.label] = currentValue.geometry();

                    return accumulator;
                },
                {},
            ),
        },
        color: {
            label: 'Color',
            value: '#00bfff',
        },
        material: {
            label: 'Material',
            options: materials.reduce<Record<string, THREE.Material>>(
                (accumulator, currentValue) => {
                    accumulator[currentValue.label] = currentValue.material();

                    return accumulator;
                },
                {},
            ),
        },
    });

    useFrame(() => {
        if (sampleRef.current) {
            sampleRef.current.rotation.x += speed;
            sampleRef.current.rotation.y += speed;
            sampleRef.current.rotation.z += speed;
        }
    });

    const [wireframe, setWireframe] = useState(false);

    const handleClick = () => {
        setWireframe(!wireframe ? true : false);
    };

    return (
        <mesh ref={sampleRef} castShadow onClick={handleClick} position={[0, 3, 0]}>
            <primitive object={geometry} />
            <primitive object={material} color={color} wireframe={wireframe} />
        </mesh>
    );
}
