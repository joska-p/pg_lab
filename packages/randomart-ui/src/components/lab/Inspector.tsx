import { colorSpaces } from '@repo/randomart-core/colors';
import { isMono } from '@repo/randomart-core/grammar';
import { formatFormula } from '@repo/randomart-core/tree';
import { ControlField } from '@repo/ui/components/ControlField';
import { ControlSection } from '@repo/ui/components/ControlSection';
import { ErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { Grid } from '@repo/ui/components/Grid';
import * as stylex from '@stylexjs/stylex';

import { useExpression, useGrammar } from '../../stores/artworkStore';

const CHANNELS = ['r', 'g', 'b'] as const;

const styles = stylex.create({
    formula: {
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
        fontSize: '0.75rem',
        overflowWrap: 'anywhere',
    },
});

export function Inspector() {
    const expression = useExpression();
    const grammar = useGrammar();
    const { space } = grammar;
    const label = colorSpaces[space].label;
    const mono = isMono(grammar);

    return (
        <ErrorBoundary showStack={import.meta.env.DEV}>
            <ControlSection title="expression">
                <Grid columns="1" gap="3">
                    {mono ? (
                        <ControlField label={`Field (${label})`}>
                            <div {...stylex.props(styles.formula)}>
                                {formatFormula(expression.r)}
                            </div>
                        </ControlField>
                    ) : (
                        CHANNELS.map((channel) => (
                            <ControlField key={channel} label={`Channel ${channel} (${label})`}>
                                <div {...stylex.props(styles.formula)}>
                                    {formatFormula(expression[channel])}
                                </div>
                            </ControlField>
                        ))
                    )}
                </Grid>
            </ControlSection>
        </ErrorBoundary>
    );
}
