import { Button } from '@repo/ui/components/Button';
import { Card } from '@repo/ui/components/Card';
import { Stack } from '@repo/ui/components/Stack';
import { Text } from '@repo/ui/components/Text';
import { TextArea } from '@repo/ui/components/TextArea';
import * as stylex from '@stylexjs/stylex';
import { useEffect, useRef, useState } from 'react';

import { useCompiledShader } from '../../stores/artworkStore';

const POPOVER_ID = 'shader-source-popover';
const FEEDBACK_DURATION_MS = 1500;

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
    const [open, setOpen] = useState(false);
    const [feedback, setFeedback] = useState<string | null>(null);
    const popoverRef = useRef<HTMLDivElement>(null);

    // `popover="manual"` has no light dismiss and no Escape handling: the browser only manages it
    // when it is `auto`. Provide both while it is open.
    useEffect(() => {
        if (!open) {
            return;
        }

        function closeOnEscape(event: KeyboardEvent): void {
            if (event.key === 'Escape') {
                popoverRef.current?.hidePopover();
            }
        }

        function closeOnOutsidePointer(event: PointerEvent): void {
            const target = event.target;

            if (!(target instanceof Element)) {
                return;
            }

            if (popoverRef.current?.contains(target) === true) {
                return;
            }

            // The invoker already toggles the popover on click; closing it here would reopen it.
            if (target.closest(`[popovertarget="${POPOVER_ID}"]`)) {
                return;
            }

            popoverRef.current?.hidePopover();
        }

        document.addEventListener('keydown', closeOnEscape);
        document.addEventListener('pointerdown', closeOnOutsidePointer);

        return () => {
            document.removeEventListener('keydown', closeOnEscape);
            document.removeEventListener('pointerdown', closeOnOutsidePointer);
        };
    }, [open]);

    useEffect(() => {
        if (feedback === null) {
            return;
        }

        const timeout = setTimeout(() => {
            setFeedback(null);
        }, FEEDBACK_DURATION_MS);

        return () => {
            clearTimeout(timeout);
        };
    }, [feedback]);

    async function copySource(): Promise<void> {
        try {
            await navigator.clipboard.writeText(compiledShader.source);
            setFeedback('Copied');
        } catch {
            // Clipboard API can fail (permissions, context).
            setFeedback('Copy failed');
        }
    }

    return (
        <Stack gap="3">
            <Button popoverTarget={POPOVER_ID}>View GLSL shader</Button>

            <div
                id={POPOVER_ID}
                ref={popoverRef}
                popover="manual"
                onToggle={(event) => {
                    setOpen(event.newState === 'open');
                }}
            >
                <Card style={styles.panel}>
                    <div {...stylex.props(styles.header)}>
                        <Text variant="muted">Compiled fragment shader</Text>
                        <Button popoverTarget={POPOVER_ID} popoverTargetAction="hide">
                            Close
                        </Button>
                    </div>
                    {open && (
                        <TextArea
                            rows={20}
                            value={compiledShader.source}
                            readOnly
                            style={styles.monospace}
                        />
                    )}
                    <Button
                        onClick={() => {
                            void copySource();
                        }}
                    >
                        {feedback ?? 'Copy source'}
                    </Button>
                </Card>
            </div>
        </Stack>
    );
}
