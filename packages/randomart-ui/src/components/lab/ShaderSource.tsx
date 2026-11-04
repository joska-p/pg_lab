import { Button } from '@repo/ui/components/Button';
import { Card } from '@repo/ui/components/Card';
import { Stack } from '@repo/ui/components/Stack';
import { Text } from '@repo/ui/components/Text';
import { TextArea } from '@repo/ui/components/TextArea';
import * as stylex from '@stylexjs/stylex';

import { useCompiledShader } from '../../stores/artworkStore';

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
        try {
            await navigator.clipboard.writeText(compiledShader.source);
        } catch {
            // Clipboard API can fail (permissions, context); fail silently per UX decision.
        }
    }

    function closePopover(popover: HTMLElement): void {
        popover.hidePopover();
    }

    return (
        <Stack gap="3">
            <Button popoverTarget={POPOVER_ID}>View GLSL shader</Button>

            <div id={POPOVER_ID} popover="manual">
                <Card {...stylex.props(styles.panel)}>
                    <div {...stylex.props(styles.header)}>
                        <Text variant="muted">Compiled fragment shader</Text>
                        <Button
                            popoverTarget={POPOVER_ID}
                            onClick={(_event) => {
                                const popover = document.getElementById(POPOVER_ID);
                                if (popover) {
                                    closePopover(popover);
                                }
                            }}
                        >
                            Close
                        </Button>
                    </div>
                    <TextArea
                        rows={20}
                        value={compiledShader.source}
                        readOnly
                        {...stylex.props(styles.monospace)}
                    />
                    <Button onClick={copySource}>Copy source</Button>
                </Card>
            </div>
        </Stack>
    );
}
