import * as stylex from '@stylexjs/stylex';
import type { StyleXStyles } from '@stylexjs/stylex';

import { heading } from '../recipes/typography';
import { space } from '../tokens/const.stylex';

const styles = stylex.create({
    base: {
        display: 'flex',
        flexDirection: 'column',
        gap: space['4'],
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: space['3'],
    },
});

interface ControlPanelProps extends Omit<React.ComponentProps<'aside'>, 'style' | 'className'> {
    title?: string;
    label?: string;
    action?: React.ReactNode;
    style?: StyleXStyles;
    children?: React.ReactNode;
}

export function ControlPanel({
    title,
    label,
    action,
    children,
    style,
    ...props
}: ControlPanelProps) {
    return (
        <aside
            {...props}
            aria-label={label ?? title ?? 'control panel'}
            {...stylex.props(styles.base, style)}
        >
            {title || action ? (
                <div {...stylex.props(styles.header)}>
                    {title ? <h2 {...stylex.props(heading.level2)}>{title}</h2> : null}
                    {action}
                </div>
            ) : null}
            {children}
        </aside>
    );
}
