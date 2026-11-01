import { colorSpaceRegistry, constraintsOf, formatFormula } from '@repo/randomart-vm';
import type { ColorSpaceId } from '@repo/randomart-vm';
import { ControlField } from '@repo/ui/components/ControlField';
import { ControlSection } from '@repo/ui/components/ControlSection';
import { ErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { Grid } from '@repo/ui/components/Grid';
import type { CSSProperties } from 'react';

import { useExpression, useGrammar } from '../../stores/vmStore';

const CHANNELS = ['r', 'g', 'b'] as const;

const formulaStyle: CSSProperties = {
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
    fontSize: '0.75rem',
    overflowWrap: 'anywhere',
};

export function Inspector() {
    const expression = useExpression();
    const grammar = useGrammar();
    const { space, shareDepth } = grammar;
    const spaceInfo = colorSpaceRegistry[space as ColorSpaceId];
    const label = spaceInfo ? spaceInfo.label : space;
    const mono = shareDepth >= constraintsOf(grammar.size).maxDepth;

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
