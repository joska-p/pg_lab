import { space } from '@repo/ui/tokens/const.stylex';
import * as stylex from '@stylexjs/stylex';

import { AstTreeView } from './AstTreeView';
import { ChannelTabs } from './ChannelTabs';
import { MathFormula } from './MathFormula';

const styles = stylex.create({
    root: {
        display: 'flex',
        flexDirection: 'column',
        gap: space['5'],
    },
});

export function InspectorPanel() {
    return (
        <div {...stylex.props(styles.root)}>
            <ChannelTabs />
            <MathFormula />
            <AstTreeView />
        </div>
    );
}
