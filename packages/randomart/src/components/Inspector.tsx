import { ControlField } from '@repo/ui/components/ControlField';
import { ControlSection } from '@repo/ui/components/ControlSection';
import { ErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { Stack } from '@repo/ui/components/Stack';
import type { CSSProperties } from 'react';

import { PALETTES } from '../core/color/index.ts';
import { formatFormula } from '../core/expression/index.ts';
import type { Channel } from '../core/expression/index.ts';
import { useExpression, useGrammar } from '../stores/appStore';

const CHANNELS: readonly Channel[] = ['r', 'g', 'b'];

const formulaStyle: CSSProperties = {
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
    fontSize: '0.75rem',
    overflowWrap: 'anywhere',
};

/**
 * The expression, one line per channel: the compiled formula is the reference for understanding an
 * image. In `correlated` mode the three channels are the same field, so it is shown once, with the
 * palette that colours it.
 */
export function Inspector() {
    const expression = useExpression();
    const grammar = useGrammar();

    return (
        <ErrorBoundary showStack={import.meta.env.DEV}>
            <ControlSection title="expression">
                <Stack gap="3">
                    {grammar.color.kind === 'correlated' ? (
                        <ControlField label={`Field → ${PALETTES[grammar.color.palette].label}`}>
                            <div style={formulaStyle}>{formatFormula(expression.r)}</div>
                        </ControlField>
                    ) : (
                        CHANNELS.map((channel) => (
                            <ControlField key={channel} label={`Channel ${channel}`}>
                                <div style={formulaStyle}>{formatFormula(expression[channel])}</div>
                            </ControlField>
                        ))
                    )}
                </Stack>
            </ControlSection>
        </ErrorBoundary>
    );
}
