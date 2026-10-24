import { Stage } from '@repo/ui/components/Stage';
import { AtlasPaths } from '@repo/ui/visuals/atlas/AtlasPaths';

const seed = Date.now();

export function Scene() {
    return (
        <Stage label="playground">
            <AtlasPaths seed={seed} />
        </Stage>
    );
}
