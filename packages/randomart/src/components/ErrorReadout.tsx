import { ControlField } from '@repo/ui/components/ControlField';
import { Grid } from '@repo/ui/components/Grid';
import { Text } from '@repo/ui/components/Text';

import { useActionError, useShaderError } from '../stores/lab/labStore';

/**
 * Action and shader failures, kept visible in every face: in Toy a broken shader must not be silent
 * just because the advanced controls are hidden.
 */
export function ErrorReadout() {
    const actionError = useActionError();
    const shaderError = useShaderError();

    if (!actionError && !shaderError) {
        return null;
    }

    return (
        <Grid columns="1" gap="2">
            {actionError && (
                <ControlField label="Action Error">
                    <Text>{actionError}</Text>
                </ControlField>
            )}

            {shaderError && (
                <ControlField label="Shader Error">
                    <Text>
                        [{shaderError.stage}] {shaderError.message}
                    </Text>
                </ControlField>
            )}
        </Grid>
    );
}
