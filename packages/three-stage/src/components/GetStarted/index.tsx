import { Canvas } from '@react-three/fiber';

import { Scene } from './Scene';

function GetStarted() {
    return (
        <div style={{ height: '100%', width: '100%' }}>
            <Canvas
                camera={{ position: [0, 0, 10], fov: 75 }}
                style={{ width: '100%', height: '100%' }}
            >
                <Scene />
            </Canvas>
        </div>
    );
}

export { GetStarted };
