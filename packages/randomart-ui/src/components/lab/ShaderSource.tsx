import { Button } from '@repo/ui/components/Button';
import { Card } from '@repo/ui/components/Card';
import { Stack } from '@repo/ui/components/Stack';
import { Text } from '@repo/ui/components/Text';
import { TextArea } from '@repo/ui/components/TextArea';
import * as stylex from '@stylexjs/stylex';

import { useCompiledShader } from '../../stores/vmStore';

const POPOVER_ID = 'shader-source-popover';

const styles = stylex.create({
    panel: {
        maxHeight: '85vh',
        display: 'flex',
        flexDirection: 'column',
        outline: 'none',
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    monospace: {
        flex: 1,
        width: 'min(90vw, 100ch)',
        minHeight: 0,
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        overflow: 'auto',
    },
});

export function ShaderSource() {
    const compiledShader = useCompiledShader();

    async function copySource(): Promise<void> {
        await navigator.clipboard.writeText(compiledShader.source);
    }

    return (
        <Stack gap="3">
            <Button popoverTarget={POPOVER_ID}>Voir le shader GLSL</Button>

            <div id={POPOVER_ID} popover="manual">
                <Card {...stylex.props(styles.panel)}>
                    <div {...stylex.props(styles.header)}>
                        <Text variant="muted">Fragment shader compilé</Text>
                        <Button popoverTarget={POPOVER_ID}>Fermer</Button>
                    </div>
                    <TextArea
                        rows={20}
                        value={compiledShader.source}
                        disabled
                        readOnly
                        style={styles.monospace}
                    />
                    <Button onClick={copySource}>Copier le source</Button>
                </Card>
            </div>
        </Stack>
    );
}
