import * as stylex from '@stylexjs/stylex';

import { space } from '../const.stylex';
import { heading } from '../styles.stylex';

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
    children?: React.ReactNode;
}

export function ControlPanel({ title, label, children }: ControlPanelProps) {
    return (
        <aside aria-label={label ?? title ?? 'control panel'} {...stylex.props(styles.base)}>
            {title ? <h2 {...stylex.props(heading.level2)}>{title}</h2> : null}
            {children}
        </aside>
    );
}
