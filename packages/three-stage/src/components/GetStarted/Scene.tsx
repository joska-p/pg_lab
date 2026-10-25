import { GizmoHelper, GizmoViewport, OrbitControls } from '@react-three/drei';

import { GradientBackground } from './GradientBackground';
import { Root } from './Root';

function Scene() {
    return (
        <>
            <ambientLight intensity={0.5} />
            <hemisphereLight args={['white', 'darkgray', 1]} />
            <Root />
            <GradientBackground />
            <OrbitControls enableDamping />
            <GizmoHelper alignment="bottom-left" margin={[80, 80]}>
                <GizmoViewport axisColors={['red', 'green', 'blue']} labelColor="white" />
            </GizmoHelper>
        </>
    );
}

export { Scene };
