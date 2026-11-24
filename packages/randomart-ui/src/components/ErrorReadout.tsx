import { ControlField } from '@repo/ui/components/ControlField';
import { Grid } from '@repo/ui/components/Grid';
import { Text } from '@repo/ui/components/Text';

import { useActionErrors } from '../stores/errorStore';
import { useShaderError } from '../stores/surfaceStore';

export function ErrorReadout() {
    const actionErrors = useActionErrors();
    const shaderError = useShaderError();

    if (actionErrors.length === 0 && !shaderError) {
        return null;
    }

    return (
        <Grid columns="1" gap="2">
            {actionErrors.map((error, index) => (
                <ControlField key={index} label="Action Error">
                    <Text>{error.message}</Text>
                </ControlField>
            ))}

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
