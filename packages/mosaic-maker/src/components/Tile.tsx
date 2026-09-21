import * as stylex from '@stylexjs/stylex';
import type { StyleXStyles } from '@stylexjs/stylex';

import { TILE_REGISTRY, type Shape } from '../core/tile-registry';

const styles = stylex.create({
    base: {
        flexShrink: 0,
        overflow: 'hidden',
        transitionProperty: 'transform, opacity',
        transitionDuration: {
            default: '500ms',
            '@media (prefers-reduced-motion: reduce)': '0ms',
        },
        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
    },
});

const shapeStyles = stylex.create({
    base: {
        transitionProperty: 'fill, opacity',
        transitionDuration: {
            default: '500ms',
            '@media (prefers-reduced-motion: reduce)': '0ms',
        },
    },
});

function ShapeRenderer({ shape, colors }: { shape: Shape; colors: string[] }) {
    const commonProps = {
        fill: `var(${colors[shape.colorIndex]})`,
        ...stylex.props(shapeStyles.base),
    };

    switch (shape.type) {
        case 'circle':
            return <circle cx={shape.cx} cy={shape.cy} r={shape.r} {...commonProps} />;
        case 'rect':
            return (
                <rect
                    x={shape.x}
                    y={shape.y}
                    width={shape.width}
                    height={shape.height}
                    {...commonProps}
                />
            );
        case 'path':
            return <path d={shape.d} {...commonProps} />;
        case 'polygon':
            return <polygon points={shape.points} {...commonProps} />;
        default:
            return null;
    }
}

function Tile({ name, colors, rotation, style }: TileProps) {
    const definition = TILE_REGISTRY[name];

    return (
        <svg
            viewBox="0 0 100 100"
            aria-hidden="true"
            focusable="false"
            {...stylex.props(styles.base, style)}
            style={{
                width: 'var(--tile-size)',
                height: 'var(--tile-size)',
                transform: `rotate(var(${rotation}))`,
            }}
        >
            {definition.shapes.map((shape, index) => (
                <ShapeRenderer key={`${name}-${String(index)}`} shape={shape} colors={colors} />
            ))}
        </svg>
    );
}

type TileProps = {
    name: string;
    colors: [string, string, string, string, string];
    rotation: string;
    style?: StyleXStyles;
};

Tile.displayName = 'Tile';

export { Tile };
