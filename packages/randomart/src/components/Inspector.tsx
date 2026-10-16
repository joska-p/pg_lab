import { ControlSection } from '@repo/ui/components/ControlSection';
import { ErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { Readout } from '@repo/ui/components/Readout';
import { Stack } from '@repo/ui/components/Stack';

import { formatFormula } from '../core/expression/index.ts';
import type { Channel } from '../core/expression/index.ts';
import { useExpression } from '../stores/appStore';

const CHANNELS: readonly Channel[] = ['r', 'g', 'b'];

/**
 * The expression, one line per channel: the compiled formula is the reference for understanding an
 * image. The node tree, selection and subtree preview of `docs/explorer-spec.md` are not part of
 * this panel (user decision 2026-10-16) — the spec stays a guide, and an explorer will come back
 * under another shape if a real friction asks for it.
 */
export function Inspector() {
    const expression = useExpression();

    return (
        <ErrorBoundary showStack={import.meta.env.DEV}>
            <ControlSection title="expression">
                <Stack gap="3">
                    {CHANNELS.map((channel) => (
                        <Readout
                            key={channel}
                            label={channel.toUpperCase()}
                            value={formatFormula(expression[channel])}
                        />
                    ))}
                </Stack>
            </ControlSection>
        </ErrorBoundary>
    );
}
