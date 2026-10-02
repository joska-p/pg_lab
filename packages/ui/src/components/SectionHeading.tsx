import * as stylex from '@stylexjs/stylex';

import type { SurfaceProps } from '../recipes/surface';
import { heading } from '../recipes/typography';
import { space } from '../tokens/const.stylex';
import type { LayoutStyle } from '../types';
import { Led } from './Led';

const styles = stylex.create({
    base: {
        display: 'flex',
        alignItems: 'center',
        gap: space['3'],
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
            {/* Pastille de couleur — delègue au composant Led pour cohérence système. */}
            <Led color={color} />
            {index ? <span {...stylex.props(heading.level3)}>{index}</span> : null}
            <h2 {...stylex.props(heading.level1)}>{title}</h2>
        </div>
    );
}
