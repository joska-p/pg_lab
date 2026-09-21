import * as stylex from '@stylexjs/stylex';
import type { StyleXStyles } from '@stylexjs/stylex';

import { heading } from '../recipes/typography.stylex';
import { space } from '../tokens/layout.stylex';

const styles = stylex.create({
    base: {
        display: 'flex',
        flexDirection: 'column',
        gap: space['4'],
        padding: space['4'],
    },
});

interface ControlPanelProps {
    title?: string;
    label?: string;
    style?: StyleXStyles;
    children?: React.ReactNode;
}

export function ControlPanel({ title, label, style, children }: ControlPanelProps) {
    return (
        <aside aria-label={label ?? title ?? 'control panel'} {...stylex.props(styles.base, style)}>
            {title ? <h2 {...stylex.props(heading.level2)}>{title}</h2> : null}
            {children}
        </aside>
    );
}
