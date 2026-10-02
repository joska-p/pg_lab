import * as stylex from '@stylexjs/stylex';

import { surfaceStyles } from '../recipes/surface';
import type { SurfaceProps } from '../recipes/surface';
import { fieldText } from '../recipes/typography';
import { layout, space } from '../tokens/const.stylex';
import type { LayoutStyle } from '../types';

const styles = stylex.create({
    base: {
        display: 'flex',
        flexDirection: 'column',
        gap: space['1'],
        flex: 1,
        minWidth: layout.swatchMinWidth,
    },
    box: {
        height: layout.swatchHeight,
    },
});

// Un Swatch montre maintenant le rendu d'une combinaison de la recette de surface,
// au lieu d'une couleur brute de token.
interface SwatchProps extends SurfaceProps {
    name?: string;
    meta?: string;
    style?: LayoutStyle;
}

export function Swatch({
    color = 'neutral',
    background = 'solid',
    border = 'strong',
    radius = 'sm',
    elevation = 'flat',
    name,
    meta,
    style,
}: SwatchProps) {
    return (
        <div {...stylex.props(styles.base, style)}>
            <div
                aria-hidden
                {...stylex.props(
                    styles.box,
                    surfaceStyles({ color, background, border, radius, elevation }),
                )}
            />
            <span {...stylex.props(fieldText.label)}>{name ?? `${color} / ${background}`}</span>
            {meta ? <span {...stylex.props(fieldText.value)}>{meta}</span> : null}
        </div>
    );
}
