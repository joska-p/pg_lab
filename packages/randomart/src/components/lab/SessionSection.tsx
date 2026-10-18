import { Button } from '@repo/ui/components/Button';
import { ControlField } from '@repo/ui/components/ControlField';

import { newImage, useCompiledShader, useSeed } from '../../stores/appStore';

/** Image generation: generates a new artwork from the current grammar. */
export function SessionSection() {
    const seed = useSeed();
    const compiledShader = useCompiledShader();

    return (
        <ControlField label={`Seed: ${seed} • ${compiledShader.stats.nodes} nodes`}>
            <Button
                onClick={() => {
                    newImage();
                }}
            >
                New image
            </Button>
        </ControlField>
    );
}
