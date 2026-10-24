import * as stylex from '@stylexjs/stylex';

import { colors } from '../../tokens/tint.stylex';
import type { ColorNames } from '../../tokens/tint.stylex';
import { generateAtlasPaths } from './generateAtlasPaths';

const styles = stylex.create({
    base: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
    },
});

interface AtlasPathsProps extends React.ComponentProps<'svg'> {
    seed?: number;
    color?: ColorNames;
}

export function AtlasPaths({ seed = 42, color = 'amber' }: AtlasPathsProps) {
    const paths = generateAtlasPaths(seed);

    const pathColor = colors[color];

    return (
        <svg viewBox="0 0 300 300" preserveAspectRatio="none" {...stylex.props(styles.base)}>
            <path
                d={paths.openPaths}
                fill="none"
                stroke={pathColor}
                strokeWidth="0.6"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d={paths.closedPaths}
                fill="none"
                stroke={pathColor}
                strokeWidth="0.6"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            {paths.dots.map((dot, i) => (
                <circle key={i} cx={dot.cx} cy={dot.cy} r={dot.r} fill={pathColor} />
            ))}
        </svg>
    );
}
