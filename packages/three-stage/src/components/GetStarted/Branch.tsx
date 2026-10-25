import { Instances } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useControls } from 'leva';
import { useRef } from 'react';
import { BoxGeometry, Euler, Vector3 } from 'three';
import type { ShaderMaterial } from 'three';

import { createLeaves } from './createLeaves';
import { Leaf } from './Leaf';
import { leafMaterial } from './materials/leaf/leafMaterial';

interface BranchProps {
    position?: Vector3;
    rotation?: Euler;
}

function Branch({ position = new Vector3(0, 0, 0), rotation = new Euler(0, 0, 0) }: BranchProps) {
    const materialRef = useRef<ShaderMaterial>(null);

    const { leafAmount, leafSpread, spiralAngleFactor, distanceFromStem } = useControls('leaf', {
        leafAmount: { label: 'Amount', value: 20, min: 1, max: 20 },
        leafSpread: { label: 'Spread', value: 8, min: 1, max: 20 },
        spiralAngleFactor: {
            label: 'Spiral Angle Factor',
            value: 0.8,
            min: 0,
            max: 2.4,
        },
        distanceFromStem: {
            label: 'Distance From Stem',
            value: 0.2,
            min: 0,
            max: 1,
        },
    });

    const leaves = createLeaves({
        leafAmount,
        leafSpread,
        distanceFromStem,
        spiralAngleFactor,
    });

    useFrame((state) => {
        if (materialRef.current && 'uniforms' in materialRef.current) {
            materialRef.current.uniforms['uTime'].value = state.clock.getElapsedTime();
        }
    });

    return (
        <Instances
            geometry={new BoxGeometry(1, 1, 1)}
            limit={leafAmount}
            position={position}
            rotation={rotation}
            material={leafMaterial}
        >
            {leaves.map((leaf) => (
                <Leaf
                    key={leaf.id}
                    position={leaf.position}
                    quaternion={leaf.quaternion}
                    scale={leaf.scale}
                />
            ))}
        </Instances>
    );
}

export { Branch };
