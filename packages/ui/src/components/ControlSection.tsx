import * as stylex from '@stylexjs/stylex';
import type { StyleXStyles } from '@stylexjs/stylex';
import { useId } from 'react';

import { heading } from '../recipes/typography.stylex';
import { space } from '../tokens/layout.stylex';

const styles = stylex.create({
    base: {
        display: 'flex',
        flexDirection: 'column',
        gap: space['3'],
    },
});

type ControlSectionProps = {
    title: string;
    style?: StyleXStyles;
    children?: React.ReactNode;
};

export function ControlSection({ title, style, children }: ControlSectionProps) {
    const titleId = useId();
    return (
        <section aria-labelledby={titleId} {...stylex.props(styles.base, style)}>
            <h3 id={titleId} {...stylex.props(heading.level3)}>
                {title}
            </h3>
            {children}
        </section>
    );
}
