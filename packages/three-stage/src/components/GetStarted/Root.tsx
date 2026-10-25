import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import type { Group } from 'three';

import { Branch } from './Branch';
import { getDebugGeometry } from './getDebugGeometry';
import { getSpawnPoints } from './getSpawnPoints';
import type { PresetName } from './getSpawnPoints';
import { useLevaControls } from './useLevaControls';

export function Root() {
    const groupRef = useRef<Group>(null);
    const { preset, radius, offset, circleSegments, fsphereFaces, visible, autoRotation } =
        useLevaControls();

    const branches = getSpawnPoints({
        preset: preset as PresetName,
        radius,
        offset,
        circleSegments,
        fsphereFaces,
    });

    const debugGeometry = getDebugGeometry(
        preset as PresetName,
        radius,
        circleSegments,
        fsphereFaces,
    );

    useFrame(() => {
        if (groupRef.current && autoRotation) {
            groupRef.current.rotation.x += 0.001;
            groupRef.current.rotation.y += 0.002;
        }
    });

    return (
        <group ref={groupRef}>
            {visible && (
                <mesh geometry={debugGeometry}>
                    <meshStandardMaterial color="dimgray" />
                </mesh>
            )}

            {branches.map((branch) => (
                <Branch key={branch.id} position={branch.position} rotation={branch.rotation} />
            ))}
        </group>
    );
}
