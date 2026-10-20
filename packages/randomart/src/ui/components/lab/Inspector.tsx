import { ControlField } from '@repo/ui/components/ControlField';
import { ControlSection } from '@repo/ui/components/ControlSection';
import { ErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { Grid } from '@repo/ui/components/Grid';
import type { CSSProperties } from 'react';

import { COLOR_SPACES } from '../../../core/color/color';
import { formatFormula } from '../../../core/expression/formula';
import type { Channel } from '../../../core/expression/types';
import { constraintsOf } from '../../../core/grammar/grammar';
import { useExpression, useGrammar } from '../../stores/appStore';

const CHANNELS: readonly Channel[] = ['r', 'g', 'b'];

const formulaStyle: CSSProperties = {
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
    fontSize: '0.75rem',
    overflowWrap: 'anywhere',
};

/**
 * The expression, one line per channel: the compiled formula is the reference for understanding an
 * image. When the trunk is shared down to `maxDepth` the three channels are one tree, so it is
 * shown once, with the color space that reads it.
 */
export function Inspector() {
    const expression = useExpression();
    const grammar = useGrammar();
    const { space, shareDepth } = grammar;
    const label = COLOR_SPACES[space].label;
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
