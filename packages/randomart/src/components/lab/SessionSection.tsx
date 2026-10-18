import { Button } from '@repo/ui/components/Button';
import { Grid } from '@repo/ui/components/Grid';
import { TextInput } from '@repo/ui/components/TextInput';

import { createSeed } from '../../core/random/index.ts';
import { newSeed, useSeed } from '../../stores/appStore';

/** Image generation: generates a new artwork from the current grammar. */
export function SessionSection() {
    const seed = useSeed();

    return (
        <Grid columns="2" gap="2">
            <TextInput
                value={String(seed)}
                onValueChange={(value) => {
                    newSeed(createSeed(Number(value)));
                }}
            />
            <Button
                onClick={() => {
                    newSeed();
                }}
            >
                New seed
            </Button>
        </Grid>
    );
}
