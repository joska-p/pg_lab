import { GizmoHelper, GizmoViewport, OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';

import { AmbientLight } from '../lighting/AmbientLight';
import { DirectionalLight } from '../lighting/DirectionalLight';
import { PointLight } from '../lighting/PointLight';
import { SpotLight } from '../lighting/SpotLight';
import { Sample } from '../sample/Sample';

const cameraOptions = {
    position: [-15, 10, 20],
    fov: 60,
} as const;

function Scene() {
    return (
        <>
            <Canvas camera={cameraOptions} shadows style={{ width: '100%', height: '100%' }}>
                {' '}
                <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                    <planeGeometry args={[20, 20]} />
                    <meshStandardMaterial />
                </mesh>
                <axesHelper args={[10]} />
                <GizmoHelper alignment="bottom-left" margin={[80, 80]}>
                    <GizmoViewport />
                </GizmoHelper>
                <gridHelper args={[20, 20, 0xff22aa, 0x55ccff]} />
                <OrbitControls />
                <Sample />
                <AmbientLight />
                <PointLight />
                <DirectionalLight />
                <SpotLight />
            </Canvas>
        </>
    );
}

export { Scene };
