import { Instance } from '@react-three/drei';
import { Quaternion, Vector3 } from 'three';

interface LeafProps {
    scale?: Vector3;
    position?: Vector3;
    quaternion?: Quaternion; // Add this prop
}

function Leaf({
    scale = new Vector3(1, 1, 1),
    position = new Vector3(),
    quaternion = new Quaternion(), // Default to no rotation
}: LeafProps) {
    return <Instance position={position} quaternion={quaternion} scale={scale} />;
}

export { Leaf };
