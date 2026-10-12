import { surfaceStyles } from '@repo/ui/recipes/surface';
import { fieldText, heading } from '@repo/ui/recipes/typography';
import { space } from '@repo/ui/tokens/const.stylex';
import * as stylex from '@stylexjs/stylex';

import { toMathString } from '../../core';
import { useSelectedTree } from '../../stores/randomart/selectors';

const styles = stylex.create({
    section: {
        display: 'flex',
        flexDirection: 'column',
        gap: space['2'],
    },
    code: {
        padding: space['4'],
        overflowX: 'auto',
        whiteSpace: 'normal',
        wordBreak: 'break-all',
        lineHeight: 1.5,
    },
});

export function MathFormula() {
    const selectedTree = useSelectedTree();

    return (
        <div {...stylex.props(styles.section)}>
            <h4 {...stylex.props(heading.level3)}>Evaluated Math String Formula</h4>
            <div
                {...stylex.props(
                    surfaceStyles({ background: 'soft', elevation: 'sunken' }),
                    fieldText.value,
                    styles.code,
                )}
            >
                f(x, y) = {toMathString(selectedTree)}
            </div>
        </div>
    );
}
