import * as stylex from '@stylexjs/stylex';

import { surfaceStyles } from '../recipes/surface';
import type { SurfaceProps } from '../recipes/surface';
import { fieldText, heading } from '../recipes/typography';
import { layout, space } from '../tokens/const.stylex';
import type { LayoutStyle } from '../types';

const styles = stylex.create({
    base: {
        display: 'flex',
        alignItems: 'center',
        gap: space['3'],
    },
    // Pastille : la couleur vient de surfaceStyles, le remplissage prend `currentColor`.
    led: {
        display: 'inline-block',
        flexShrink: 0,
        width: layout.ledAtomSize,
        height: layout.ledAtomSize,
        backgroundColor: 'currentColor',
    },
});

interface SectionHeadingProps {
    index?: string;
    title: string;
    color?: SurfaceProps['color'];
    style?: LayoutStyle;
}

export function SectionHeading({ index, title, color = 'neutral', style }: SectionHeadingProps) {
    return (
        <div {...stylex.props(styles.base, style)}>
            <span
                aria-hidden
                {...stylex.props(
                    surfaceStyles({
                        color,
                        background: 'solid',
                        border: 'strong',
                        radius: 'full',
                        elevation: 'flat',
                    }),
                    styles.led,
                )}
            />
            {index ? <span {...stylex.props(fieldText.label)}>{index}</span> : null}
            <h2 {...stylex.props(heading.level1)}>{title}</h2>
        </div>
    );
}
