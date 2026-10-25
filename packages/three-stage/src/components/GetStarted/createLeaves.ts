import { Quaternion, Vector3 } from 'three';

interface LeafProps {
    leafAmount: number;
    leafSpread: number;
    distanceFromStem: number;
    spiralAngleFactor: number;
}

function createLeaves({ leafAmount, leafSpread, distanceFromStem, spiralAngleFactor }: LeafProps) {
    const leaves = Array.from({ length: leafAmount }, (_, i) => {
        const relativeScale = leafAmount > 1 ? i / (leafAmount - 1) : 0;
        const size = 0.8 * (1 - relativeScale) + 0.05;
        const yOffset = relativeScale * leafSpread;
        const spiralAngle = i * spiralAngleFactor; // Golden angle or any multiplier creates a spiral
        const leafPosition = new Vector3(
            Math.sin(spiralAngle) * distanceFromStem,
            yOffset,
            Math.cos(spiralAngle) * distanceFromStem,
        );
        const leafRotation = new Quaternion().random();

        return {
            id: i,
            position: leafPosition,
            quaternion: leafRotation,
            scale: new Vector3(size, size, size),
        };
    });

    return leaves;
}

export { createLeaves };
