import { GizmoHelper, GizmoViewport, OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';

import { GradientBackground } from './GradientBackground';
import { Root } from './Root';

function GetStarted() {
    return (
        <div style={{ height: '100%', width: '100%' }}>
            <Canvas
                camera={{ position: [0, 0, 10], fov: 75 }}
                style={{ width: '100%', height: '100%' }}
            >
                <ambientLight intensity={0.5} />
                <hemisphereLight args={['white', 'darkgray', 1]} />
                <Root />
                <GradientBackground />
                <OrbitControls enableDamping />
                <GizmoHelper alignment="bottom-left" margin={[80, 80]}>
                    <GizmoViewport axisColors={['red', 'green', 'blue']} labelColor="white" />
                </GizmoHelper>
            </Canvas>
        </div>
    );
}

export { GetStarted };
