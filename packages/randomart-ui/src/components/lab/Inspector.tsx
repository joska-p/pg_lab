import { colorSpaces } from '@repo/randomart-core/colors';
import { formatFormula } from '@repo/randomart-core/tree';
import { ControlField } from '@repo/ui/components/ControlField';
import { ControlSection } from '@repo/ui/components/ControlSection';
import { ErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { Grid } from '@repo/ui/components/Grid';
import type { CSSProperties } from 'react';

import { useExpression, useGrammar } from '../../stores/randomartStore';

const CHANNELS = ['r', 'g', 'b'] as const;

const formulaStyle: CSSProperties = {
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
    fontSize: '0.75rem',
    overflowWrap: 'anywhere',
};

export function Inspector() {
    const expression = useExpression();
    const grammar = useGrammar();
    const { space, shareDepth, maxDepth } = grammar;
    const label = colorSpaces[space].label;
    const mono = shareDepth >= maxDepth;

    return (
        <ErrorBoundary showStack={import.meta.env.DEV}>
            <ControlSection title="expression">
                <Grid columns="1" gap="3">
                    {mono ? (
                        <ControlField label={`Field (${label})`}>
                            <div style={formulaStyle}>{formatFormula(expression.r)}</div>
                        </ControlField>
                    ) : (
                        CHANNELS.map((channel) => (
                            <ControlField key={channel} label={`Channel ${channel} (${label})`}>
                                <div style={formulaStyle}>{formatFormula(expression[channel])}</div>
                            </ControlField>
                        ))
                    )}
                </Grid>
            </ControlSection>
        </ErrorBoundary>
    );
}
