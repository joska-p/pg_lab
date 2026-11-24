import { initialRotations } from '../../core/constants';
import { getRandom } from '../random/getRandom';

function generateTileRotation(): string {
    const rotationKeys = Object.keys(initialRotations);

    return getRandom(rotationKeys);
}

export { generateTileRotation };
